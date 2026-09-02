"""Multi-partner submission service.

Runs at final confirmation, AFTER the applicant has selected partner(s) and (if
any selected partner requires it) supplied their EGN. For each SELECTED partner
it creates a PartnerSubmission and hands a partner-permitted payload to that
partner's adapter.

Security guarantees enforced here:
  * Only partners the applicant selected are iterated — an unselected partner
    can never receive the application data or the EGN.
  * EGN is decrypted transiently, added to the payload ONLY for a partner whose
    ``egn_required`` is set, used for the single adapter call, and never
    persisted on the submission or logged.
  * Demo partners / DEMO_MODE resolve to the DemoAdapter (see registry), so demo
    data is never sent to a real partner API.
"""
from __future__ import annotations

import logging

from django.db import transaction
from django.utils import timezone

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.core.crypto import decrypt_egn
from apps.core.exceptions import VeyraAPIError

from .adapters import get_adapter
from .models import Lead, PartnerSubmission, SubmissionStatus

logger = logging.getLogger(__name__)


def _base_payload(application) -> dict:
    """Minimal applicant/application fields for a partner submission.

    No DB ids, no score, no hashes — mirrors the delivery allow-list intent.
    """
    applicant = application.applicant
    return {
        "reference": application.public_id,
        "requested_amount_eur": str(application.requested_amount)
        if application.requested_amount is not None
        else None,
        "requested_term_months": application.requested_term_months,
        "contact_name": (application.full_name or "").strip()
        or (f"{applicant.first_name} {applicant.last_name}".strip() if applicant else ""),
        "contact_email": application.email or (applicant.email if applicant else ""),
        "contact_phone": application.phone or (applicant.phone if applicant else ""),
    }


def _egn_plaintext(application) -> str:
    """Decrypt the stored EGN transiently, or "" if none. Never logged."""
    identity = getattr(application, "identity", None)
    if identity and identity.egn_encrypted:
        return decrypt_egn(identity.egn_encrypted)
    return ""


@transaction.atomic
def submit_to_selected_partners(application, leads: list[Lead]) -> list[PartnerSubmission]:
    """Create and run a PartnerSubmission for each selected partner lead.

    ``leads`` are the referrals the applicant selected. If any selected partner
    requires an EGN and none is stored, the whole action is refused (400) so no
    partial submission happens without required data.
    """
    leads = list(leads)
    requires_egn = any(lead.lender.egn_required for lead in leads)
    egn = _egn_plaintext(application) if requires_egn else ""
    if requires_egn and not egn:
        raise VeyraAPIError(
            code="EGN_REQUIRED",
            message="ЕГН е необходимо за избрания партньор.",
            http_status=400,
        )

    base = _base_payload(application)
    submissions: list[PartnerSubmission] = []

    for lead in leads:
        lender = lead.lender
        submission, _ = PartnerSubmission.objects.get_or_create(
            application=application,
            lender=lender,
            defaults={"product": lead.product, "lead": lead, "demo": lead.demo or lender.is_demo},
        )
        # Build the payload for THIS partner only. EGN is included solely when
        # this partner requires it — never sprayed across all partners.
        payload = dict(base)
        include_egn = bool(lender.egn_required and egn)
        if include_egn:
            payload["egn"] = egn

        adapter = get_adapter(lender)
        try:
            result = adapter.submit_application(application, payload)
        except Exception:  # never leak an exception/payload to the caller
            logger.exception(
                "partner_submission_error",
                extra={"event": {"partner": lender.slug, "application": application.public_id}},
            )
            result = None

        now = timezone.now()
        submission.submitted_at = now
        submission.egn_included = include_egn
        if result is None:
            submission.status = SubmissionStatus.FAILED
            submission.response_metadata = {"reason": "adapter_error"}
        else:
            submission.status = result.status
            submission.external_application_id = result.external_application_id
            submission.funded_amount_eur = result.funded_amount_eur
            submission.response_metadata = result.metadata or {}
        submission.save()

        record_audit(
            action=AuditAction.PARTNER_SUBMISSION_CREATED,
            entity_type="PartnerSubmission",
            entity_id=submission.id,
            actor_label="system:submission",
            metadata={
                "application": application.public_id,
                "partner_slug": lender.slug,
                "status": submission.status,
                "egn_included": include_egn,
                "demo": submission.demo,
            },
        )
        if include_egn:
            ok = result is not None and result.ok
            record_audit(
                action=AuditAction.EGN_SUBMITTED_TO_PARTNER
                if ok
                else AuditAction.EGN_SUBMISSION_FAILED,
                entity_type="PartnerSubmission",
                entity_id=submission.id,
                actor_label="system:submission",
                # No EGN, no payload — only references and outcome.
                metadata={"application": application.public_id, "partner_slug": lender.slug},
            )
        submissions.append(submission)

    return submissions
