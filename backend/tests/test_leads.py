"""Lead routing, duplicate prevention, status transitions."""
import pytest

from apps.applications.models import ApplicationStatus
from apps.leads.models import Lead, LeadEvent, LeadEventType, LeadStatus
from apps.leads.services import record_lead_event, route_lead

pytestmark = pytest.mark.django_db


def test_route_creates_lead_and_updates_application(consented_application, product):
    consented_application.status = ApplicationStatus.MATCHED
    consented_application.save()
    lead = route_lead(consented_application, product)
    assert lead.status == LeadStatus.SENT
    assert lead.tracking_id
    consented_application.refresh_from_db()
    assert consented_application.status == ApplicationStatus.ROUTED


def test_route_is_idempotent(consented_application, product):
    lead1 = route_lead(consented_application, product)
    lead2 = route_lead(consented_application, product)
    assert lead1.id == lead2.id
    assert Lead.objects.filter(application=consented_application, product=product).count() == 1


def test_status_transitions_via_events(consented_application, product):
    lead = route_lead(consented_application, product)
    record_lead_event(lead, LeadEventType.CLICK)
    lead.refresh_from_db()
    assert lead.status == LeadStatus.CLICKED

    record_lead_event(lead, LeadEventType.APPROVED)
    lead.refresh_from_db()
    assert lead.status == LeadStatus.APPROVED
    consented_application.refresh_from_db()
    assert consented_application.status == ApplicationStatus.APPROVED


def test_duplicate_event_prevention(consented_application, product):
    lead = route_lead(consented_application, product)
    _, created1 = record_lead_event(
        lead, LeadEventType.FUNDED, external_event_id="evt-123"
    )
    _, created2 = record_lead_event(
        lead, LeadEventType.FUNDED, external_event_id="evt-123"
    )
    assert created1 is True
    assert created2 is False
    assert LeadEvent.objects.filter(lead=lead, external_event_id="evt-123").count() == 1
