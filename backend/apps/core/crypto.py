"""Reversible encryption for sensitive identity data (EGN).

EGN (ЕГН) is a Bulgarian national identifier — special-category-adjacent
personal data that must never be stored in plaintext, never logged, and never
returned to the frontend. It is encrypted at rest with Fernet (AES-128-CBC +
HMAC) using a key derived from ``settings.EGN_ENCRYPTION_KEY``.

Key handling:
  * The key is read from the EGN_ENCRYPTION_KEY environment variable and is
    NEVER hardcoded or exposed to the frontend.
  * A production-grade key is a urlsafe-base64 32-byte Fernet key. If the value
    provided is not already a valid Fernet key, it is stretched into one with a
    fixed-salt SHA-256 KDF, so any sufficiently random secret works.
  * If unset entirely, a key is derived from SECRET_KEY (itself an env-provided
    secret) so the system runs without extra configuration; a dedicated
    EGN_ENCRYPTION_KEY is strongly recommended in production and a warning is
    logged when it is missing.
"""
from __future__ import annotations

import base64
import hashlib
import logging

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings

logger = logging.getLogger(__name__)
_warned = False


def _derive_fernet_key(secret: str) -> bytes:
    """Turn an arbitrary secret string into a valid 32-byte urlsafe Fernet key."""
    digest = hashlib.sha256(secret.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


def _resolve_key() -> bytes:
    raw = getattr(settings, "EGN_ENCRYPTION_KEY", "") or ""
    if raw:
        # Accept a ready-made Fernet key verbatim; otherwise stretch it.
        try:
            Fernet(raw.encode() if isinstance(raw, str) else raw)
            return raw.encode() if isinstance(raw, str) else raw
        except (ValueError, TypeError):
            return _derive_fernet_key(raw)
    # No dedicated key configured: derive from SECRET_KEY (itself an env-provided
    # secret, never hardcoded). Encryption still applies; a dedicated
    # EGN_ENCRYPTION_KEY is strongly recommended in production so EGN can be
    # re-keyed independently of SECRET_KEY. Warn once.
    global _warned
    if not _warned and not settings.DEBUG:
        logger.warning(
            "EGN_ENCRYPTION_KEY is not set; deriving the EGN key from SECRET_KEY. "
            "Set a dedicated EGN_ENCRYPTION_KEY in production."
        )
        _warned = True
    return _derive_fernet_key(f"egn:{settings.SECRET_KEY}")


def _fernet() -> Fernet:
    return Fernet(_resolve_key())


def encrypt_egn(plaintext: str) -> str:
    """Encrypt a plaintext EGN, returning an opaque token (str) to store."""
    if not plaintext:
        return ""
    token = _fernet().encrypt(plaintext.encode("utf-8"))
    return token.decode("ascii")


def decrypt_egn(token: str) -> str:
    """Decrypt a stored token back to plaintext EGN. Raises on tampering.

    Intended for server-side use only (e.g. building a partner submission).
    The plaintext must never be logged or returned to the frontend.
    """
    if not token:
        return ""
    try:
        return _fernet().decrypt(token.encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError) as exc:  # pragma: no cover - defensive
        raise ValueError("Could not decrypt EGN token.") from exc


def egn_last4(plaintext: str) -> str:
    """The last four digits, safe to store/display (e.g. ``******1234``)."""
    digits = "".join(ch for ch in (plaintext or "") if ch.isdigit())
    return digits[-4:] if len(digits) >= 4 else ""


def mask_egn(last4: str) -> str:
    """Render a masked EGN for internal display: ``******1234``."""
    return f"******{last4}" if last4 else ""
