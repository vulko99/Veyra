"""Phase 2: application funnel, matching engine, referral, events."""
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.applications.models import (
    Applicant,
    Application,
    ApplicationEvent,
    ApplicationEventType,
    ApplicationStatus,
)
from apps.leads.models import Lead, ReferralStatus
from apps.lenders.models import (
    EligibilityRule,
    Lender,
    LenderProduct,
    ProductType,
    RuleField,
    RuleOperator,
)
from apps.matching.models import Match

pytestmark = pytest.mark.django_db


# --------------------------------------------------------------------------
# Fixtures — demo partners / products / rules
# --------------------------------------------------------------------------
@pytest.fixture
def partner_a(db):
    lender = Lender.objects.create(
        name="Demo Partner A", slug="demo-a", active=True, display_order=1, priority=30
    )
    product = LenderProduct.objects.create(
        lender=lender,
        name="Short-Term A",
        slug="short-a",
        product_type=ProductType.SHORT_TERM_LOAN,
        min_amount=Decimal("500"),
        max_amount=Decimal("3000"),
        currency="EUR",
        min_term_months=3,
        max_term_months=24,
        min_income=Decimal("800"),
        priority=80,
        application_url="https://example.com/a/apply",
    )
    EligibilityRule.objects.create(
        product=product,
        field=RuleField.EMPLOYMENT_TYPE,
        operator=RuleOperator.IN,
        value=["employed", "self_employed"],
        show_reason_to_customer=False,
    )
    return product


@pytest.fixture
def partner_b(db):
    lender = Lender.objects.create(
        name="Demo Partner B", slug="demo-b", active=True, display_order=2, priority=20
    )
    return LenderProduct.objects.create(
        lender=lender,
        name="Consumer B",
        slug="consumer-b",
        product_type=ProductType.CONSUMER_LOAN,
        min_amount=Decimal("500"),
        max_amount=Decimal("5000"),
        currency="EUR",
        min_term_months=3,
        max_term_months=36,
        min_income=Decimal("1000"),
        priority=90,
        application_url="https://example.com/b/apply",
    )


def _create_application(client, **overrides):
    payload = {
        "desired_amount_eur": "2000",
        "desired_term_months": 12,
        "current_step": "amount",
    }
    payload.update(overrides)
    resp = client.post(reverse("p2-application-create"), payload, format="json")
    assert resp.status_code == 201, resp.content
    return resp.json()


def _fill_profile(client, public_id, **overrides):
    payload = {
        "first_name": "Ivan",
        "last_name": "Ivanov",
        "email": "ivan@example.com",
        "phone": "+359881234567",
        "monthly_income_eur": "2000",
        "employment_status": "employed",
        "existing_monthly_obligations_eur": "0",
    }
    payload.update(overrides)
    resp = client.patch(
        reverse("p2-application-detail", args=[public_id]), payload, format="json"
    )
    assert resp.status_code == 200, resp.content
    return resp.json()


def _grant_consent(client, public_id, marketing=False):
    resp = client.post(
        reverse("p2-application-consent", args=[public_id]),
        {
            "privacy_processing_consent": True,
            "partner_data_sharing_consent": True,
            "marketing_consent": marketing,
        },
        format="json",
    )
    assert resp.status_code == 200, resp.content


# --------------------------------------------------------------------------
# Application lifecycle
# --------------------------------------------------------------------------
def test_create_returns_public_vy_id_not_db_id(api_client):
    data = _create_application(api_client)
    assert data["id"].startswith("VY-")
    # The database UUID/pk must never appear in the response.
    app = Application.objects.get(public_id=data["id"])
    assert str(app.id) not in str(data)
    # Creating with initial data advances STARTED -> IN_PROGRESS.
    assert app.status == ApplicationStatus.IN_PROGRESS


def test_started_event_recorded_on_create(api_client):
    data = _create_application(api_client)
    app = Application.objects.get(public_id=data["id"])
    types = list(app.events.values_list("event_type", flat=True))
    assert ApplicationEventType.APPLICATION_STARTED in types


