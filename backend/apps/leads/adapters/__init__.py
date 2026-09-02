"""Partner integration adapters.

Isolates partner-specific submission logic behind one interface so the funnel,
submission service and reconciliation never branch on a partner. Adding a
partner is adding an adapter (and configuration) — not touching the flow.
"""
from .base import PartnerAdapter, SubmissionResult
from .registry import get_adapter

__all__ = ["PartnerAdapter", "SubmissionResult", "get_adapter"]
