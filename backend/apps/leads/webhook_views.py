"""Webhook endpoint: POST /api/v1/webhooks/{lender_slug}/."""
import json

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.core.exceptions import VeyraAPIError
from apps.lenders.models import Lender

from .services import record_lead_event
from .webhooks import normalize_event_type, resolve_lead, verify_signature


class WebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []  # signature-based, not session
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "webhook"

    def post(self, request, lender_slug=None):
        # Confirm the lender exists (unknown slug -> 404).
        if not Lender.objects.filter(slug=lender_slug).exists():
            raise VeyraAPIError(
                code="UNKNOWN_LENDER",
                message="Unknown lender slug.",
                http_status=404,
            )

        raw_body = request.body
        signature = request.META.get("HTTP_X_SIGNATURE") or request.META.get(
            "HTTP_X_WEBHOOK_SIGNATURE"
        )
        if not verify_signature(lender_slug, raw_body, signature):
            raise VeyraAPIError(
                code="INVALID_SIGNATURE",
                message="Webhook signature validation failed.",
                http_status=401,
            )

        try:
            payload = json.loads(raw_body or b"{}")
        except json.JSONDecodeError:
            raise VeyraAPIError(
                code="INVALID_PAYLOAD",
                message="Webhook body is not valid JSON.",
                http_status=400,
            ) from None
        if not isinstance(payload, dict):
            raise VeyraAPIError(
                code="INVALID_PAYLOAD",
                message="Webhook body must be a JSON object.",
                http_status=400,
            )

        lead = resolve_lead(payload)
        event_type = normalize_event_type(payload.get("event_type") or payload.get("type"))
        external_event_id = str(
            payload.get("event_id") or payload.get("external_event_id") or ""
        )

        # Capture external ids on the lead if provided.
        update_fields = []
        ext_lead_id = payload.get("external_lead_id")
        if ext_lead_id and not lead.external_lead_id:
            lead.external_lead_id = str(ext_lead_id)
            update_fields.append("external_lead_id")
        ext_app_id = payload.get("external_application_id")
        if ext_app_id and not lead.external_application_id:
            lead.external_application_id = str(ext_app_id)
            update_fields.append("external_application_id")
        if update_fields:
            lead.save(update_fields=update_fields)

        event, created = record_lead_event(
            lead,
            event_type,
            external_event_id=external_event_id,
            metadata={"funded_amount": payload.get("funded_amount")}
            if payload.get("funded_amount") is not None
            else {},
        )

        record_audit(
            action=AuditAction.WEBHOOK_RECEIVED,
            entity_type="Lead",
            entity_id=lead.id,
            actor_label=f"webhook:{lender_slug}",
            metadata={
                "event_type": event_type,
                "duplicate": not created,
            },
        )

        return Response(
            {
                "received": True,
                "duplicate": not created,
                "lead_id": str(lead.id),
                "lead_status": lead.status,
            }
        )
