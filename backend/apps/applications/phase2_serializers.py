"""Phase 2 API serializers (public, EUR-native, keyed by VY- public_id)."""
from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from rest_framework import serializers

from apps.applications.models import Applicant, Application, EmploymentStatus


def validate_requested_amount(value):
    """Independent backend validation of the requested amount (EUR).

    Mirrors frontend/lib/amount.ts against settings.AMOUNT_* — the single source
    of truth shared with the frontend. Enforced here so a value that bypasses the
    UI (direct API call) is still rejected. ``None`` passes (partial drafts).
    """
    if value is None:
        return value
    lo = Decimal(settings.AMOUNT_MIN_EUR)
    hi = Decimal(settings.AMOUNT_MAX_EUR)
    step = Decimal(settings.AMOUNT_STEP_EUR)
    if value < lo:
        raise serializers.ValidationError(
            f"Минималната сума е {settings.AMOUNT_MIN_EUR}."
        )
    if value > hi:
        raise serializers.ValidationError(
            f"Максималната сума е {settings.AMOUNT_MAX_EUR}."
        )
    if step > 0 and (value - lo) % step != 0:
        raise serializers.ValidationError(
            f"Сумата трябва да е кратна на {settings.AMOUNT_STEP_EUR}."
        )
    return value


class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "monthly_income_eur",
            "employment_status",
            "existing_monthly_obligations_eur",
        ]


class ApplicationWriteSerializer(serializers.Serializer):
    """Accepts partial application data for create / step PATCH."""

    desired_amount_eur = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True,
        min_value=0,
        validators=[validate_requested_amount],
    )
    desired_term_months = serializers.IntegerField(
        required=False, allow_null=True, min_value=1, max_value=120
    )
    current_step = serializers.CharField(required=False, allow_blank=True, max_length=32)
    source = serializers.CharField(required=False, allow_blank=True, max_length=120)
    utm_source = serializers.CharField(required=False, allow_blank=True, max_length=120)
    utm_medium = serializers.CharField(required=False, allow_blank=True, max_length=120)
    utm_campaign = serializers.CharField(required=False, allow_blank=True, max_length=120)
    utm_term = serializers.CharField(required=False, allow_blank=True, max_length=120)
    utm_content = serializers.CharField(required=False, allow_blank=True, max_length=120)
    referrer = serializers.CharField(required=False, allow_blank=True, max_length=500)
    landing_page = serializers.CharField(required=False, allow_blank=True, max_length=500)

    # Applicant fields (flat, mapped onto the Applicant record).
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=120)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=120)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=32)
    monthly_income_eur = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True, min_value=0
    )
    employment_status = serializers.ChoiceField(
        choices=EmploymentStatus.choices, required=False, allow_blank=True
    )
    existing_monthly_obligations_eur = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True, min_value=0
    )


class ApplicationReadSerializer(serializers.ModelSerializer):
    """Public read shape. Exposes the VY- id, never the database primary key or
    hashed fingerprints; applicant data is limited to what the client submitted."""

    id = serializers.CharField(source="public_id", read_only=True)
    desired_amount_eur = serializers.DecimalField(
        source="requested_amount", max_digits=12, decimal_places=2, read_only=True
    )
    desired_term_months = serializers.IntegerField(
        source="requested_term_months", read_only=True
    )
    applicant = ApplicantSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "status",
            "current_step",
            "desired_amount_eur",
            "desired_term_months",
            "requested_currency",
            "applicant",
            "created_at",
            "updated_at",
            "completed_at",
        ]
        read_only_fields = fields


class ConsentInputSerializer(serializers.Serializer):
    privacy_processing_consent = serializers.BooleanField()
    partner_data_sharing_consent = serializers.BooleanField()
    marketing_consent = serializers.BooleanField(required=False, default=False)


class SelectPartnerSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()


class EgnInputSerializer(serializers.Serializer):
    """EGN input. Exactly 10 digits; validated again server-side in the service.

    ``write_only`` and never echoed: the response returns only the masked value.
    """

    egn = serializers.RegexField(
        r"^\d{10}$",
        write_only=True,
        error_messages={"invalid": "Моля, въведи валидно ЕГН от 10 цифри."},
    )
