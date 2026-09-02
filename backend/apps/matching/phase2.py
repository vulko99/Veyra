"""Phase 2 matching service.

Deterministic pipeline:
    1. validate required application data
    2. check required consent
    3. load active partner products
    4. evaluate eligibility rules (built-in ranges + configurable rules)
    5. exclude products where hard requirements fail
    6. rank remaining matches by configurable priority
    7. return structured results and persist a Match (MatchResult) per product

The engine never exposes "approval probability" and never claims approval.
Customer-facing phrasing: "Подходящо според публикуваните критерии".
"""
from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import transaction

from apps.applications.events import record_event
from apps.applications.models import (
    Application,
    ApplicationEventType,
    ApplicationStatus,
)
from apps.consents.services import has_required_consents
from apps.core.exceptions import VeyraAPIError
from apps.lenders.models import LenderProduct

from .engine import age_from_range, evaluate_product_detailed
from .models import Match
from .scoring import score_match


def build_context_v2(application: Application) -> dict:
    """Normalise an application + its applicant into the rule field namespace."""
    applicant = application.applicant
    income = None
    employment = ""
    obligations = Decimal("0")
    if applicant is not None:
        income = applicant.monthly_income_eur
        employment = applicant.employment_status
        obligations = applicant.existing_monthly_obligations_eur or Decimal("0")
    # Fall back to any legacy inline values on the application.
    if income is None:
        income = application.monthly_income
    if not employment:
        employment = application.employment_type
    if not obligations:
        obligations = application.existing_monthly_payments or Decimal("0")

    return {
        "requested_amount": application.requested_amount,
        "requested_term_months": application.requested_term_months,
        "monthly_income": income,
        "employment_type": employment,
        "employment_months": application.employment_months,
        "existing_debt": obligations,
        "monthly_debt_payment": obligations,
        "loan_purpose": application.purpose,
        "age": age_from_range(application.age_range),
    }


def _validate(application: Application) -> None:
    missing = []
    if application.requested_amount is None:
        missing.append("desired_amount_eur")
    if not application.requested_term_months:
        missing.append("desired_term_months")
    if application.applicant is None or application.applicant.monthly_income_eur is None:
        missing.append("monthly_income_eur")
    if missing:
        raise VeyraAPIError(
            code="INCOMPLETE_APPLICATION",
            message="Required application data is missing.",
            details={"missing": missing},
            http_status=400,
        )
    if not has_required_consents(application):
        raise VeyraAPIError(
            code="CONSENT_REQUIRED",
            message="Required consent has not been granted.",
            http_status=400,
        )


@transaction.atomic
def match_application_v2(application: Application) -> list[dict]:
    """Run matching and return a ranked list of eligible partner products."""
    _validate(application)
    record_event(application, ApplicationEventType.MATCHING_STARTED)

    context = build_context_v2(application)

    products_qs = LenderProduct.objects.filter(active=True, lender__active=True)
    # Demo partners participate only while DEMO_MODE is on. In production
    # (DEMO_MODE off) they disappear and only real partners are matched — the
    # engine itself is unchanged; it just reads different partner configuration.
    if not getattr(settings, "DEMO_MODE", True):
        products_qs = products_qs.filter(lender__is_demo=False)
    products = list(
        products_qs.select_related("lender").prefetch_related("eligibility_rules")
    )

    threshold = getattr(settings, "MATCH_THRESHOLD", 80)

    evaluated = []
    for product in products:
        result = evaluate_product_detailed(context, product)
        # Compatibility score (0-100). NOT a probability of approval.
        compatibility = score_match(context, product) if result["eligible"] else 0
        # Partner-specific minimum overrides the global threshold when configured.
        min_score = product.lender.effective_min_score(threshold)
        # Referral-eligible = passes hard criteria AND meets the threshold.
        referral_eligible = result["eligible"] and compatibility >= min_score
        evaluated.append((product, result, compatibility, min_score, referral_eligible))

    # Multi-partner marketplace model: ALL referral-eligible partners, sorted by
    # score descending (priority breaks ties). No winner-takes-all.
    eligible_sorted = sorted(
        [e for e in evaluated if e[4]],
        key=lambda e: (-e[2], -e[0].priority, e[0].lender.display_order, str(e[0].id)),
    )
    rank_by_product = {
        product.id: idx
        for idx, (product, _r, _c, _m, _re) in enumerate(eligible_sorted, start=1)
    }

    # Persist a Match (MatchResult) for every evaluated product (audit trail:
    # score, threshold used, eligibility, reasons).
    Match.objects.filter(application=application).delete()
    for product, result, compatibility, min_score, referral_eligible in evaluated:
        Match.objects.create(
            application=application,
            lender=product.lender,
            product=product,
            eligible=result["eligible"],
            referral_eligible=referral_eligible,
            status=result["status"],
            score=compatibility,
            threshold_used=min_score,
            rank=rank_by_product.get(product.id),
            evaluation=result["evaluation"],
            reason_summary=result["reason_summary"],
            reasons=result["reasons"],
        )

    results = [
        _serialize(
            product,
            result["reasons"],
            rank_by_product[product.id],
            compatibility,
            min_score,
        )
        for product, result, compatibility, min_score, referral_eligible in evaluated
        if referral_eligible
    ]
    results.sort(key=lambda r: r["ranking"])

    if application.status in (
        ApplicationStatus.STARTED,
        ApplicationStatus.IN_PROGRESS,
        ApplicationStatus.COMPLETED,
        ApplicationStatus.SUBMITTED,
    ):
        application.status = ApplicationStatus.MATCHED
        application.save(update_fields=["status", "updated_at"])

    record_event(
        application,
        ApplicationEventType.MATCHING_COMPLETED,
        {"evaluated": len(evaluated), "matched": len(results)},
    )
    return results


def _serialize(
    product: LenderProduct,
    reasons: list[dict],
    ranking: int,
    compatibility: int = 0,
    threshold: int | None = None,
) -> dict:
    customer_reasons = [
        {"code": r.get("code", ""), "params": r.get("params", {}), "text": r.get("text", "")}
        for r in reasons
        if r.get("show_to_customer", True) and (r.get("code") or r.get("text"))
    ]
    return {
        "partner": product.lender.public_name,
        "partner_slug": product.lender.slug,
        # Whether this partner needs the applicant's EGN to proceed. Drives the
        # post-selection identity step. Partner-specific, never global.
        "egn_required": product.lender.egn_required,
        "is_demo": product.lender.is_demo,
        "product": product.name,
        "product_id": str(product.id),
        "product_type": product.product_type,
        "min_amount_eur": str(product.min_amount),
        "max_amount_eur": str(product.max_amount),
        "min_term_months": product.min_term_months,
        "max_term_months": product.max_term_months,
        "match": True,
        # All serialized results are above the threshold, hence referral-eligible.
        "eligible": True,
        "ranking": ranking,
        "priority": product.priority,
        # Compatibility score (0-100) against published criteria. NOT approval
        # probability; the UI must present it as "съответствие".
        "compatibility_score": compatibility,
        "match_score": compatibility,
        "threshold": threshold,
        "reasons": customer_reasons,
    }
