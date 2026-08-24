"""Helper for recording audit entries."""
from __future__ import annotations

from .models import AuditLog


def record_audit(
    *,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    actor=None,
    actor_label: str = "",
    ip_hash: str = "",
    metadata: dict | None = None,
) -> AuditLog:
    """Append an audit entry. Never raises into business logic."""
    return AuditLog.objects.create(
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else "",
        actor=actor if (actor and getattr(actor, "is_authenticated", False)) else None,
        actor_label=actor_label,
        ip_hash=ip_hash,
        metadata=metadata or {},
    )
