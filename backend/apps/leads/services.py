"""Lead routing and event ingestion.

Routing creates a Lead from a matched product and moves the application to
ROUTED. Event ingestion is idempotent and drives lead/application status and
commission lifecycle.
"""
from __future__ import annotations

from decimal import Decimal

from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.applications.models import Application, ApplicationStatus
from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.commissions.services import (
    clawback_commission,
    confirm_commission,
    ensure_commission,
)
from apps.lenders.models import LenderProduct

from .models import Lead, LeadEvent, LeadEventType, LeadStatus

# Map inbound event types to resulting lead status.
_EVENT_TO_STATUS = {
    LeadEventType.CLICK: LeadStatus.CLICKED,
    LeadEventType.REDIRECT: LeadStatus.CLICKED,
    LeadEventType.APPLICATION_STARTED: LeadStatus.APPLICATION_STARTED,
    LeadEventType.APPLICATION_COMPLETED: LeadStatus.APPLICATION_COMPLETED,
    LeadEventType.APPROVED: LeadStatus.APPROVED,
    LeadEventType.DECLINED: LeadStatus.DECLINED,
    LeadEventType.FUNDED: LeadStatus.FUNDED,
    LeadEventType.CANCELLED: LeadStatus.REJECTED,
}


@transaction.atomic
def route_lead(application: Application, product: LenderProduct, *, actor=None) -> Lead:
    """Create (or fetch) the lead routing this application to a product."""
    lead, created = Lead.objects.get_or_create(
        application=application,
        product=product,
        defaults={
            "lender": product.lender,
            "affiliate_id": product.affiliate_id,
            "status": LeadStatus.SENT,
            "sent_at": timezone.now(),
        },
    )
    if created:
        LeadEvent.objects.create(lead=lead, event_type=LeadEventType.REDIRECT)
        if application.status in (
            ApplicationStatus.MATCHED,
            ApplicationStatus.QUALIFIED,
            ApplicationStatus.SUBMITTED,
        ):
            application.status = ApplicationStatus.ROUTED
            application.save(update_fields=["status", "updated_at"])
        record_audit(
            action=AuditAction.LEAD_ROUTED,
            entity_type="Lead",
            entity_id=lead.id,
            actor=actor,
            metadata={"product_id": str(product.id), "lender": product.lender.name},
        )
    return lead


def outbound_url(lead: Lead) -> str:
    """Build the tracked outbound URL for a lead's product."""
    product = lead.product
    template = product.tracking_url_template
    if template:
        return template.format(
            application_url=product.application_url,
            tracking_id=lead.tracking_id,
            click_id=lead.click_id or lead.tracking_id,
            affiliate_id=product.affiliate_id or "",
        )
    return product.application_url


@transaction.atomic
def record_lead_event(
    lead: Lead,
    event_type: str,
    *,
    external_event_id: str = "",
    metadata: dict | None = None,
) -> tuple[LeadEvent, bool]:
    """Append a lead event idempotently and apply side effects.

    Returns (event, created). If an event with the same external_event_id
    already exists for the lead, it is returned with created=False and no
    duplicate side effects are applied.
    """
    metadata = metadata or {}

    if external_event_id:
        existing = LeadEvent.objects.filter(
            lead=lead, external_event_id=external_event_id
        ).first()
        if existing:
            return existing, False

    try:
        event = LeadEvent.objects.create(
            lead=lead,
            event_type=event_type,
            external_event_id=external_event_id,
            metadata=metadata,
        )
    except IntegrityError:
        # Concurrent duplicate; fetch and return without side effects.
        existing = LeadEvent.objects.get(
            lead=lead, external_event_id=external_event_id
        )
        return existing, False

    _apply_event_side_effects(lead, event_type, metadata)
    return event, True


def _apply_event_side_effects(lead: Lead, event_type: str, metadata: dict) -> None:
    new_status = _EVENT_TO_STATUS.get(event_type)
    if new_status and lead.status != new_status:
        lead.status = new_status
        lead.save(update_fields=["status", "updated_at"])
        record_audit(
            action=AuditAction.LEAD_STATUS_CHANGED,
            entity_type="Lead",
            entity_id=lead.id,
            actor_label="system:webhook",
            metadata={"status": new_status, "event_type": event_type},
        )

    application = lead.application
    if event_type == LeadEventType.APPROVED:
        _set_application_status(application, ApplicationStatus.APPROVED)
        ensure_commission(lead)
    elif event_type == LeadEventType.FUNDED:
        _set_application_status(application, ApplicationStatus.FUNDED)
        funded_amount = _decimal(metadata.get("funded_amount"))
        commission = ensure_commission(lead, funded_amount=funded_amount)
        confirm_commission(commission, actual_amount=commission.expected_amount)
    elif event_type == LeadEventType.DECLINED:
        _set_application_status(application, ApplicationStatus.DECLINED)
    elif event_type == LeadEventType.CANCELLED:
        # A cancellation after funding triggers a clawback if a commission exists.
        commission = getattr(lead, "commission", None)
        if commission is not None:
            clawback_commission(commission)


def _set_application_status(application: Application, status: str) -> None:
    if application.status != status:
        application.status = status
        application.save(update_fields=["status", "updated_at"])
        record_audit(
            action=AuditAction.APPLICATION_STATUS_CHANGED,
            entity_type="Application",
            entity_id=application.id,
            actor_label="system:webhook",
            metadata={"status": status},
        )


def _decimal(value) -> Decimal | None:
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (ValueError, TypeError):
        return None
