"""Provider-independent partner lead delivery.

A referral (Lead) is delivered to a partner through a pluggable backend chosen
by the partner's ``delivery_method``. Today an email backend exists; API,
webhook and other integrations can be added by registering a new backend
without touching the referral system.

Only data permitted for the agreed referral process is sent. No internal
database ids, no compatibility score, no rule internals, no hashed
fingerprints — just what a partner needs to follow up with the applicant.
"""
from __future__ import annotations

import logging

from django.conf import settings

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.core.email import send_email
from apps.lenders.models import DeliveryMethod

logger = logging.getLogger(__name__)


def build_referral_payload(lead) -> dict:
    """The minimal, permitted representation of a referral for a partner."""
    application = lead.application
    applicant = application.applicant
    contact = {
        "name": (application.full_name or "").strip()
        or (f"{applicant.first_name} {applicant.last_name}".strip() if applicant else ""),
        "email": application.email or (applicant.email if applicant else ""),
        "phone": application.phone or (applicant.phone if applicant else ""),
    }
    return {
        # Public, non-enumerable reference (never the DB pk).
        "reference": application.public_id,
        "tracking_id": lead.tracking_id,
        "product": lead.product.name,
        "requested_amount_eur": str(application.requested_amount)
        if application.requested_amount is not None
        else None,
        "requested_term_months": application.requested_term_months,
        "contact": contact,
    }


# The default set of fields a partner receives when it has not configured an
# explicit allow-list. Deliberately minimal — no DB ids, score, or rule data.
DEFAULT_ALLOWED_FIELDS = [
    "reference",
    "tracking_id",
    "product",
    "requested_amount_eur",
    "requested_term_months",
    "contact_name",
    "contact_email",
    "contact_phone",
]


def flat_referral_payload(lead) -> dict:
    """A flat, template-friendly view of the referral payload."""
    p = build_referral_payload(lead)
    return {
        "reference": p["reference"],
        "tracking_id": p["tracking_id"],
        "product": p["product"],
        "requested_amount_eur": p["requested_amount_eur"],
        "requested_term_months": p["requested_term_months"],
        "contact_name": p["contact"]["name"],
        "contact_email": p["contact"]["email"],
        "contact_phone": p["contact"]["phone"],
    }


def permitted_payload(lead) -> dict:
    """Only the fields this partner is contractually allowed to receive."""
    allowed = lead.lender.referral_allowed_fields or DEFAULT_ALLOWED_FIELDS
    flat = flat_referral_payload(lead)
    return {k: v for k, v in flat.items() if k in allowed}


class _SafeDict(dict):
    def __missing__(self, key):  # keep unknown placeholders empty, never raise
        return ""


class PartnerLeadDeliveryService:
    """Dispatch a referral to the backend configured on its partner."""

    def deliver(self, lead) -> dict:
        method = lead.lender.delivery_method
        backend = {
            DeliveryMethod.EMAIL: self._deliver_email,
        }.get(method, self._deliver_unsupported)

        try:
            result = backend(lead)
        except Exception:  # pragma: no cover - delivery is best-effort
            logger.exception(
                "partner_delivery_failed",
                extra={"event": {"tracking_id": lead.tracking_id, "method": method}},
            )
            result = {"delivered": False, "method": method, "reason": "error"}

        record_audit(
            action=AuditAction.LEAD_ROUTED,
            entity_type="Lead",
            entity_id=lead.id,
            actor_label="system:delivery",
            metadata={
                "partner_slug": lead.lender.slug,
                "method": method,
                "delivered": result.get("delivered", False),
            },
        )
        return result

    def _deliver_email(self, lead) -> dict:
        to = lead.lender.delivery_email
        if not to:
            return {"delivered": False, "method": DeliveryMethod.EMAIL, "reason": "no_address"}

        # Only send fields the partner is contractually allowed to receive.
        payload = permitted_payload(lead)
        template = lead.lender.referral_email_template
        if template:
            body = template.format_map(_SafeDict(payload))
        else:
            body = "\n".join(f"{k}: {payload[k]}" for k in payload)

        send_email(
            subject=f"Veyra referral {payload.get('reference', lead.tracking_id)}",
            to=[to],
            body=body,
        )
        return {"delivered": True, "method": DeliveryMethod.EMAIL}

    def _deliver_unsupported(self, lead) -> dict:
        # MANUAL / API / WEBHOOK: no automated delivery wired yet. The referral
        # still exists and is visible in admin for manual handling.
        return {
            "delivered": False,
            "method": lead.lender.delivery_method,
            "reason": "not_automated",
        }


def deliver_referral(lead) -> dict:
    """Best-effort delivery entry point used by the referral service."""
    # Demo isolation: a referral to a demo partner (or the whole system in
    # DEMO_MODE) is simulated — never emailed, never sent to an external API.
    if lead.demo or lead.lender.is_demo or getattr(settings, "DEMO_MODE", True):
        return {"delivered": False, "method": lead.lender.delivery_method, "reason": "demo_simulated"}
    if getattr(settings, "PARTNER_DELIVERY_ENABLED", True) is False:
        return {"delivered": False, "method": lead.lender.delivery_method, "reason": "disabled"}
    return PartnerLeadDeliveryService().deliver(lead)


def send_referral_email(referral) -> dict:
    """Explicitly send a referral to its partner by email.

    Clean entry point for the email-referral MVP. Sends only the partner's
    allowed fields, using its configured template. Requires a delivery email;
    does not depend on delivery_method, so it can be triggered manually once a
    real agreement is in place. Best-effort and audited.
    """
    return PartnerLeadDeliveryService()._deliver_email(referral)
