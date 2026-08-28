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

# Matching engine
MATCHING_TOP_N = int(env_str("MATCHING_TOP_N", "3"))
# Global compatibility-score threshold (0-100). A partner product is eligible
# for referral only when its score is >= this value. Partners may override it
# with a higher (or lower) minimum_match_score. Never hard-code this elsewhere.
MATCH_THRESHOLD = int(env_str("MATCH_THRESHOLD", "80"))

# Current document versions surfaced to consent capture.
PRIVACY_POLICY_VERSION = env_str("PRIVACY_POLICY_VERSION", "2026-01-01")
TERMS_VERSION = env_str("TERMS_VERSION", "2026-01-01")

# Data retention (days) used by anonymization workflow.
DATA_RETENTION_DAYS = int(env_str("DATA_RETENTION_DAYS", "365"))

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
