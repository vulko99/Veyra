"""Phase 2 partner referral service.

When an applicant selects a matched partner product, a Referral (Lead) is
created and the lifecycle is recorded as ApplicationEvents. The actual outbound
partner integration is abstracted (a template URL for now) so real integrations
can be added later without changing callers.
"""
from __future__ import annotations

from django.db import transaction
from django.utils import timezone

from apps.applications.events import record_event
from apps.applications.models import Application, ApplicationEventType, ApplicationStatus
from apps.lenders.models import LenderProduct

from .models import Lead, LeadEvent, LeadEventType, LeadStatus, ReferralStatus
from .services import outbound_url


@transaction.atomic
def create_referral(application: Application, product: LenderProduct) -> Lead:
    """Create (or fetch) the referral for a selected partner product."""
    now = timezone.now()
    lead, created = Lead.objects.get_or_create(
        application=application,
        product=product,
        defaults={
            "lender": product.lender,
            "affiliate_id": product.affiliate_id,
            "status": LeadStatus.SENT,
            "referral_status": ReferralStatus.REFERRED,
            "selected_at": now,
            "referred_at": now,
            "sent_at": now,
        },
    )
    if created:
        LeadEvent.objects.create(lead=lead, event_type=LeadEventType.REDIRECT)
        record_event(
            application,
            ApplicationEventType.PARTNER_SELECTED,
            {"partner": product.lender.name, "product": product.name},
        )
        record_event(
            application,
            ApplicationEventType.REFERRAL_CREATED,
            {"lead_id": str(lead.id), "partner_slug": product.lender.slug},
        )
        # Advance the application lifecycle.
        if application.status in (
            ApplicationStatus.MATCHED,
            ApplicationStatus.COMPLETED,
            ApplicationStatus.SUBMITTED,
        ):
            application.status = ApplicationStatus.REFERRED
            application.save(update_fields=["status", "updated_at"])
    return lead


def referral_outbound_url(lead: Lead) -> str:
    return outbound_url(lead)
