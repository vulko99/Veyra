"""Webhook payload handling.

A single generic endpoint (POST /api/v1/webhooks/{lender_slug}/) accepts
partner conversion callbacks. Handling supports:
  * signature validation (HMAC-SHA256) when a per-lender secret is configured
  * idempotency (external_event_id de-duplication)
  * event logging (LeadEvent is the immutable log)
  * consistent error envelope

Partner secrets live in the environment as LENDER_<SLUG>_WEBHOOK_SECRET and are
never committed. A per-lender payload mapping keeps lender specifics out of
core code.
"""
from __future__ import annotations

import hashlib
import hmac
import os

from apps.core.exceptions import VeyraAPIError

from .models import Lead, LeadEventType

# Map external event names to our canonical LeadEventType. Extendable per
# integration without touching the ingestion flow.
_EVENT_NAME_MAP = {
    "click": LeadEventType.CLICK,
    "redirect": LeadEventType.REDIRECT,
    "application_started": LeadEventType.APPLICATION_STARTED,
    "started": LeadEventType.APPLICATION_STARTED,
    "application_completed": LeadEventType.APPLICATION_COMPLETED,
    "completed": LeadEventType.APPLICATION_COMPLETED,
    "approved": LeadEventType.APPROVED,
    "declined": LeadEventType.DECLINED,
    "rejected": LeadEventType.DECLINED,
    "funded": LeadEventType.FUNDED,
    "paid": LeadEventType.FUNDED,
    "cancelled": LeadEventType.CANCELLED,
    "canceled": LeadEventType.CANCELLED,
}


def webhook_secret_for(lender_slug: str) -> str | None:
    env_key = f"LENDER_{lender_slug.upper().replace('-', '_')}_WEBHOOK_SECRET"
    return os.environ.get(env_key)


def verify_signature(lender_slug: str, raw_body: bytes, signature: str | None) -> bool:
    """Validate the HMAC signature if a secret is configured for this lender.

    If no secret is configured (e.g. demo lenders), signature validation is
    skipped and the webhook is accepted — this is an MVP convenience and must
    be revisited before onboarding a real partner.
    """
    secret = webhook_secret_for(lender_slug)
    if not secret:
        return True
    if not signature:
        return False
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    # Accept optional "sha256=" prefix.
    provided = signature.split("=", 1)[-1].strip()
    return hmac.compare_digest(expected, provided)


def resolve_lead(payload: dict) -> Lead:
    """Locate the lead referenced by the payload.

    Supports lookup by our tracking_id (preferred) or by a previously stored
    external_lead_id.
    """
    tracking_id = payload.get("tracking_id") or payload.get("click_id")
    external_lead_id = payload.get("external_lead_id") or payload.get("lead_id")

    lead = None
    if tracking_id:
        lead = Lead.objects.filter(tracking_id=tracking_id).first()
    if lead is None and external_lead_id:
        lead = Lead.objects.filter(external_lead_id=external_lead_id).first()

    if lead is None:
        raise VeyraAPIError(
            code="LEAD_NOT_FOUND",
            message="No matching lead for this webhook.",
            details={"tracking_id": tracking_id, "external_lead_id": external_lead_id},
            http_status=404,
        )
    return lead


def normalize_event_type(raw_type: str | None) -> str:
    if not raw_type:
        raise VeyraAPIError(
            code="MISSING_EVENT_TYPE",
            message="Webhook payload is missing an event type.",
            http_status=400,
        )
    canonical = _EVENT_NAME_MAP.get(str(raw_type).strip().lower())
    if canonical is None:
        raise VeyraAPIError(
            code="UNKNOWN_EVENT_TYPE",
            message=f"Unknown event type '{raw_type}'.",
            http_status=422,
        )
    return canonical
