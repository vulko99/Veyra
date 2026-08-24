"""Application create / update / submit / validation tests."""
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.applications.models import Application, ApplicationStatus
from apps.consents.models import ConsentType
from apps.consents.services import record_consent

pytestmark = pytest.mark.django_db


def test_create_application_no_account_required(api_client):
    url = reverse("application-list")
    payload = {
        "requested_amount": "1500",
        "requested_term_months": 12,
        "monthly_income": "2500",
        "employment_type": "FULL_TIME",
        "purpose": "MAJOR_PURCHASE",
        "email": "user@example.com",
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201
    body = resp.json()
    assert body["public_reference"].startswith("VEY-")
    assert body["status"] == ApplicationStatus.STARTED
    # Sequential DB ids are never exposed; the id is a UUID.
    assert "-" in body["id"]


def test_create_application_validation_rejects_nonpositive_amount(api_client):
    url = reverse("application-list")
    resp = api_client.post(
        url,
        {"requested_amount": "0", "requested_term_months": 12},
        format="json",
    )
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


def test_create_application_with_inline_consents(api_client):
    url = reverse("application-list")
    payload = {
        "requested_amount": "1500",
        "requested_term_months": 12,
        "consents": [
            {"consent_type": "PLATFORM_PROCESSING", "accepted": True},
            {"consent_type": "PARTNER_DATA_TRANSFER", "accepted": True},
        ],
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201
    app = Application.objects.get(id=resp.json()["id"])
    assert app.consents.filter(accepted=True).count() == 2


def test_retrieve_by_uuid(api_client, application):
    url = reverse("application-detail", args=[application.id])
    resp = api_client.get(url)
    assert resp.status_code == 200
    assert resp.json()["public_reference"] == application.public_reference


def test_submit_requires_consents(api_client, application):
    url = reverse("application-submit", args=[application.id])
    resp = api_client.post(url, {}, format="json")
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "CONSENT_REQUIRED"
    assert "PLATFORM_PROCESSING" in resp.json()["error"]["details"]["missing"]


def test_submit_succeeds_with_consents(api_client, consented_application):
    url = reverse("application-submit", args=[consented_application.id])
    resp = api_client.post(url, {}, format="json")
    assert resp.status_code == 200
    consented_application.refresh_from_db()
    assert consented_application.status == ApplicationStatus.SUBMITTED
    # Financial profile is created on submit.
    assert hasattr(consented_application, "financial_profile")


def test_submit_via_inline_consents(api_client, application):
    url = reverse("application-submit", args=[application.id])
    payload = {
        "consents": [
            {"consent_type": "PLATFORM_PROCESSING", "accepted": True},
            {"consent_type": "PARTNER_DATA_TRANSFER", "accepted": True},
        ]
    }
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 200
    application.refresh_from_db()
    assert application.status == ApplicationStatus.SUBMITTED


def test_ip_stored_hashed_not_raw(api_client):
    url = reverse("application-list")
    resp = api_client.post(
        url,
        {"requested_amount": "500", "requested_term_months": 6},
        format="json",
        REMOTE_ADDR="8.8.8.8",
    )
    app = Application.objects.get(id=resp.json()["id"])
    assert app.ip_hash and app.ip_hash != "8.8.8.8"
    assert len(app.ip_hash) == 64  # sha-256 hex
