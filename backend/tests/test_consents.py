"""Consent tests: required vs optional, versioning."""
import pytest

from apps.consents.models import Consent, ConsentType
from apps.consents.services import (
    has_required_consents,
    missing_required_consents,
    record_consent,
)

pytestmark = pytest.mark.django_db


def test_marketing_consent_is_optional(application):
    record_consent(
        application=application,
        consent_type=ConsentType.PLATFORM_PROCESSING,
        accepted=True,
        consent_text_version="1",
    )
    record_consent(
        application=application,
        consent_type=ConsentType.PARTNER_DATA_TRANSFER,
        accepted=True,
        consent_text_version="1",
    )
    # No marketing consent given -> still allowed to proceed.
    assert has_required_consents(application) is True
    assert ConsentType.MARKETING not in missing_required_consents(application)


def test_required_consents_missing(application):
    record_consent(
        application=application,
        consent_type=ConsentType.PLATFORM_PROCESSING,
        accepted=True,
        consent_text_version="1",
    )
    assert has_required_consents(application) is False
    assert ConsentType.PARTNER_DATA_TRANSFER in missing_required_consents(application)


def test_consent_versioning_recorded(application, settings):
    settings.PRIVACY_POLICY_VERSION = "2026-06-01"
    settings.TERMS_VERSION = "2026-06-02"
    consent = record_consent(
        application=application,
        consent_type=ConsentType.PLATFORM_PROCESSING,
        accepted=True,
        consent_text_version="v3",
    )
    assert consent.consent_text_version == "v3"
    assert consent.privacy_policy_version == "2026-06-01"
    assert consent.terms_version == "2026-06-02"
    assert consent.accepted_at is not None


def test_consent_update_is_idempotent_per_type(application):
    record_consent(
        application=application,
        consent_type=ConsentType.MARKETING,
        accepted=False,
        consent_text_version="1",
    )
    record_consent(
        application=application,
        consent_type=ConsentType.MARKETING,
        accepted=True,
        consent_text_version="1",
    )
    assert Consent.objects.filter(
        application=application, consent_type=ConsentType.MARKETING
    ).count() == 1