def test_patch_persists_and_survives_reload(api_client):
    data = _create_application(api_client)
    pid = data["id"]
    _fill_profile(api_client, pid, monthly_income_eur="1750")
    # Fetch fresh (simulates refresh) — state is server-side.
    resp = api_client.get(reverse("p2-application-detail", args=[pid]))
    body = resp.json()
    assert body["desired_amount_eur"] == "2000.00"
    assert body["applicant"]["monthly_income_eur"] == "1750.00"
    assert body["applicant"]["employment_status"] == "employed"


def test_patch_records_step_completed_event(api_client):
    data = _create_application(api_client)
    api_client.patch(
        reverse("p2-application-detail", args=[data["id"]]),
        {"current_step": "income", "monthly_income_eur": "2000"},
        format="json",
    )
    app = Application.objects.get(public_id=data["id"])
    assert app.events.filter(event_type=ApplicationEventType.STEP_COMPLETED).exists()


def test_get_unknown_application_404(api_client):
    resp = api_client.get(reverse("p2-application-detail", args=["VY-NOPE00"]))
    assert resp.status_code == 404


# --------------------------------------------------------------------------
# Consent
# --------------------------------------------------------------------------
def test_matching_requires_consent(api_client, partner_b):
    data = _create_application(api_client)
    _fill_profile(api_client, data["id"])
    resp = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "CONSENT_REQUIRED"


def test_consent_records_and_event(api_client):
    data = _create_application(api_client)
    _grant_consent(api_client, data["id"], marketing=False)
    app = Application.objects.get(public_id=data["id"])
    accepted = set(app.consents.filter(accepted=True).values_list("consent_type", flat=True))
    assert "PLATFORM_PROCESSING" in accepted
    assert "PARTNER_DATA_TRANSFER" in accepted
    assert "MARKETING" not in accepted  # optional, declined
    assert app.events.filter(event_type=ApplicationEventType.CONSENT_GRANTED).exists()


def test_consent_records_wording_version_not_policy_version(api_client, settings):
    """The consent WORDING version is stored, distinct from the policy versions.

    Regression guard: consent_text_version used to be filled with
    PRIVACY_POLICY_VERSION, so changing the consent checkbox copy left no trace
    and we could not prove what text a user had actually agreed to.
    """
    settings.CONSENT_TEXT_VERSION = "wording-2026-09-01"
    settings.PRIVACY_POLICY_VERSION = "policy-2026-01-01"
    settings.TERMS_VERSION = "terms-2026-01-01"

    data = _create_application(api_client)
    _grant_consent(api_client, data["id"], marketing=True)

    app = Application.objects.get(public_id=data["id"])
    consents = list(app.consents.all())
    assert len(consents) == 3  # platform, partner transfer, marketing

    for consent in consents:
        assert consent.consent_text_version == "wording-2026-09-01"
        # The three versions are tracked independently of one another.
        assert consent.privacy_policy_version == "policy-2026-01-01"
        assert consent.terms_version == "terms-2026-01-01"


