"""Serializers for the application funnel."""
from rest_framework import serializers

from apps.consents.models import Consent, ConsentType

from .models import Application

# Fields a client may set when creating/updating an application.
_WRITABLE_FIELDS = [
    "requested_amount",
    "requested_currency",
    "requested_term_months",
    "monthly_income",
    "income_currency",
    "employment_type",
    "employment_months",
    "has_existing_loans",
    "existing_loan_balance",
    "existing_monthly_payments",
    "purpose",
    "city",
    "age_range",
    "email",
    "phone",
    "source",
    "campaign",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "referrer",
    "landing_page",
]


class ConsentInputSerializer(serializers.Serializer):
    consent_type = serializers.ChoiceField(choices=ConsentType.choices)
    accepted = serializers.BooleanField()
    consent_text_version = serializers.CharField(max_length=40, required=False, default="1")


class ApplicationCreateSerializer(serializers.ModelSerializer):
    consents = ConsentInputSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = Application
        fields = _WRITABLE_FIELDS + ["consents"]

    def validate_requested_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Requested amount must be positive.")
        return value

    def validate_requested_term_months(self, value):
        if value <= 0:
            raise serializers.ValidationError("Requested term must be positive.")
        return value


class ConsentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = [
            "consent_type",
            "accepted",
            "accepted_at",
            "consent_text_version",
            "privacy_policy_version",
            "terms_version",
        ]


class ApplicationReadSerializer(serializers.ModelSerializer):
    """Public read shape. Never exposes hashed fingerprints or the raw UUID
    as a guessable resource key beyond what the client already holds."""

    consents = ConsentReadSerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "public_reference",
            "status",
            "requested_amount",
            "requested_currency",
            "requested_term_months",
            "monthly_income",
            "income_currency",
            "employment_type",
            "employment_months",
            "has_existing_loans",
            "existing_loan_balance",
            "existing_monthly_payments",
            "purpose",
            "city",
            "age_range",
            "email",
            "phone",
            "created_at",
            "updated_at",
            "consents",
        ]
        read_only_fields = fields


class ApplicationAdminListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "id",
            "public_reference",
            "created_at",
            "requested_amount",
            "requested_term_months",
            "monthly_income",
            "status",
            "source",
        ]
