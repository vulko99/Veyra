"""The matching engine.

    match_application(application) -> dict

Pipeline:
    application -> active products -> eligibility rules -> eligible products
                -> scoring -> ranking -> top N matches

The engine is data-driven: eligibility comes from product ranges plus generic
EligibilityRule rows. No lender-specific code paths exist.
"""
from __future__ import annotations

import re
from decimal import Decimal

from django.conf import settings
from django.db import transaction

from apps.applications.models import Application
from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.lenders.models import EligibilityRule, LenderProduct

from .models import Match, MatchStatus
from .rules import RuleOutcome, evaluate_rule_outcome, to_number
from .scoring import score_match


def age_from_range(age_range) -> int | None:
    """Best-effort numeric age from a free-form band like "25-34" or "30".

    Uses the lower bound of the band. Returns None when nothing numeric is
    present, so the age criterion is reported UNKNOWN rather than failed.
    """
    if not age_range:
        return None
    match = re.search(r"\d+", str(age_range))
    return int(match.group()) if match else None


def build_context(application: Application) -> dict:
    """Normalise an application into the flat field namespace rules reference."""
    return {
        "requested_amount": application.requested_amount,
        "requested_term_months": application.requested_term_months,
        "monthly_income": application.monthly_income,
        "employment_type": application.employment_type,
        "employment_months": application.employment_months,
        "existing_debt": application.existing_loan_balance or Decimal("0"),
        "monthly_debt_payment": application.existing_monthly_payments or Decimal("0"),
        "loan_purpose": application.purpose,
        "age": age_from_range(application.age_range),
    }


# Severity ordering so that, if several rules touch the same field, the worst
# outcome wins in the compact evaluation map.
_OUTCOME_RANK = {
    RuleOutcome.PASS: 0,
    RuleOutcome.UNKNOWN: 1,
    RuleOutcome.FAIL: 2,
}


def _worst(current: str | None, candidate: str) -> str:
    if current is None:
        return candidate
    return candidate if _OUTCOME_RANK[candidate] > _OUTCOME_RANK[current] else current


def _reason(
    text: str,
    show_to_customer: bool = True,
    *,
    code: str = "",
    params: dict | None = None,
) -> dict:
    """Build a reason entry.

    ``code`` is a stable, language-neutral identifier the frontend localizes
    (with ``params`` interpolated). ``text`` is an English fallback used for
    logging/tests and when no localized string exists for the code.
    """
    return {
        "text": text,
        "code": code,
        "params": params or {},
        "show_to_customer": show_to_customer,
    }


def evaluate_product(context: dict, product: LenderProduct) -> tuple[bool, list[dict]]:
    """Return (eligible, reasons) for a single product (compatibility shim)."""
    result = evaluate_product_detailed(context, product)
    return result["eligible"], result["reasons"]


def evaluate_product_detailed(context: dict, product: LenderProduct) -> dict:
    """Evaluate a product against an applicant, three-state.

    Returns a dict with:
        eligible        bool  — no hard failure (mandatory-unknown counts as fail)
        status          str   — ELIGIBLE / INELIGIBLE / UNKNOWN (MatchStatus)
        reasons         list  — reason objects (may contain internal-only text)
        evaluation      dict  — compact {criterion: PASS/FAIL/UNKNOWN}
        reason_summary  str   — short neutral summary (never an approval claim)

    Built-in range checks (amount, term, income, age) are applied first, then
    any active EligibilityRule rows are evaluated generically. Missing data is
    reported UNKNOWN and only excludes the product when the rule is mandatory.
    """
    reasons: list[dict] = []
    evaluation: dict[str, str] = {}
    failed: list[str] = []
    unknown: list[str] = []

    # --- amount (core request field) ---
    amount = context.get("requested_amount")
    if amount is None or not (product.min_amount <= amount <= product.max_amount):
        evaluation["amount"] = str(RuleOutcome.FAIL)
        failed.append("amount")
        reasons.append(
            _reason(
                f"Requested amount is outside the product range "
                f"({product.min_amount}–{product.max_amount} {product.currency}).",
                code="amount_out_of_range",
                params={
                    "min": str(product.min_amount),
                    "max": str(product.max_amount),
                    "currency": product.currency,
                },
            )
        )
    else:
        evaluation["amount"] = str(RuleOutcome.PASS)
        reasons.append(
            _reason("Requested amount fits the product range.", code="amount_in_range")
        )

    # --- term (core request field) ---
    term = context.get("requested_term_months")
    if term is None or not (product.min_term_months <= term <= product.max_term_months):
        evaluation["term"] = str(RuleOutcome.FAIL)
        failed.append("term")
        reasons.append(
            _reason(
                f"Requested term is outside the product range "
                f"({product.min_term_months}–{product.max_term_months} months).",
                code="term_out_of_range",
                params={
                    "min": product.min_term_months,
                    "max": product.max_term_months,
                },
            )
        )
    else:
        evaluation["term"] = str(RuleOutcome.PASS)
        reasons.append(
            _reason("Requested term fits the product range.", code="term_in_range")
        )

    # --- income (only when the product publishes a minimum) ---
    if product.min_income:
        income = context.get("monthly_income")
        if income is None:
            evaluation["income"] = str(RuleOutcome.UNKNOWN)
            unknown.append("income")
            reasons.append(
                _reason(
                    "Income was not provided, so this product could not be confirmed.",
                    code="income_unknown",
                )
            )
        elif Decimal(str(income)) < product.min_income:
            evaluation["income"] = str(RuleOutcome.FAIL)
            failed.append("income")
            reasons.append(
                _reason(
                    "Stated income is below the published minimum for this product.",
                    code="income_below_min",
                )
            )
        else:
            evaluation["income"] = str(RuleOutcome.PASS)
            reasons.append(
                _reason(
                    "Your stated income meets the published minimum.",
                    code="income_meets_min",
                )
            )

    # --- age (only when the product publishes a bound) ---
    if product.min_age is not None or product.max_age is not None:
        age = to_number(context.get("age"))
        if age is None:
            evaluation["age"] = str(RuleOutcome.UNKNOWN)
            unknown.append("age")
            reasons.append(
                _reason(
                    "Age was not provided.",
                    show_to_customer=False,
                    code="age_unknown",
                )
            )
        elif (product.min_age is not None and age < product.min_age) or (
            product.max_age is not None and age > product.max_age
        ):
            evaluation["age"] = str(RuleOutcome.FAIL)
            failed.append("age")
            reasons.append(
                _reason(
                    "Age is outside the range for this product.",
                    show_to_customer=False,
                    code="age_out_of_range",
                )
            )
        else:
            evaluation["age"] = str(RuleOutcome.PASS)
            reasons.append(
                _reason("Age fits this product.", show_to_customer=False, code="age_ok")
            )

    # --- generic, configurable rules ---
    for rule in product.eligibility_rules.filter(active=True):
        actual = context.get(rule.field)
        outcome = evaluate_rule_outcome(rule.operator, actual, rule.value)
        evaluation[rule.field] = _worst(evaluation.get(rule.field), str(outcome))

        if outcome == RuleOutcome.FAIL:
            failed.append(rule.field)
        elif outcome == RuleOutcome.UNKNOWN:
            # A missing value only rejects when the rule explicitly requires it.
            (failed if rule.mandatory else unknown).append(rule.field)

        if rule.reason_template:
            # Custom lender-authored text has no generic code; shown verbatim.
            reasons.append(
                _reason(
                    rule.reason_template,
                    show_to_customer=rule.show_reason_to_customer,
                    code="",
                )
            )
        else:
            reasons.append(
                _reason(
                    _default_rule_reason(rule, outcome),
                    show_to_customer=rule.show_reason_to_customer,
                    code=_RULE_CODE[outcome],
                    params={"field": rule.field},
                )
            )

    eligible = not failed
    if failed:
        status = str(MatchStatus.INELIGIBLE)
    elif unknown:
        status = str(MatchStatus.UNKNOWN)
    else:
        status = str(MatchStatus.ELIGIBLE)

    return {
        "eligible": eligible,
        "status": status,
        "reasons": reasons,
        "evaluation": evaluation,
        "reason_summary": _reason_summary(status, failed),
    }


