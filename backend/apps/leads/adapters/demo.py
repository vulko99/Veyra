"""Demo adapter — simulates a partner submission with no external call.

Used for demo partners and whenever DEMO_MODE is on. Guarantees demo data can
never reach a real partner API. Returns a clearly-marked simulated result.
"""
from __future__ import annotations

from .base import PartnerAdapter, SubmissionResult


class DemoAdapter(PartnerAdapter):
    name = "demo"

    def submit_application(self, application, payload: dict) -> SubmissionResult:
        # No network, no email — just a simulated acceptance.
        return SubmissionResult(
            ok=True,
            status="DEMO_SIMULATED",
            external_application_id=f"DEMO-{application.public_id}",
            metadata={"simulated": True, "partner": self.lender.slug},
        )
