"""Phase 3: partner lifecycle, three-state eligibility, age, score, public API.

These tests cover the Phase 3 additions layered on the existing Phase 1/2
domain: partner status/type, UNKNOWN-safe rule evaluation, age criteria, the
structured MatchResult snapshot, compatibility score, referral-only-on-action,
and the read-only public partner API. Nothing here relies on real partner data.
"""
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.applications.models import Application, ApplicationStatus
from apps.leads.models import Lead, LeadStatus
from apps.lenders.models import (
    EligibilityRule,
    Lender,
    LenderProduct,
    PartnerStatus,
    PartnerType,
    ProductType,
    RuleField,
    RuleOperator,
)
from apps.matching.engine import build_context, evaluate_product_detailed
from apps.matching.models import Match, MatchStatus
from apps.matching.phase2 import match_application_v2
from apps.matching.rules import RuleOutcome, evaluate_rule_outcome

pytestmark = pytest.mark.django_db


def _rows(resp):
    """Return the list rows from a DRF response, paginated or not."""
    body = resp.json()
    return body["results"] if isinstance(body, dict) and "results" in body else body


# --------------------------------------------------------------------------
# Partner lifecycle
# --------------------------------------------------------------------------
def test_partner_defaults_are_active_lender():
    lender = Lender.objects.create(name="Acme", slug="acme")
    assert lender.status == PartnerStatus.ACTIVE
    assert lender.partner_type == PartnerType.LENDER
    assert lender.active is True


def test_partner_status_paused_deactivates():
    lender = Lender.objects.create(name="Acme", slug="acme", status=PartnerStatus.PAUSED)
    # A non-active status forces the legacy matching switch off.
    assert lender.active is False


def test_setting_active_false_reflects_as_inactive_status():
    lender = Lender.objects.create(name="Acme", slug="acme")
    lender.active = False
    lender.save()
    assert lender.status == PartnerStatus.INACTIVE


def test_display_and_legal_name_fall_back_to_name():
    lender = Lender.objects.create(name="Acme", slug="acme")
    assert lender.public_name == "Acme"
    assert lender.registered_name == "Acme"
    lender.display_name = "Acme Loans"
    lender.legal_name = "Acme Financial EOOD"
    assert lender.public_name == "Acme Loans"
    assert lender.registered_name == "Acme Financial EOOD"


# --------------------------------------------------------------------------
# Three-state rule evaluation
# --------------------------------------------------------------------------
def test_rule_outcome_pass_fail_unknown():
    assert evaluate_rule_outcome(RuleOperator.GREATER_THAN_OR_EQUAL, 5, 3) == RuleOutcome.PASS
    assert evaluate_rule_outcome(RuleOperator.GREATER_THAN_OR_EQUAL, 1, 3) == RuleOutcome.FAIL
    # Missing applicant value -> UNKNOWN, not FAIL.
    assert evaluate_rule_outcome(RuleOperator.GREATER_THAN_OR_EQUAL, None, 3) == RuleOutcome.UNKNOWN
    assert evaluate_rule_outcome(RuleOperator.IN, "", ["A"]) == RuleOutcome.UNKNOWN


def _app(**kwargs):
    defaults = dict(
        requested_amount=Decimal("1000"),
        requested_term_months=12,
        monthly_income=Decimal("2500"),
        employment_type="FULL_TIME",
        status=ApplicationStatus.SUBMITTED,
    )
    defaults.update(kwargs)
    return Application.objects.create(**defaults)


def test_unknown_optional_rule_keeps_product_eligible(product, make_rule):
    # Optional rule on a field the applicant did not provide -> UNKNOWN, still eligible.
    make_rule(product, RuleField.EMPLOYMENT_MONTHS, RuleOperator.GREATER_THAN_OR_EQUAL, 6)
    app = _app(employment_months=None)
    result = evaluate_product_detailed(build_context(app), product)
    assert result["eligible"] is True
    assert result["status"] == MatchStatus.UNKNOWN
    assert result["evaluation"]["employment_months"] == RuleOutcome.UNKNOWN


def test_unknown_mandatory_rule_excludes_product(product, make_rule):
    make_rule(
        product,
        RuleField.EMPLOYMENT_MONTHS,
        RuleOperator.GREATER_THAN_OR_EQUAL,
        6,
        mandatory=True,
    )
    app = _app(employment_months=None)
    result = evaluate_product_detailed(build_context(app), product)
    assert result["eligible"] is False
    assert result["status"] == MatchStatus.INELIGIBLE


def test_failing_rule_marks_ineligible(product, make_rule):
    make_rule(product, RuleField.EMPLOYMENT_TYPE, RuleOperator.NOT_EQUALS, "UNEMPLOYED")
    app = _app(employment_type="UNEMPLOYED")
    result = evaluate_product_detailed(build_context(app), product)
    assert result["eligible"] is False
    assert result["evaluation"]["employment_type"] == RuleOutcome.FAIL


def test_all_pass_is_eligible_status(product):
    result = evaluate_product_detailed(build_context(_app()), product)
    assert result["status"] == MatchStatus.ELIGIBLE
    assert result["evaluation"]["amount"] == RuleOutcome.PASS