_RULE_CODE = {
    RuleOutcome.PASS: "rule_pass",
    RuleOutcome.FAIL: "rule_fail",
    RuleOutcome.UNKNOWN: "rule_unknown",
}


def _default_rule_reason(rule: EligibilityRule, outcome: str) -> str:
    field = rule.field.replace("_", " ")
    if outcome == RuleOutcome.PASS:
        return f"Your {field} meets this product's requirement."
    if outcome == RuleOutcome.UNKNOWN:
        return f"Your {field} was not provided."
    return f"Your {field} does not meet this product's requirement."


def _reason_summary(status: str, failed: list[str]) -> str:
    if status == str(MatchStatus.ELIGIBLE):
        return "Съответствие с публикуваните критерии"
    if status == str(MatchStatus.UNKNOWN):
        return "Съответствие според наличните данни"
    return "Не съответства на: " + ", ".join(dict.fromkeys(failed))


@transaction.atomic
def match_application(application: Application, top_n: int | None = None) -> dict:
    """Evaluate all active products, persist Match rows, return the result dict."""
    if top_n is None:
        top_n = getattr(settings, "MATCHING_TOP_N", 3)

    context = build_context(application)

    products = (
        LenderProduct.objects.filter(active=True, lender__active=True)
        .select_related("lender")
        .prefetch_related("eligibility_rules")
    )

    evaluated = []
    for product in products:
        result = evaluate_product_detailed(context, product)
        eligible = result["eligible"]
        score = score_match(context, product) if eligible else 0
        evaluated.append((product, eligible, score, result))

    # Rank eligible products by score desc, then lender priority desc.
    eligible_sorted = sorted(
        [e for e in evaluated if e[1]],
        key=lambda e: (e[2], e[0].lender.priority),
        reverse=True,
    )

    # Replace any prior matches for this application (idempotent re-matching).
    Match.objects.filter(application=application).delete()

    results = []
    rank_by_product = {}
    for idx, (product, _eligible, score, _result) in enumerate(
        eligible_sorted[:top_n], start=1
    ):
        rank_by_product[product.id] = (idx, score)

    matches_out = []
    for product, eligible, score, result in evaluated:
        rank = None
        if product.id in rank_by_product:
            rank, score = rank_by_product[product.id]
        match = Match.objects.create(
            application=application,
            lender=product.lender,
            product=product,
            eligible=eligible,
            status=result["status"],
            score=score,
            rank=rank,
            evaluation=result["evaluation"],
            reason_summary=result["reason_summary"],
            reasons=result["reasons"],
        )
        matches_out.append(match)

    for match in matches_out:
        if match.rank is not None:
            results.append(_serialize_match(match))

    results.sort(key=lambda r: r["rank"])

    record_audit(
        action=AuditAction.MATCH_CREATED,
        entity_type="Application",
        entity_id=application.id,
        actor_label="system:matching",
        metadata={"eligible_count": len(eligible_sorted), "returned": len(results)},
    )

    return {"application_id": str(application.id), "matches": results}


def _serialize_match(match: Match) -> dict:
    return {
        "lender_id": str(match.lender_id),
        "product_id": str(match.product_id),
        "eligible": match.eligible,
        "score": match.score,
        "rank": match.rank,
        "reasons": match.customer_reasons,
    }
