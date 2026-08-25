"""ApplicationEvent recording — the auditability backbone of Phase 2."""
from __future__ import annotations

from .models import Application, ApplicationEvent


def record_event(
    application: Application,
    event_type: str,
    metadata: dict | None = None,
) -> ApplicationEvent:
    """Append an application event. Metadata must never contain raw secrets;
    keep it to non-sensitive, structural facts (amounts, ids, counts)."""
    return ApplicationEvent.objects.create(
        application=application,
        event_type=event_type,
        metadata=metadata or {},
    )
