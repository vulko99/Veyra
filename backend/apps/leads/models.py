"""Leads and their immutable event log.

A Lead represents an application routed to a specific lender product.
LeadEvents form an append-only log; external events are de-duplicated by
external_event_id for idempotency.
"""
from django.db import models

from apps.applications.models import Application
from apps.core.models import UUIDModel, UUIDTimeStampedModel
from apps.core.reference import tracking_id as new_tracking_id
from apps.lenders.models import Lender, LenderProduct


class LeadStatus(models.TextChoices):
    CREATED = "CREATED"
    SENT = "SENT"
    CLICKED = "CLICKED"
    APPLICATION_STARTED = "APPLICATION_STARTED"
    APPLICATION_COMPLETED = "APPLICATION_COMPLETED"
    APPROVED = "APPROVED"
    FUNDED = "FUNDED"
    DECLINED = "DECLINED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class ReferralStatus(models.TextChoices):
    """Phase 2 partner-referral lifecycle."""

    SELECTED = "selected"
    REFERRED = "referred"
    RECEIVED = "received"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FUNDED = "funded"
    FAILED = "failed"
    UNKNOWN = "unknown"


class Lead(UUIDTimeStampedModel):
    """A Lead is also the Phase 2 partner referral: an application routed to a
    specific partner product after the applicant selects it."""

    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="leads"
    )
    lender = models.ForeignKey(Lender, on_delete=models.PROTECT, related_name="leads")
    product = models.ForeignKey(
        LenderProduct, on_delete=models.PROTECT, related_name="leads"
    )

    status = models.CharField(
        max_length=24, choices=LeadStatus.choices, default=LeadStatus.CREATED,
        db_index=True,
    )

    # --- Phase 2 referral fields ---
    referral_status = models.CharField(
        max_length=16,
        choices=ReferralStatus.choices,
        default=ReferralStatus.SELECTED,
        db_index=True,
    )
    selected_at = models.DateTimeField(null=True, blank=True)
    referred_at = models.DateTimeField(null=True, blank=True)
    external_reference = models.CharField(max_length=160, blank=True)
    # Raw status text reported by a partner integration (future).
    partner_status = models.CharField(max_length=80, blank=True)

    external_lead_id = models.CharField(max_length=120, blank=True)
    external_application_id = models.CharField(max_length=120, blank=True)

    tracking_id = models.CharField(max_length=64, unique=True, editable=False)
    click_id = models.CharField(max_length=120, blank=True)
    affiliate_id = models.CharField(max_length=120, blank=True)

    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["application", "product"],
                name="uniq_lead_per_application_product",
            )
        ]

    def __str__(self) -> str:
        return f"Lead<{self.application.public_reference} -> {self.lender.name}>"

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            tid = new_tracking_id()
            while Lead.objects.filter(tracking_id=tid).exists():
                tid = new_tracking_id()
            self.tracking_id = tid
        super().save(*args, **kwargs)


class LeadEventType(models.TextChoices):
    CLICK = "CLICK"
    REDIRECT = "REDIRECT"
    APPLICATION_STARTED = "APPLICATION_STARTED"
    APPLICATION_COMPLETED = "APPLICATION_COMPLETED"
    APPROVED = "APPROVED"
    DECLINED = "DECLINED"
    FUNDED = "FUNDED"
    CANCELLED = "CANCELLED"


class LeadEvent(UUIDModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=32, choices=LeadEventType.choices)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    # External id used for idempotency; blank for internally generated events.
    external_event_id = models.CharField(max_length=160, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("-timestamp",)
        constraints = [
            # Idempotency: the same external event id for a lead is stored once.
            models.UniqueConstraint(
                fields=["lead", "external_event_id"],
                condition=models.Q(external_event_id__gt=""),
                name="uniq_external_event_per_lead",
            )
        ]

    def __str__(self) -> str:
        return f"{self.event_type}@{self.timestamp:%Y-%m-%d %H:%M}"
