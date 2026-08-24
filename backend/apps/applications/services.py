"""Application lifecycle services."""
from __future__ import annotations

from django.db import transaction

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.consents.services import has_required_consents, missing_required_consents
from apps.core.email import send_email
from apps.core.exceptions import VeyraAPIError

from .models import Application, ApplicationStatus, FinancialProfile


def sync_financial_profile(application: Application) -> FinancialProfile:
    """Mirror the application's financial snapshot into its FinancialProfile."""
    profile, _ = FinancialProfile.objects.update_or_create(
        application=application,
        defaults={
            "monthly_income": application.monthly_income,
            "employment_type": application.employment_type,
            "employment_duration": application.employment_months,
            "existing_debt": application.existing_loan_balance,
            "monthly_debt_payment": application.existing_monthly_payments,
            "requested_amount": application.requested_amount,
            "requested_term": application.requested_term_months,
            "loan_purpose": application.purpose,
        },
    )
    return profile


@transaction.atomic
def submit_application(application: Application, *, ip_hash: str = "") -> Application:
    """Validate consents, persist the financial profile, and mark submitted."""
    if application.status in (
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.QUALIFIED,
        ApplicationStatus.MATCHED,
        ApplicationStatus.ROUTED,
    ):
        return application

    if not has_required_consents(application):
        raise VeyraAPIError(
            code="CONSENT_REQUIRED",
            message="Required consents are missing.",
            details={"missing": missing_required_consents(application)},
            http_status=400,
        )

    sync_financial_profile(application)
    application.status = ApplicationStatus.SUBMITTED
    application.save(update_fields=["status", "updated_at"])

    record_audit(
        action=AuditAction.APPLICATION_SUBMITTED,
        entity_type="Application",
        entity_id=application.id,
        ip_hash=ip_hash,
        metadata={"reference": application.public_reference},
    )

    if application.email:
        # Customer-facing email — Bulgarian-first (see frontend i18n).
        send_email(
            subject="Получихме вашето заявление във Veyra",
            to=[application.email],
            body=(
                "Благодарим ви, че използвате Veyra. Разглеждаме предоставената от "
                f"вас информация (референция {application.public_reference}) и ще ви "
                "покажем подходящи опции от нашите финансови партньори.\n\n"
                "Veyra е маркетплейс и не взема решения за кредитиране. Крайното "
                "решение се взема от кредитора."
            ),
        )

    return application
