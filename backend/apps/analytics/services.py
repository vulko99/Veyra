"""KPI computation for the analytics dashboard."""
from __future__ import annotations

from decimal import Decimal

from django.db.models import Sum

from apps.applications.models import Application, ApplicationStatus
from apps.commissions.models import Commission, CommissionStatus
from apps.leads.models import Lead, LeadStatus
from apps.matching.models import Match


def _rate(numerator: int, denominator: int) -> float:
    return round(numerator / denominator, 4) if denominator else 0.0


def compute_kpis(*, filters: dict | None = None) -> dict:
    """Return the headline KPIs, optionally filtered.

    Supported filters: date_from, date_to, lender, product, source, campaign.
    """
    filters = filters or {}
    app_qs = Application.objects.all()
    lead_qs = Lead.objects.all()
    commission_qs = Commission.objects.all()

    if filters.get("date_from"):
        app_qs = app_qs.filter(created_at__date__gte=filters["date_from"])
        lead_qs = lead_qs.filter(created_at__date__gte=filters["date_from"])
        commission_qs = commission_qs.filter(created_at__date__gte=filters["date_from"])
    if filters.get("date_to"):
        app_qs = app_qs.filter(created_at__date__lte=filters["date_to"])
        lead_qs = lead_qs.filter(created_at__date__lte=filters["date_to"])
        commission_qs = commission_qs.filter(created_at__date__lte=filters["date_to"])
    if filters.get("source"):
        app_qs = app_qs.filter(source=filters["source"])
        lead_qs = lead_qs.filter(application__source=filters["source"])
    if filters.get("campaign"):
        app_qs = app_qs.filter(campaign=filters["campaign"])
        lead_qs = lead_qs.filter(application__campaign=filters["campaign"])
    if filters.get("lender"):
        lead_qs = lead_qs.filter(lender_id=filters["lender"])
        commission_qs = commission_qs.filter(lender_id=filters["lender"])
    if filters.get("product"):
        lead_qs = lead_qs.filter(product_id=filters["product"])

    total_apps = app_qs.count()
    qualified = app_qs.filter(
        status__in=[
            ApplicationStatus.QUALIFIED,
            ApplicationStatus.MATCHED,
            ApplicationStatus.ROUTED,
            ApplicationStatus.IN_PROGRESS,
            ApplicationStatus.APPROVED,
            ApplicationStatus.FUNDED,
        ]
    ).count()

    matched_app_ids = (
        Match.objects.filter(application__in=app_qs, rank__isnull=False)
        .values_list("application_id", flat=True)
        .distinct()
    )
    matches = len(set(matched_app_ids))

    leads_routed = lead_qs.count()
    approved = lead_qs.filter(
        status__in=[LeadStatus.APPROVED, LeadStatus.FUNDED]
    ).count()
    funded = lead_qs.filter(status=LeadStatus.FUNDED).count()

    revenue = commission_qs.filter(
        status__in=[CommissionStatus.CONFIRMED, CommissionStatus.PAID]
    ).aggregate(total=Sum("actual_amount"))["total"] or Decimal("0")

    return {
        "applications": total_apps,
        "qualified_applications": qualified,
        "matches": matches,
        "leads_routed": leads_routed,
        "approved": approved,
        "funded": funded,
        "revenue": str(revenue),
        "applications_to_funded_conversion": _rate(funded, total_apps),
        "approval_rate": _rate(approved, leads_routed),
        "funded_rate": _rate(funded, leads_routed),
        "revenue_per_application": (
            str((revenue / total_apps).quantize(Decimal("0.01")))
            if total_apps
            else "0.00"
        ),
        "revenue_per_funded_customer": (
            str((revenue / funded).quantize(Decimal("0.01"))) if funded else "0.00"
        ),
    }
