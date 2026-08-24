"""Security tests: admin access control, ID enumeration, PII-safe logging."""
import logging
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.core.security import hash_value, mask_email, mask_phone

pytestmark = pytest.mark.django_db


def test_unauthorized_admin_endpoints_blocked(api_client, lender):
    # Creating a lender requires staff.
    resp = api_client.post(
        reverse("lender-list"),
        {"name": "X", "slug": "x"},
        format="json",
    )
    assert resp.status_code in (401, 403)


def test_admin_can_create_lender(admin_client):
    resp = admin_client.post(
        reverse("lender-list"),
        {"name": "Real Lender", "slug": "real-lender"},
        format="json",
    )
    assert resp.status_code == 201


def test_analytics_requires_admin(api_client):
    resp = api_client.get(reverse("analytics-kpis"))
    assert resp.status_code in (401, 403)


def test_leads_list_requires_admin(api_client):
    resp = api_client.get(reverse("lead-list"))
    assert resp.status_code in (401, 403)


def test_application_lookup_uses_uuid_not_sequential(api_client, application):
    # A sequential-style id must not resolve.
    resp = api_client.get("/api/v1/applications/1/")
    assert resp.status_code in (404, 400)


def test_public_lender_list_hides_inactive(api_client, lender, product_factory):
    lender.active = False
    lender.save()
    resp = api_client.get(reverse("lender-list"))
    assert resp.status_code == 200
    slugs = [l["slug"] for l in resp.json()["results"]]
    assert lender.slug not in slugs


def test_pii_masking_helpers():
    assert mask_email("john.doe@example.com") == "j***@example.com"
    assert mask_phone("+359881234567") == "********4567"
    assert hash_value("8.8.8.8") != "8.8.8.8"
    assert len(hash_value("x")) == 64


def test_sensitive_values_not_logged_in_email(caplog, api_client):
    """Creating an application must not log the raw email/phone."""
    with caplog.at_level(logging.INFO):
        api_client.post(
            reverse("application-list"),
            {
                "requested_amount": "500",
                "requested_term_months": 6,
                "email": "secret.person@example.com",
                "phone": "+359881234567",
            },
            format="json",
        )
    joined = " ".join(r.getMessage() for r in caplog.records)
    assert "secret.person@example.com" not in joined
    assert "+359881234567" not in joined
