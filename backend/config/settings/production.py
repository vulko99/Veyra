"""Production settings.

Hardened defaults. All secrets come from the environment. This module is
cloud-agnostic: it works anywhere DATABASE_URL / REDIS_URL are provided
(AWS, Railway, Render, ...).
"""
from .base import *  # noqa: F401,F403
from .env import env_bool, env_str

DEBUG = False

# ALLOWED_HOSTS must be provided explicitly in production.
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", [])  # noqa: F405

# --------------------------------------------------------------------------
# HTTPS / secure cookies
# --------------------------------------------------------------------------
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SECURE_HSTS_SECONDS = int(env_str("SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# Trust the X-Forwarded-Proto header from the load balancer / proxy.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --------------------------------------------------------------------------
# Sentry (optional, provider-agnostic error tracking)
# --------------------------------------------------------------------------
SENTRY_DSN = env_str("SENTRY_DSN", "")
if SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            integrations=[DjangoIntegration()],
            traces_sample_rate=float(env_str("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            send_default_pii=False,  # never ship PII to the error tracker
        )
    except ImportError:  # pragma: no cover - optional dependency
        pass
