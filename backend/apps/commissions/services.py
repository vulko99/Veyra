"""Commission calculation and lifecycle.

Payout values come from the lender product configuration, never from code.
"""
from __future__ import annotations

from decimal import Decimal

from django.utils import timezone

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.leads.models import Lead
from apps.lenders.models import PayoutModel

from .models import Commission, CommissionStatus


def expected_amount_for(lead: Lead, *, funded_amount: Decimal | None = None) -> Decimal:
    """Compute the expected commission from the product's payout configuration."""
    product = lead.product
    value = product.payout_value or Decimal("0")
    model = product.payout_model

    if model == PayoutModel.CPS_PERCENT:
        base = funded_amount if funded_amount is not None else lead.application.requested_amount
        return (Decimal(str(base)) * value / Decimal("100")).quantize(Decimal("0.01"))
    # CPL, CPA, CPS, HYBRID (base component) are flat amounts.
    return Decimal(str(value)).quantize(Decimal("0.01"))


def ensure_commission(lead: Lead, *, funded_amount: Decimal | None = None) -> Commission:
    """Create or update the commission for a lead based on current config."""
    expected = expected_amount_for(lead, funded_amount=funded_amount)
    commission, created = Commission.objects.get_or_create(
        lead=lead,
        defaults={
            "lender": lead.lender,
            "payout_model": lead.product.payout_model,
            "expected_amount": expected,
            "currency": lead.product.currency,
        },
    )
    if not created:
        commission.expected_amount = expected
        commission.save(update_fields=["expected_amount"])

    record_audit(
        action=AuditAction.COMMISSION_UPDATED,
        entity_type="Commission",
        entity_id=commission.id,
        actor_label="system:commissions",
        metadata={"expected_amount": str(expected), "status": commission.status},
    )
    return commission


def confirm_commission(
    commission: Commission, *, actual_amount: Decimal | None = None
) -> Commission:
    commission.status = CommissionStatus.CONFIRMED
    commission.actual_amount = (
        actual_amount if actual_amount is not None else commission.expected_amount
    )
    commission.confirmed_at = timezone.now()
    commission.save(update_fields=["status", "actual_amount", "confirmed_at"])
    record_audit(
        action=AuditAction.COMMISSION_UPDATED,
        entity_type="Commission",
        entity_id=commission.id,
        actor_label="system:commissions",
        metadata={"status": commission.status, "actual_amount": str(commission.actual_amount)},
    )
    return commission


def clawback_commission(commission: Commission) -> Commission:
    commission.status = CommissionStatus.CLAWBACK
    commission.actual_amount = Decimal("0.00")
    commission.save(update_fields=["status", "actual_amount"])
    record_audit(
        action=AuditAction.COMMISSION_UPDATED,
        entity_type="Commission",
        entity_id=commission.id,
        actor_label="system:commissions",
        metadata={"status": commission.status},
    )
    return commission
