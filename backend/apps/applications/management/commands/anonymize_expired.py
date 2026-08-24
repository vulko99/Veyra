"""GDPR retention: anonymise applications older than the retention window.

    python manage.py anonymize_expired [--days N] [--dry-run]

Removes/masks direct identifiers on old applications while preserving
aggregate/analytics-relevant, non-identifying fields and the audit trail.
"""
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.applications.models import Application, ApplicationStatus
from apps.audit.models import AuditAction
from apps.audit.services import record_audit


class Command(BaseCommand):
    help = "Anonymise applications past the data-retention window."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=None)
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        days = options["days"] or settings.DATA_RETENTION_DAYS
        cutoff = timezone.now() - timedelta(days=days)
        dry_run = options["dry_run"]

        qs = Application.objects.filter(created_at__lt=cutoff).exclude(
            status=ApplicationStatus.EXPIRED, email="", phone=""
        )

        count = 0
        for application in qs.iterator():
            if application.email == "" and application.phone == "":
                continue
            count += 1
            if dry_run:
                continue
            application.email = ""
            application.phone = ""
            application.city = ""
            application.ip_hash = ""
            application.user_agent_hash = ""
            if application.status not in (
                ApplicationStatus.FUNDED,
                ApplicationStatus.APPROVED,
            ):
                application.status = ApplicationStatus.EXPIRED
            application.save()

            # Purge the most sensitive linked record.
            profile = getattr(application, "financial_profile", None)
            if profile is not None:
                profile.delete()

            record_audit(
                action=AuditAction.DATA_ANONYMIZED,
                entity_type="Application",
                entity_id=application.id,
                actor_label="system:retention",
                metadata={"retention_days": days},
            )

        verb = "Would anonymise" if dry_run else "Anonymised"
        self.stdout.write(self.style.SUCCESS(f"{verb} {count} application(s)."))
