"""Health endpoint and analytics KPI aggregation."""
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.leads.models import LeadEventType
from apps.leads.services import record_lead_event, route_lead

pytestmark = pytest.mark.django_db


def test_health_endpoint(api_client):
    resp = api_client.get("/health/")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_kpis_reflect_funnel(admin_client, consented_application, product):
    lead = route_lead(consented_application, product)
    record_lead_event(lead, LeadEventType.FUNDED, metadata={"funded_amount": "1000"})

    resp = admin_client.get(reverse("analytics-kpis"))
    assert resp.status_code == 200
    data = resp.json()
    assert data["applications"] >= 1
    assert data["leads_routed"] >= 1
    assert data["funded"] >= 1
    assert Decimal(data["revenue"]) > 0
