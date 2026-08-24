"""Provider-agnostic email abstraction.

Business logic calls ``send_email(...)`` and never talks to a specific
provider. Swap the Django EMAIL_BACKEND (console, SMTP, Resend/SendGrid/SES
via an SMTP or API backend) without touching callers.
"""
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def send_email(
    *,
    subject: str,
    to: list[str],
    body: str,
    html_body: str | None = None,
    from_email: str | None = None,
) -> None:
    """Send an email through the configured backend. Failures are logged,
    never raised into business logic (email is best-effort in the MVP)."""
    message = EmailMultiAlternatives(
        subject=subject,
        body=body,
        from_email=from_email or settings.DEFAULT_FROM_EMAIL,
        to=to,
    )
    if html_body:
        message.attach_alternative(html_body, "text/html")
    try:
        message.send(fail_silently=False)
    except Exception:  # pragma: no cover - depends on provider
        logger.exception("email_send_failed", extra={"event": {"subject": subject}})


def send_admin_alert(subject: str, body: str) -> None:
    send_email(
        subject=f"[Veyra] {subject}",
        to=[settings.ADMIN_ALERT_EMAIL],
        body=body,
    )
