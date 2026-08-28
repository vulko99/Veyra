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
from apps.core.exceptions import VeyraAPIError
from apps.lenders.models import LenderProduct

from .delivery import deliver_referral
from .models import Lead, LeadEvent, LeadEventType, LeadStatus, ReferralStatus
from .services import outbound_url


@transaction.atomic
def create_referral(application: Application, product: LenderProduct) -> Lead:
    """Create (or fetch) the referral for a selected partner product.

    Enforces the partner's optional per-application referral cap and, on first
    creation, hands the referral to the provider-independent delivery layer.
    """
    # Respect the partner's optional per-application referral cap. An existing
    # referral to this same product is always allowed (idempotent re-selection).
    cap = product.lender.max_referrals_per_application
    if cap is not None:
        existing = Lead.objects.filter(
            application=application, lender=product.lender
        ).exclude(product=product).count()
        if existing >= cap:
            raise VeyraAPIError(
                code="REFERRAL_LIMIT_REACHED",
                message="This partner's referral limit for the application is reached.",
                http_status=400,
            )

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
        # Hand off to the provider-independent delivery layer (best-effort:
        # never fails the referral). No-op for partners not yet automated.
        deliver_referral(lead)
    return lead


def referral_outbound_url(lead: Lead) -> str:
    return outbound_url(lead)
