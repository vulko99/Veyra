"""EGN collection service.

Validates, encrypts and stores an applicant's EGN on the ApplicantIdentity
record. The plaintext EGN is used only transiently here (to encrypt and to
derive the last-four) and is never logged, never persisted in clear, and never
returned to the caller.
"""
from __future__ import annotations

from django.utils import timezone

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.core.crypto import egn_last4, encrypt_egn
from apps.core.exceptions import VeyraAPIError

from .models import ApplicantIdentity, Application, is_valid_egn


def set_application_egn(application: Application, egn: str) -> ApplicantIdentity:
    """Validate and securely store an EGN for an application.

    Raises VeyraAPIError(INVALID_EGN) if the value is not exactly 10 digits.
    Idempotent: re-submitting replaces the stored token and records EGN_UPDATED.
    """
    egn = (egn or "").strip()
    if not is_valid_egn(egn):
        # The invalid value is not echoed back — no EGN in error output.
        raise VeyraAPIError(
            code="INVALID_EGN",
            message="Моля, въведи валидно ЕГН от 10 цифри.",
            http_status=400,
        )

    identity, _ = ApplicantIdentity.objects.get_or_create(application=application)
    was_present = bool(identity.egn_encrypted)

    identity.egn_encrypted = encrypt_egn(egn)
    identity.egn_last4 = egn_last4(egn)
    identity.egn_collected_at = timezone.now()
    identity.save(
        update_fields=[
            "egn_encrypted",
            "egn_last4",
            "egn_collected_at",
            "updated_at",
        ]
    )

    record_audit(
        action=AuditAction.EGN_UPDATED if was_present else AuditAction.EGN_COLLECTED,
        entity_type="Application",
        entity_id=application.id,
        actor_label="applicant",
        # No EGN, no encrypted token — only the masked last four and a reference.
        metadata={
            "application": application.public_id,
            "egn_last4": identity.egn_last4,
        },
    )
    return identity
