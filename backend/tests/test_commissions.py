"""Commission tests: payout calculation, funded conversion, clawback."""
from decimal import Decimal

import pytest

from apps.commissions.models import CommissionStatus
from apps.commissions.services import expected_amount_for
from apps.leads.models import LeadEventType
from apps.leads.services import record_lead_event, route_lead
from apps.lenders.models import PayoutModel

pytestmark = pytest.mark.django_db


def test_cpl_payout_is_flat(consented_application, product):
    product.payout_model = PayoutModel.CPL
    product.payout_value = Decimal("15.00")
    product.save()
    lead = route_lead(consented_application, product)
    assert expected_amount_for(lead) == Decimal("15.00")


def test_cps_percent_payout(consented_application, product):
    product.payout_model = PayoutModel.CPS_PERCENT
    product.payout_value = Decimal("5")  # 5%
    product.save()
    lead = route_lead(consented_application, product)
    # 5% of funded amount 2000.
    assert expected_amount_for(lead, funded_amount=Decimal("2000")) == Decimal("100.00")


def test_funded_event_creates_confirmed_commission(consented_application, product):
    lead = route_lead(consented_application, product)
    record_lead_event(
        lead, LeadEventType.FUNDED, metadata={"funded_amount": "2000"}
    )
    lead.refresh_from_db()
    commission = lead.commission
    assert commission.status == CommissionStatus.CONFIRMED
    assert commission.actual_amount == commission.expected_amount


def test_approved_creates_pending_commission(consented_application, product):
    lead = route_lead(consented_application, product)
    record_lead_event(lead, LeadEventType.APPROVED)
    lead.refresh_from_db()
    assert lead.commission.status == CommissionStatus.PENDING


def test_clawback_on_cancel_after_funding(consented_application, product):
    lead = route_lead(consented_application, product)
    record_lead_event(lead, LeadEventType.FUNDED)
    record_lead_event(lead, LeadEventType.CANCELLED)
    lead.refresh_from_db()
    assert lead.commission.status == CommissionStatus.CLAWBACK
    assert lead.commission.actual_amount == Decimal("0.00")
