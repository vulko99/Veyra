"""Phase 2 API serializers (public, EUR-native, keyed by VY- public_id)."""
from __future__ import annotations

from rest_framework import serializers

from apps.applications.models import Applicant, Application, EmploymentStatus


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
        max_digits=12, decimal_places=2, required=False, allow_null=True, min_value=0
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
