"""
Base settings shared across all environments.

Environment-specific settings live in development.py and production.py.
Secrets and environment-specific values are read from environment variables
(never hard-coded, never committed).
"""
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

from .env import env_bool, env_list, env_str

# backend/config/settings/base.py -> backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load a .env file if present (development convenience; production uses real env).
load_dotenv(BASE_DIR.parent / ".env")

# --------------------------------------------------------------------------
# Core security
# --------------------------------------------------------------------------
SECRET_KEY = env_str("DJANGO_SECRET_KEY", "insecure-dev-key-change-me")
DEBUG = env_bool("DEBUG", False)
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", ["localhost", "127.0.0.1"])

# --------------------------------------------------------------------------
# Applications
# --------------------------------------------------------------------------
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
    "django_filters",
]

LOCAL_APPS = [
    "apps.core",
    "apps.accounts",
    "apps.consents",
    "apps.applications",
    "apps.lenders",
    "apps.matching",
    "apps.leads",
    "apps.commissions",
    "apps.analytics",
    "apps.audit",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "apps.core.middleware.RequestIDMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --------------------------------------------------------------------------
# Database
# --------------------------------------------------------------------------
DATABASES = {
    "default": dj_database_url.parse(
        env_str("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600,
    )
}

# --------------------------------------------------------------------------
# Password validation
# --------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# --------------------------------------------------------------------------
# Internationalization
# --------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Europe/Sofia"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------
# Static files
# --------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

# --------------------------------------------------------------------------
# Django REST Framework
# --------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
    "EXCEPTION_HANDLER": "apps.core.exceptions.veyra_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": env_str("THROTTLE_ANON", "60/min"),
        "application_submit": env_str("THROTTLE_APPLICATION_SUBMIT", "10/min"),
        "webhook": env_str("THROTTLE_WEBHOOK", "120/min"),
    },
}

# --------------------------------------------------------------------------
# CORS / CSRF
# --------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", ["http://localhost:3000"])
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", ["http://localhost:3000"])
CORS_ALLOW_CREDENTIALS = True

# --------------------------------------------------------------------------
# Celery
# --------------------------------------------------------------------------
CELERY_BROKER_URL = env_str("REDIS_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env_str("REDIS_URL", "redis://localhost:6379/0")
CELERY_TASK_ALWAYS_EAGER = env_bool("CELERY_TASK_ALWAYS_EAGER", False)
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"

# --------------------------------------------------------------------------
# Email (provider-agnostic abstraction; see apps.core.email)
# --------------------------------------------------------------------------
EMAIL_BACKEND = env_str(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
DEFAULT_FROM_EMAIL = env_str("DEFAULT_FROM_EMAIL", "Veyra <noreply@veyra.example>")
ADMIN_ALERT_EMAIL = env_str("ADMIN_ALERT_EMAIL", "alerts@veyra.example")

# --------------------------------------------------------------------------
# Veyra domain configuration
# --------------------------------------------------------------------------
# Salt used when hashing PII for storage (IP, user agent). Rotate with care.
HASH_SALT = env_str("HASH_SALT", "veyra-dev-hash-salt")

# Demo mode. When on, fictional demo partners participate in matching and any
# referral to them is simulated (never emailed / no external API call). Turn it
# OFF in production so only real, configured partners are used.
DEMO_MODE = env_bool("DEMO_MODE", True)

# Matching engine
MATCHING_TOP_N = int(env_str("MATCHING_TOP_N", "3"))
# Global compatibility-score threshold (0-100). A partner product is eligible
# for referral only when its score is >= this value. Partners may override it
# with a higher (or lower) minimum_match_score. Never hard-code this elsewhere.
MATCH_THRESHOLD = int(env_str("MATCH_THRESHOLD", "80"))

# Loan-amount bounds (EUR). Single source of truth for backend validation;
# the frontend mirrors these via NEXT_PUBLIC_AMOUNT_* (see frontend/lib/amount.ts).
# The API validates amount independently of the frontend against these values.
AMOUNT_MIN_EUR = int(env_str("AMOUNT_MIN_EUR", "200"))
AMOUNT_MAX_EUR = int(env_str("AMOUNT_MAX_EUR", "15000"))
AMOUNT_STEP_EUR = int(env_str("AMOUNT_STEP_EUR", "100"))

# Current document versions surfaced to consent capture.
PRIVACY_POLICY_VERSION = env_str("PRIVACY_POLICY_VERSION", "2026-01-01")
TERMS_VERSION = env_str("TERMS_VERSION", "2026-01-01")

# Version of the CONSENT CHECKBOX WORDING shown in the funnel — tracked
# separately from the policy documents, because the wording can change without
# the privacy policy changing (and vice versa). Recorded against every consent
# so we can prove exactly what text a user agreed to.
#
# BUMP THIS whenever the consent copy in
# frontend/i18n/dictionaries/*.ts -> apply.steps.consent changes.
CONSENT_TEXT_VERSION = env_str("CONSENT_TEXT_VERSION", "2026-09-01")

# Data retention (days) used by anonymization workflow.
DATA_RETENTION_DAYS = int(env_str("DATA_RETENTION_DAYS", "365"))

# --------------------------------------------------------------------------
# EGN (Bulgarian national id) — sensitive identity data
# --------------------------------------------------------------------------
# Reversible encryption key for EGN at rest (see apps.core.crypto). Read from
# the environment; NEVER hardcoded, NEVER exposed to the frontend. In DEBUG a
# key is derived from SECRET_KEY so dev/tests run without config; production
# (DEBUG=False) requires an explicit value.
EGN_ENCRYPTION_KEY = env_str("EGN_ENCRYPTION_KEY", "")

# Retention window (days) for stored EGN. Deletion is NOT performed
# automatically until a retention policy is legally approved and a cleanup task
# is enabled — this value only records the intended period. 0 = unset.
EGN_RETENTION_DAYS = int(env_str("EGN_RETENTION_DAYS", "0"))

# --------------------------------------------------------------------------
# Partner integrations (server-side only; NEVER exposed to the frontend)
# --------------------------------------------------------------------------
# Iute partner API configuration. Endpoints/credentials are NOT invented here —
# blank until a real integration is provisioned. The frontend never calls a
# partner API directly; all traffic goes Frontend -> Veyra -> Partner Adapter.
IUTE_API_BASE_URL = env_str("IUTE_API_BASE_URL", "")
IUTE_API_KEY = env_str("IUTE_API_KEY", "")
IUTE_CLIENT_ID = env_str("IUTE_CLIENT_ID", "")
IUTE_CLIENT_SECRET = env_str("IUTE_CLIENT_SECRET", "")

# Current Privacy Notice version presented to users and recorded against
# consent. Bump when the notice content materially changes.
PRIVACY_NOTICE_VERSION = env_str("PRIVACY_NOTICE_VERSION", "1.0")

# --------------------------------------------------------------------------
# Logging (structured, PII-safe; see apps.core.logging)
# --------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "request_id": {
            "()": "apps.core.logging.RequestIDFilter",
        },
    },
    "formatters": {
        "json": {
            "()": "apps.core.logging.JSONFormatter",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "filters": ["request_id"],
        },
    },
    "root": {
        "handlers": ["console"],
        "level": env_str("LOG_LEVEL", "INFO"),
    },
    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
