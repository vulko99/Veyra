"""Consent capture."""
from __future__ import annotations

from django.conf import settings
from django.utils import timezone

from apps.audit.models import AuditAction
from apps.audit.services import record_audit

from .models import REQUIRED_CONSENT_TYPES, Consent, ConsentType


def record_consent(
    *,
    application,
    consent_type: str,
    accepted: bool,
    consent_text_version: str,
    ip_hash: str = "",
    user_agent_hash: str = "",
) -> Consent:
    consent, _ = Consent.objects.update_or_create(
        application=application,
        consent_type=consent_type,
        defaults={
            "accepted": accepted,
            "accepted_at": timezone.now() if accepted else None,
            "consent_text_version": consent_text_version,
            "privacy_policy_version": settings.PRIVACY_POLICY_VERSION,
            "terms_version": settings.TERMS_VERSION,
            "ip_hash": ip_hash,
            "user_agent_hash": user_agent_hash,
        },
    )
    if accepted:
        record_audit(
            action=AuditAction.CONSENT_ACCEPTED,
            entity_type="Consent",
            entity_id=consent.id,
            ip_hash=ip_hash,
            metadata={"consent_type": consent_type},
        )
    return consent


def has_required_consents(application) -> bool:
    accepted = set(
        application.consents.filter(accepted=True).values_list(
            "consent_type", flat=True
        )
    )
    return all(ct in accepted for ct in REQUIRED_CONSENT_TYPES)


def missing_required_consents(application) -> list[str]:
    accepted = set(
        application.consents.filter(accepted=True).values_list(
            "consent_type", flat=True
        )
    )
    return [ct for ct in REQUIRED_CONSENT_TYPES if ct not in accepted]


__all__ = [
    "record_consent",
    "has_required_consents",
    "missing_required_consents",
    "ConsentType",
]
