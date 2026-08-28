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

        payload = build_referral_payload(lead)
        lines = [
            f"Референция: {payload['reference']}",
            f"Проследяване: {payload['tracking_id']}",
            f"Продукт: {payload['product']}",
            f"Сума (EUR): {payload['requested_amount_eur']}",
            f"Срок (месеци): {payload['requested_term_months']}",
            "",
            "Контакт на клиента:",
            f"  Име: {payload['contact']['name']}",
            f"  Имейл: {payload['contact']['email']}",
            f"  Телефон: {payload['contact']['phone']}",
        ]
        send_email(
            subject=f"Veyra referral {payload['reference']}",
            to=[to],
            body="\n".join(lines),
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
    if getattr(settings, "PARTNER_DELIVERY_ENABLED", True) is False:
        return {"delivered": False, "method": lead.lender.delivery_method, "reason": "disabled"}
    return PartnerLeadDeliveryService().deliver(lead)