# --------------------------------------------------------------------------
# Matching
# --------------------------------------------------------------------------
def test_matches_when_eligible(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    resp = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    body = resp.json()
    assert resp.status_code == 200
    assert len(body["matches"]) == 1
    assert body["matches"][0]["match"] is True
    assert body["matches"][0]["partner"] == "Demo Partner B"


def test_ranking_by_score_multiple_partners(api_client, partner_a, partner_b):
    # amount 2000, term 12, income 2000, employed → both A and B eligible.
    # Multi-partner model: ALL eligible partners are returned, sorted by score
    # descending (priority only breaks ties).
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000", employment_status="employed")
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    matches = body["matches"]
    assert len(matches) == 2
    # Scores are non-increasing across the list.
    scores = [m["match_score"] for m in matches]
    assert scores == sorted(scores, reverse=True)
    assert matches[0]["ranking"] == 1
    assert matches[0]["eligible"] is True


def test_amount_below_minimum_excluded(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="100", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert body["matches"] == []


def test_amount_above_maximum_excluded(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="99999", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert body["matches"] == []


def test_term_out_of_range_excluded(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=60)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert body["matches"] == []


def test_income_below_minimum_excluded(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="500")  # below 1000
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert body["matches"] == []


def test_unsupported_employment_excluded(api_client, partner_a):
    # Partner A accepts only employed/self_employed. business_owner is excluded.
    data = _create_application(api_client, desired_amount_eur="1500", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000", employment_status="business_owner")
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert body["matches"] == []


def test_inactive_partner_excluded(api_client, partner_b):
    partner_b.lender.active = False
    partner_b.lender.save()
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert body["matches"] == []


def test_inactive_product_excluded(api_client, partner_b):
    partner_b.active = False
    partner_b.save()
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    body = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert body["matches"] == []


def test_matching_is_deterministic(api_client, partner_a, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    first = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    second = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    assert [m["product_id"] for m in first["matches"]] == [m["product_id"] for m in second["matches"]]
    # Re-matching does not duplicate persisted results.
    app = Application.objects.get(public_id=data["id"])
    assert Match.objects.filter(application=app).count() == 2


def test_match_result_persisted(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    app = Application.objects.get(public_id=data["id"])
    match = Match.objects.get(application=app, product=partner_b)
    assert match.eligible is True
    assert match.rank == 1


def test_get_matches_after_run(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    resp = api_client.get(reverse("p2-application-matches", args=[data["id"]]))
    assert resp.status_code == 200
    assert len(resp.json()["matches"]) == 1


# --------------------------------------------------------------------------
# Partner selection / referral / events
# --------------------------------------------------------------------------
def test_select_partner_creates_referral_and_events(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"])
    _grant_consent(api_client, data["id"])
    matches = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json").json()
    product_id = matches["matches"][0]["product_id"]

    resp = api_client.post(
        reverse("p2-application-select-partner", args=[data["id"]]),
        {"product_id": product_id},
        format="json",
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["referral_status"] == ReferralStatus.REFERRED
    assert body["outbound_url"]

    app = Application.objects.get(public_id=data["id"])
    assert Lead.objects.filter(application=app).count() == 1
    event_types = set(app.events.values_list("event_type", flat=True))
    assert ApplicationEventType.PARTNER_SELECTED in event_types
    assert ApplicationEventType.REFERRAL_CREATED in event_types
    assert app.status == ApplicationStatus.REFERRED


def test_select_partner_rejects_non_matched_product(api_client, partner_a, partner_b):
    # A is not eligible (income too low for its rules? actually eligible). Use an
    # amount that only B matches, then try to select A.
    data = _create_application(api_client, desired_amount_eur="4000", desired_term_months=12)
    _fill_profile(api_client, data["id"], monthly_income_eur="2000")
    _grant_consent(api_client, data["id"])
    api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    # partner_a max_amount 3000, so 4000 excludes A.
    resp = api_client.post(
        reverse("p2-application-select-partner", args=[data["id"]]),
        {"product_id": str(partner_a.id)},
        format="json",
    )
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "INVALID_PARTNER_SELECTION"


def test_full_event_trail_reconstructable(api_client, partner_b):
    data = _create_application(api_client, desired_amount_eur="2000", desired_term_months=12)
    _fill_profile(api_client, data["id"])
    _grant_consent(api_client, data["id"])
    api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    matches = api_client.get(reverse("p2-application-matches", args=[data["id"]])).json()
    api_client.post(
        reverse("p2-application-select-partner", args=[data["id"]]),
        {"product_id": matches["matches"][0]["product_id"]},
        format="json",
    )
    app = Application.objects.get(public_id=data["id"])
    types = list(app.events.values_list("event_type", flat=True))
    for expected in [
        ApplicationEventType.APPLICATION_STARTED,
        ApplicationEventType.CONSENT_GRANTED,
        ApplicationEventType.MATCHING_STARTED,
        ApplicationEventType.MATCHING_COMPLETED,
        ApplicationEventType.PARTNER_VIEWED,
        ApplicationEventType.PARTNER_SELECTED,
        ApplicationEventType.REFERRAL_CREATED,
    ]:
        assert expected in types


def test_applicant_reused_across_patches(api_client):
    data = _create_application(api_client)
    _fill_profile(api_client, data["id"], first_name="Ivan")
    _fill_profile(api_client, data["id"], first_name="Petar")
    app = Application.objects.get(public_id=data["id"])
    # Same Applicant row updated, not duplicated.
    assert Applicant.objects.count() == 1
    assert app.applicant.first_name == "Petar"
