"""Explicit, versioned consent records.

Marketing consent is always a separate, optional record. There is no single
"I agree to everything" checkbox. Each consent captures the exact document
versions in force and hashed request fingerprints.
"""
from django.db import models

from apps.applications.models import Application
from apps.core.models import UUIDModel


class ConsentType(models.TextChoices):
    PLATFORM_PROCESSING = "PLATFORM_PROCESSING", "Platform processing"
    PARTNER_DATA_TRANSFER = "PARTNER_DATA_TRANSFER", "Partner data transfer"
    MARKETING = "MARKETING", "Marketing"


# Consents that must be accepted for an application to be submitted.
REQUIRED_CONSENT_TYPES = (
    ConsentType.PLATFORM_PROCESSING,
    ConsentType.PARTNER_DATA_TRANSFER,
)


class Consent(UUIDModel):
    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="consents"
    )
    consent_type = models.CharField(max_length=32, choices=ConsentType.choices)
    consent_text_version = models.CharField(max_length=40)

    accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)

    privacy_policy_version = models.CharField(max_length=40, blank=True)
    terms_version = models.CharField(max_length=40, blank=True)

    ip_hash = models.CharField(max_length=64, blank=True)
    user_agent_hash = models.CharField(max_length=64, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["application", "consent_type"],
                name="uniq_consent_per_type_per_application",
            )
        ]

    def __str__(self) -> str:
        return f"{self.consent_type} ({'accepted' if self.accepted else 'declined'})"
