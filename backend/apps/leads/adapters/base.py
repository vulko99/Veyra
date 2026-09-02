"""Partner adapter interface.

An adapter receives a already-assembled, partner-permitted payload and is
responsible for talking to that partner. It NEVER logs the payload (which may
contain an EGN) and NEVER returns sensitive data to callers.
"""
from __future__ import annotations

import abc
from dataclasses import dataclass, field
from decimal import Decimal


@dataclass
class SubmissionResult:
    """Outcome of a partner submission — safe to persist and audit.

    Carries no EGN, no credentials, no raw partner request/response body — only
    a status, an optional external id, an optional funded amount, and safe
    diagnostic metadata.
    """

    ok: bool
    status: str
    external_application_id: str = ""
    funded_amount_eur: Decimal | None = None
    metadata: dict = field(default_factory=dict)


class PartnerAdapter(abc.ABC):
    """Base class for all partner integrations."""

    #: Human-readable adapter name (for diagnostics only).
    name: str = "partner"

    def __init__(self, lender):
        self.lender = lender

    @abc.abstractmethod
    def submit_application(self, application, payload: dict) -> SubmissionResult:
        """Submit ``payload`` (partner-permitted fields, possibly incl. EGN) to
        the partner. Must not log the payload; must return a SubmissionResult."""

    def handle_webhook(self, data: dict) -> dict:  # pragma: no cover - future
        """Process an inbound partner webhook. Default: no-op."""
        return {"handled": False, "reason": "not_implemented"}

    def get_application_status(self, external_application_id: str) -> dict:  # pragma: no cover
        """Fetch status for a previously submitted application. Default: unknown."""
        return {"status": "unknown"}

    def get_funded_amount(self, external_application_id: str) -> Decimal | None:  # pragma: no cover
        """Fetch the funded/disbursed amount, when the partner reports it."""
        return None


class NotConfiguredAdapter(PartnerAdapter):
    """Fallback for a real partner with no live integration wired yet.

    The submission is recorded as FAILED with a safe reason; nothing is sent.
    This keeps the flow working (and auditable) before an integration exists,
    without inventing endpoints or credentials.
    """

    name = "not_configured"

    def submit_application(self, application, payload: dict) -> SubmissionResult:
        return SubmissionResult(
            ok=False,
            status="FAILED",
            metadata={"reason": "integration_not_configured", "partner": self.lender.slug},
        )
