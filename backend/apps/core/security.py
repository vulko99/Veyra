"""PII-safe hashing and masking helpers.

We never store raw IP addresses or user agents; we store salted hashes.
We never log full emails or phone numbers; we mask them.
"""
import hashlib

from django.conf import settings


def hash_value(value: str | None) -> str:
    """Return a salted SHA-256 hex digest of ``value`` (empty for falsy input)."""
    if not value:
        return ""
    salt = settings.HASH_SALT
    return hashlib.sha256(f"{salt}:{value}".encode()).hexdigest()


def mask_email(email: str | None) -> str:
    """me@example.com -> m***@example.com"""
    if not email or "@" not in email:
        return ""
    local, _, domain = email.partition("@")
    if len(local) <= 1:
        masked_local = "*"
    else:
        masked_local = local[0] + "***"
    return f"{masked_local}@{domain}"


def mask_phone(phone: str | None) -> str:
    """+359881234567 -> ******4567"""
    if not phone:
        return ""
    digits = "".join(ch for ch in phone if ch.isdigit())
    if len(digits) <= 4:
        return "*" * len(digits)
    return "*" * (len(digits) - 4) + digits[-4:]


def client_ip(request) -> str:
    """Best-effort client IP extraction from a request."""
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")