# --------------------------------------------------------------------------
# Age criteria
# --------------------------------------------------------------------------
def test_age_within_bounds_passes(product):
    product.min_age, product.max_age = 21, 70
    product.save()
    app = _app(age_range="30-39")
    result = evaluate_product_detailed(build_context(app), product)
    assert result["evaluation"]["age"] == RuleOutcome.PASS
    assert result["eligible"] is True


def test_age_below_minimum_fails(product):
    product.min_age = 25
    product.save()
    app = _app(age_range="18-24")  # lower bound 18 < 25
    result = evaluate_product_detailed(build_context(app), product)
    assert result["evaluation"]["age"] == RuleOutcome.FAIL
    assert result["eligible"] is False


def test_age_missing_is_unknown_not_rejected(product):
    product.min_age = 25
    product.save()
    app = _app(age_range="")
    result = evaluate_product_detailed(build_context(app), product)
    assert result["evaluation"]["age"] == RuleOutcome.UNKNOWN
    assert result["eligible"] is True


# --------------------------------------------------------------------------
# MatchResult snapshot + compatibility score (via the Phase 2 service)
# --------------------------------------------------------------------------
@pytest.fixture
def partner_product(db):
    lender = Lender.objects.create(
        name="Demo Partner", slug="demo-partner", display_order=1, priority=30
    )
    product = LenderProduct.objects.create(
        lender=lender,
        name="Consumer",
        slug="consumer",
        product_type=ProductType.CONSUMER_LOAN,
        min_amount=Decimal("500"),
        max_amount=Decimal("5000"),
        currency="EUR",
        min_term_months=3,
        max_term_months=36,
        min_income=Decimal("800"),
        priority=90,
        application_url="https://example.com/apply",
    )
    return product


def _ready_application(consented=True):
    from apps.applications.models import Applicant
    from apps.consents.models import ConsentType
    from apps.consents.services import record_consent

    applicant = Applicant.objects.create(
        monthly_income_eur=Decimal("2000"), employment_status="employed"
    )
    app = Application.objects.create(
        requested_amount=Decimal("2000"),
        requested_term_months=12,
        applicant=applicant,
        status=ApplicationStatus.COMPLETED,
    )
    if consented:
        for ct in (ConsentType.PLATFORM_PROCESSING, ConsentType.PARTNER_DATA_TRANSFER):
            record_consent(
                application=app, consent_type=ct, accepted=True, consent_text_version="1"
            )
    return app


def test_match_result_stores_evaluation_and_summary(partner_product):
    app = _ready_application()
    match_application_v2(app)
    match = Match.objects.get(application=app, product=partner_product)
    assert match.status == MatchStatus.ELIGIBLE
    assert match.evaluation["amount"] == RuleOutcome.PASS
    assert match.evaluation["term"] == RuleOutcome.PASS
    assert match.reason_summary  # neutral, non-empty


def test_compatibility_score_present_and_bounded(partner_product):
    app = _ready_application()
    results = match_application_v2(app)
    assert results
    score = results[0]["compatibility_score"]
    assert isinstance(score, int)
    assert 0 <= score <= 100


def test_score_is_deterministic(partner_product):
    app1 = _ready_application()
    app2 = _ready_application()
    r1 = match_application_v2(app1)
    r2 = match_application_v2(app2)
    assert r1[0]["compatibility_score"] == r2[0]["compatibility_score"]


# --------------------------------------------------------------------------
# Referral only on explicit action
# --------------------------------------------------------------------------
def test_matching_does_not_create_referral(partner_product):
    app = _ready_application()
    match_application_v2(app)
    # Finding a match must NEVER create a referral on its own.
    assert Lead.objects.filter(application=app).count() == 0


def test_cancelled_is_a_valid_referral_state():
    assert LeadStatus.CANCELLED in LeadStatus.values


# --------------------------------------------------------------------------
# Public partner API
# --------------------------------------------------------------------------
def test_public_partners_list_excludes_inactive(api_client, partner_product):
    other = Lender.objects.create(name="Hidden", slug="hidden", status=PartnerStatus.INACTIVE)
    resp = api_client.get(reverse("partner-list"))
    assert resp.status_code == 200
    slugs = {p["slug"] for p in _rows(resp)}
    assert "demo-partner" in slugs
    assert other.slug not in slugs


def test_public_partner_detail_returns_products(api_client, partner_product):
    resp = api_client.get(reverse("partner-detail", args=[str(partner_product.lender_id)]))
    assert resp.status_code == 200
    body = resp.json()
    assert body["display_name"] == "Demo Partner"
    assert len(body["products"]) == 1


def test_public_partner_products_filter_by_partner(api_client, partner_product):
    resp = api_client.get(
        reverse("partner-product-list"), {"partner": str(partner_product.lender_id)}
    )
    assert resp.status_code == 200
    rows = _rows(resp)
    assert len(rows) == 1
    assert rows[0]["slug"] == "consumer"


def test_public_partner_products_exclude_inactive_products(api_client, partner_product):
    partner_product.active = False
    partner_product.save()
    resp = api_client.get(reverse("partner-product-list"))
    assert resp.status_code == 200
    assert _rows(resp) == []


# --------------------------------------------------------------------------
# EUR handling for the new domain
# --------------------------------------------------------------------------
def test_demo_products_use_eur(db):
    from django.core.management import call_command

    call_command("seed_demo_data")
    assert LenderProduct.objects.exists()
    assert not LenderProduct.objects.exclude(currency="EUR").exists()
