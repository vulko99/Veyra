"""Development settings.

Convenient defaults for local work. Never use in production.
"""
from .base import *  # noqa: F401,F403
from .env import env_bool

DEBUG = env_bool("DEBUG", True)

ALLOWED_HOSTS = ["*"]

# In development, run Celery tasks synchronously unless a broker is configured.
CELERY_TASK_ALWAYS_EAGER = env_bool("CELERY_TASK_ALWAYS_EAGER", True)

# Relax secure-cookie flags for plain-HTTP local dev.
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Console email backend so no messages leave the machine.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
