"""Append-only audit log.

Records who did what to which entity. Append-only from the application UI:
Django admin exposes it read-only, and there is no update/delete API.
IP is stored hashed; no raw PII lands here.
"""
from django.conf import settings
from django.db import models

from apps.core.models import UUIDModel


class AuditAction(models.TextChoices):
    APPLICATION_CREATED = "APPLICATION_CREATED"
    APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED"
    APPLICATION_STATUS_CHANGED = "APPLICATION_STATUS_CHANGED"
    CONSENT_ACCEPTED = "CONSENT_ACCEPTED"
    MATCH_CREATED = "MATCH_CREATED"
    LEAD_ROUTED = "LEAD_ROUTED"
    LEAD_STATUS_CHANGED = "LEAD_STATUS_CHANGED"
    COMMISSION_UPDATED = "COMMISSION_UPDATED"
    LENDER_UPDATED = "LENDER_UPDATED"
    PRODUCT_UPDATED = "PRODUCT_UPDATED"
    RULE_UPDATED = "RULE_UPDATED"
    WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED"
    DATA_ANONYMIZED = "DATA_ANONYMIZED"
    # EGN lifecycle. Metadata NEVER contains the EGN, encrypted EGN, or any
    # payload carrying it — only application/partner references and outcomes.
    EGN_COLLECTED = "EGN_COLLECTED"
    EGN_UPDATED = "EGN_UPDATED"
    EGN_SUBMITTED_TO_PARTNER = "EGN_SUBMITTED_TO_PARTNER"
    EGN_SUBMISSION_FAILED = "EGN_SUBMISSION_FAILED"
    PARTNER_SUBMISSION_CREATED = "PARTNER_SUBMISSION_CREATED"


class AuditLog(UUIDModel):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_entries",
    )
    # Free-form actor label for non-user actors (system, webhook:<slug>).
    actor_label = models.CharField(max_length=100, blank=True)
    action = models.CharField(max_length=64, choices=AuditAction.choices)
    entity_type = models.CharField(max_length=64)
    entity_id = models.CharField(max_length=64, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_hash = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("-timestamp",)
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["action"]),
        ]

    def __str__(self) -> str:
        return f"{self.action} {self.entity_type}:{self.entity_id}"
