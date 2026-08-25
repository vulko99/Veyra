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

from .engine import evaluate_product
from .models import Match


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

    products = list(
        LenderProduct.objects.filter(active=True, lender__active=True)
        .select_related("lender")
        .prefetch_related("eligibility_rules")
    )

    evaluated = []
    for product in products:
        eligible, reasons = evaluate_product(context, product)
        evaluated.append((product, eligible, reasons))

    # Rank eligible products by configurable priority (deterministic tie-break).
    eligible_sorted = sorted(
        [e for e in evaluated if e[1]],
        key=lambda e: (
            -e[0].priority,
            e[0].lender.display_order,
            e[0].lender.priority * -1,
            str(e[0].id),
        ),
    )
    rank_by_product = {
        product.id: idx
        for idx, (product, _e, _r) in enumerate(eligible_sorted, start=1)
    }

    # Persist a Match (MatchResult) for every evaluated product (audit trail).
    Match.objects.filter(application=application).delete()
    for product, eligible, reasons in evaluated:
        Match.objects.create(
            application=application,
            lender=product.lender,
            product=product,
            eligible=eligible,
            score=product.priority if eligible else 0,
            rank=rank_by_product.get(product.id),
            reasons=reasons,
        )

    results = [
        _serialize(product, reasons, rank_by_product[product.id])
        for product, eligible, reasons in evaluated
        if eligible
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


def _serialize(product: LenderProduct, reasons: list[dict], ranking: int) -> dict:
    customer_reasons = [
        {"code": r.get("code", ""), "params": r.get("params", {}), "text": r.get("text", "")}
        for r in reasons
        if r.get("show_to_customer", True) and (r.get("code") or r.get("text"))
    ]
    return {
        "partner": product.lender.name,
        "partner_slug": product.lender.slug,
        "product": product.name,
        "product_id": str(product.id),
        "product_type": product.product_type,
        "min_amount_eur": str(product.min_amount),
        "max_amount_eur": str(product.max_amount),
        "min_term_months": product.min_term_months,
        "max_term_months": product.max_term_months,
        "match": True,
        "ranking": ranking,
        "priority": product.priority,
        "reasons": customer_reasons,
    }
