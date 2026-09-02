"""Adapter selection.

Demo isolation is enforced here first: a demo partner, or any partner while
DEMO_MODE is on, always resolves to the DemoAdapter, so demo data can never be
submitted to a real partner. Otherwise a partner-specific adapter is chosen by
slug, falling back to NotConfiguredAdapter for real partners without a live
integration.
"""
from __future__ import annotations

from django.conf import settings

from .base import NotConfiguredAdapter, PartnerAdapter
from .demo import DemoAdapter
from .iute import IuteAdapter

# Partner slug -> adapter class. Add real partners here as integrations land.
_ADAPTERS: dict[str, type[PartnerAdapter]] = {
    "iute": IuteAdapter,
}


def get_adapter(lender) -> PartnerAdapter:
    """Return the adapter to use for ``lender`` (demo-safe)."""
    if getattr(lender, "is_demo", False) or getattr(settings, "DEMO_MODE", True):
        return DemoAdapter(lender)
    adapter_cls = _ADAPTERS.get(lender.slug, NotConfiguredAdapter)
    return adapter_cls(lender)
