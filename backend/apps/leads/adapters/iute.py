"""Iute partner adapter — integration abstraction (placeholder).

Iute API documentation is not available in this repository, so no endpoints or
credentials are invented. This adapter is the isolation point where the real
integration will live. Until it is configured and implemented, it refuses to
submit (recorded as FAILED with a safe reason) rather than calling a fabricated
endpoint.

Credentials come from settings (server-side only): IUTE_API_BASE_URL,
IUTE_API_KEY, IUTE_CLIENT_ID, IUTE_CLIENT_SECRET. They are never logged and
never exposed to the frontend.

The eventual commercial model for Iute is 5% of the funded/disbursed amount;
commission is computed by the existing commissions layer from the funded amount
this adapter reports back — not here.
"""
from __future__ import annotations

from django.conf import settings

from .base import PartnerAdapter, SubmissionResult


class IuteAdapter(PartnerAdapter):
    name = "iute"

    def _configured(self) -> bool:
        return bool(
            settings.IUTE_API_BASE_URL
            and settings.IUTE_API_KEY
            and settings.IUTE_CLIENT_ID
            and settings.IUTE_CLIENT_SECRET
        )

    def submit_application(self, application, payload: dict) -> SubmissionResult:
        if not self._configured():
            # No live integration yet — do NOT call a fabricated endpoint.
            return SubmissionResult(
                ok=False,
                status="FAILED",
                metadata={"reason": "iute_not_configured"},
            )
        # Real HTTP submission to Iute will be implemented here once the API
        # contract is available. The payload (partner-permitted fields, possibly
        # incl. EGN) must be sent over TLS and never logged. Intentionally not
        # implemented against a guessed endpoint.
        raise NotImplementedError(
            "IuteAdapter.submit_application requires the real Iute API contract."
        )
