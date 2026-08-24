"""Webhook tests: valid, invalid signature, duplicate, unknown."""
import hashlib
import hmac
import json

import pytest
from django.urls import reverse

from apps.applications.models import ApplicationStatus
from apps.leads.models import LeadEvent, LeadStatus
from apps.leads.services import route_lead

pytestmark = pytest.mark.django_db


def _url(slug):
    return reverse("lender-webhook", args=[slug])


def test_valid_webhook_no_secret(api_client, consented_application, product):
    lead = route_lead(consented_application, product)
    resp = api_client.post(
        _url(product.lender.slug),
        {"tracking_id": lead.tracking_id, "event_type": "funded", "event_id": "e1"},
        format="json",
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["received"] is True and body["duplicate"] is False
    lead.refresh_from_db()
    assert lead.status == LeadStatus.FUNDED
    consented_application.refresh_from_db()
    assert consented_application.status == ApplicationStatus.FUNDED


def test_invalid_signature_rejected(api_client, consented_application, product, monkeypatch):
    lead = route_lead(consented_application, product)
    secret = "shh"
    monkeypatch.setenv(
        f"LENDER_{product.lender.slug.upper().replace('-', '_')}_WEBHOOK_SECRET", secret
    )
    resp = api_client.post(
        _url(product.lender.slug),
        data=json.dumps({"tracking_id": lead.tracking_id, "event_type": "funded"}),
        content_type="application/json",
        HTTP_X_SIGNATURE="sha256=deadbeef",
    )
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_SIGNATURE"


def test_valid_signature_accepted(api_client, consented_application, product, monkeypatch):
    lead = route_lead(consented_application, product)
    secret = "shh"
    monkeypatch.setenv(
        f"LENDER_{product.lender.slug.upper().replace('-', '_')}_WEBHOOK_SECRET", secret
    )
    body = json.dumps({"tracking_id": lead.tracking_id, "event_type": "approved"})
    sig = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()
    resp = api_client.post(
        _url(product.lender.slug),
        data=body,
        content_type="application/json",
        HTTP_X_SIGNATURE=f"sha256={sig}",
    )
    assert resp.status_code == 200


def test_duplicate_event_idempotent(api_client, consented_application, product):
    lead = route_lead(consented_application, product)
    payload = {"tracking_id": lead.tracking_id, "event_type": "approved", "event_id": "dup-1"}
    r1 = api_client.post(_url(product.lender.slug), payload, format="json")
    r2 = api_client.post(_url(product.lender.slug), payload, format="json")
    assert r1.json()["duplicate"] is False
    assert r2.json()["duplicate"] is True
    assert LeadEvent.objects.filter(lead=lead, external_event_id="dup-1").count() == 1


def test_unknown_event_type(api_client, consented_application, product):
    lead = route_lead(consented_application, product)
    resp = api_client.post(
        _url(product.lender.slug),
        {"tracking_id": lead.tracking_id, "event_type": "somethingweird"},
        format="json",
    )
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "UNKNOWN_EVENT_TYPE"


def test_unknown_lender_slug(api_client):
    resp = api_client.post(_url("no-such-lender"), {"event_type": "funded"}, format="json")
    assert resp.status_code == 404


def test_lead_not_found(api_client, product):
    resp = api_client.post(
        _url(product.lender.slug),
        {"tracking_id": "nonexistent", "event_type": "funded"},
        format="json",
    )
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "LEAD_NOT_FOUND"
