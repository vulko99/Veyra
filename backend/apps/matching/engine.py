"""The matching engine.

    match_application(application) -> dict

Pipeline:
    application -> active products -> eligibility rules -> eligible products
                -> scoring -> ranking -> top N matches

The engine is data-driven: eligibility comes from product ranges plus generic
EligibilityRule rows. No lender-specific code paths exist.
"""
from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import transaction

from apps.applications.models import Application
from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.lenders.models import EligibilityRule, LenderProduct

from .models import Match
from .rules import evaluate_rule
from .scoring import score_match


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
    }


def _reason(text: str, show_to_customer: bool = True) -> dict:
    return {"text": text, "show_to_customer": show_to_customer}


def evaluate_product(context: dict, product: LenderProduct) -> tuple[bool, list[dict]]:
    """Return (eligible, reasons) for a single product.

    Built-in range checks (amount, term, income) are always applied. Then any
    active EligibilityRule rows for the product are evaluated generically.
    """
    reasons: list[dict] = []
    eligible = True

    amount = context.get("requested_amount")
    if amount is None or not (product.min_amount <= amount <= product.max_amount):
        eligible = False
        reasons.append(
            _reason(
                f"Requested amount is outside the product range "
                f"({product.min_amount}–{product.max_amount} {product.currency}).",
            )
        )
    else:
        reasons.append(_reason("Requested amount fits the product range."))

    term = context.get("requested_term_months")
    if term is None or not (product.min_term_months <= term <= product.max_term_months):
        eligible = False
        reasons.append(
            _reason(
                f"Requested term is outside the product range "
                f"({product.min_term_months}–{product.max_term_months} months).",
            )
        )
    else:
        reasons.append(_reason("Requested term fits the product range."))

    income = context.get("monthly_income")
    if product.min_income:
        if income is None or Decimal(str(income)) < product.min_income:
            eligible = False
            reasons.append(
                _reason("Stated income is below the published minimum for this product.")
            )
        else:
            reasons.append(_reason("Your stated income meets the published minimum."))

    # Generic, configurable rules.
    rules = product.eligibility_rules.filter(active=True)
    for rule in rules:
        actual = context.get(rule.field)
        passed = evaluate_rule(rule.operator, actual, rule.value)
        if not passed:
            eligible = False
        if rule.reason_template:
            text = rule.reason_template
        else:
            text = _default_rule_reason(rule, passed)
        reasons.append(_reason(text, show_to_customer=rule.show_reason_to_customer))

    return eligible, reasons


def _default_rule_reason(rule: EligibilityRule, passed: bool) -> str:
    field = rule.field.replace("_", " ")
    if passed:
        return f"Your {field} meets this product's requirement."
    return f"Your {field} does not meet this product's requirement."


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
        eligible, reasons = evaluate_product(context, product)
        score = score_match(context, product) if eligible else 0
        evaluated.append((product, eligible, score, reasons))

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
    for idx, (product, _eligible, score, _reasons) in enumerate(
        eligible_sorted[:top_n], start=1
    ):
        rank_by_product[product.id] = (idx, score)

    matches_out = []
    for product, eligible, score, reasons in evaluated:
        rank = None
        if product.id in rank_by_product:
            rank, score = rank_by_product[product.id]
        match = Match.objects.create(
            application=application,
            lender=product.lender,
            product=product,
            eligible=eligible,
            score=score,
            rank=rank,
            reasons=reasons,
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
