"""Secure, non-sequential public reference generation."""
import secrets

_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous chars (0/O, 1/I)


def public_reference(prefix: str = "VEY", length: int = 10) -> str:
    """Return a URL-safe, non-guessable public reference, e.g. VEY-7K3P9Q­..."""
    body = "".join(secrets.choice(_ALPHABET) for _ in range(length))
    return f"{prefix}-{body}"


def veyra_application_id(length: int = 6) -> str:
    """Human-readable Veyra application id, e.g. VY-8F42K1.

    Non-sequential and unguessable; the database primary key is never exposed.
    """
    body = "".join(secrets.choice(_ALPHABET) for _ in range(length))
    return f"VY-{body}"


def tracking_id() -> str:
    """Opaque tracking id for outbound lead clicks."""
    return secrets.token_urlsafe(16)
