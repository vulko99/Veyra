"""Independent backend validation of the requested loan amount (Part 1).

The amount bounds are a single source of truth in settings.AMOUNT_* and are
enforced by the Phase 2 serializer regardless of the frontend. A value accepted
by the UI slider/input is validated again here; a value that bypasses the UI
(direct API call) is rejected with the same rules.
"""
from __future__ import annotations

import pytest
from django.conf import settings
from django.urls import reverse

pytestmark = pytest.mark.django_db


def _create(client, amount):
    return client.post(
        reverse("p2-application-create"),
        {"desired_amount_eur": amount, "desired_term_months": 12, "current_step": "amount"},
        format="json",
    )


def test_valid_on_step_amount_accepted(api_client):
    resp = _create(api_client, "7500")
    assert resp.status_code == 201, resp.content
    assert resp.json()["desired_amount_eur"] == "7500.00"


def test_minimum_boundary_accepted(api_client):
    resp = _create(api_client, str(settings.AMOUNT_MIN_EUR))
    assert resp.status_code == 201, resp.content


def test_maximum_boundary_accepted(api_client):
    resp = _create(api_client, str(settings.AMOUNT_MAX_EUR))
    assert resp.status_code == 201, resp.content


def test_below_minimum_rejected(api_client):
    resp = _create(api_client, str(settings.AMOUNT_MIN_EUR - settings.AMOUNT_STEP_EUR))
    assert resp.status_code == 400
    assert "desired_amount_eur" in resp.json()["error"]["details"]


def test_above_maximum_rejected(api_client):
    resp = _create(api_client, str(settings.AMOUNT_MAX_EUR + settings.AMOUNT_STEP_EUR))
    assert resp.status_code == 400
    assert "desired_amount_eur" in resp.json()["error"]["details"]


def test_off_step_rejected(api_client):
    # 7550 is within [min, max] but not a multiple of the step from the minimum.
    off = settings.AMOUNT_MIN_EUR + settings.AMOUNT_STEP_EUR + 50
    resp = _create(api_client, str(off))
    assert resp.status_code == 400
    assert "desired_amount_eur" in resp.json()["error"]["details"]


def test_patch_amount_validated_independently(api_client):
    created = _create(api_client, "2000")
    public_id = created.json()["id"]
    resp = api_client.patch(
        reverse("p2-application-detail", args=[public_id]),
        {"desired_amount_eur": str(settings.AMOUNT_MAX_EUR + 1000)},
        format="json",
    )
    assert resp.status_code == 400


def test_matching_receives_numeric_amount(api_client):
    # The stored value is the raw number, usable by the matching flow.
    resp = _create(api_client, "5000")
    assert resp.json()["desired_amount_eur"] == "5000.00"
