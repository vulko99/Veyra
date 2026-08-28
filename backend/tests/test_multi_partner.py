"""Multi-partner distribution: threshold, ordering, referrals, delivery, consent.

Covers the marketplace model: one application matches ALL partners above a
configurable threshold, sorted by score; the user may create multiple referrals;
the backend never trusts a client-supplied score; consent gates the flow.
"""
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.applications.models import Applicant, Application, ApplicationStatus
from apps.consents.models import ConsentType
from apps.consents.services import record_consent
from apps.leads.models import Lead
from apps.lenders.models import (
    DeliveryMethod,
    Lender,
    LenderProduct,
    ProductType,
)
from apps.matching.models import Match
from apps.matching.phase2 import build_context_v2, match_application_v2
from apps.matching.scoring import score_match

pytestmark = pytest.mark.django_db


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def make_partner(slug, *, priority=50, **lender_kwargs):
    return Lender.objects.create(
        name=slug, slug=slug, display_name=slug, priority=priority, **lender_kwargs
    )


def make_product(lender, slug, **kwargs):
    defaults = dict(
        name=f"{slug}-product",
        slug=slug,
        product_type=ProductType.CONSUMER_LOAN,
        min_amount=Decimal("500"),
        max_amount=Decimal("5000"),
        currency="EUR",
        min_term_months=3,
        max_term_months=36,
        min_income=Decimal("800"),
        application_url="https://example.com/apply",
    )
    defaults.update(kwargs)
    return LenderProduct.objects.create(lender=lender, **defaults)


def ready_application(consented=True, **overrides):
    applicant = Applicant.objects.create(
        monthly_income_eur=Decimal("2000"), employment_status="employed"
    )
    fields = dict(
        requested_amount=Decimal("2000"),
        requested_term_months=12,
        applicant=applicant,
        status=ApplicationStatus.COMPLETED,
    )
    fields.update(overrides)
    app = Application.objects.create(**fields)
    if consented:
        for ct in (ConsentType.PLATFORM_PROCESSING, ConsentType.PARTNER_DATA_TRANSFER):
            record_consent(
                application=app, consent_type=ct, accepted=True, consent_text_version="1"
            )
    return app


def score_for(app, product):
    return score_match(build_context_v2(app), product)


# --------------------------------------------------------------------------
# 1-3, 14: eligibility counts and ordering
# --------------------------------------------------------------------------
def test_no_eligible_partners(settings):
    settings.MATCH_THRESHOLD = 80
    p = make_product(make_partner("a"), "pa", min_amount=Decimal("9000"), max_amount=Decimal("9500"))
    app = ready_application()
    results = match_application_v2(app)
    assert results == []
    assert Match.objects.get(application=app, product=p).referral_eligible is False


def test_one_eligible_partner(settings):
    settings.MATCH_THRESHOLD = 80
    make_product(make_partner("a"), "pa")
    app = ready_application()
    results = match_application_v2(app)
    assert len(results) == 1


def test_multiple_eligible_partners_sorted_by_score(settings):
    settings.MATCH_THRESHOLD = 70
    make_product(make_partner("a", priority=10), "pa", min_amount=Decimal("500"), max_amount=Decimal("3000"))
    make_product(make_partner("b", priority=10), "pb", min_amount=Decimal("500"), max_amount=Decimal("5000"))
    make_product(make_partner("c", priority=10), "pc", min_amount=Decimal("1000"), max_amount=Decimal("10000"))
    app = ready_application()
    results = match_application_v2(app)
    assert len(results) >= 2
    scores = [r["match_score"] for r in results]
    assert scores == sorted(scores, reverse=True)  # descending


# --------------------------------------------------------------------------
# 4-6: threshold boundaries and per-partner override
# --------------------------------------------------------------------------
def test_partner_exactly_at_threshold_is_eligible(settings):
    partner = make_partner("a")
    product = make_product(partner, "pa")
    app = ready_application()
    exact = score_for(app, product)
    settings.MATCH_THRESHOLD = exact  # score == threshold → eligible (>=)
    results = match_application_v2(app)
    assert any(r["product_id"] == str(product.id) for r in results)


def test_partner_just_below_threshold_excluded(settings):
    partner = make_partner("a")
    product = make_product(partner, "pa")
    app = ready_application()
    settings.MATCH_THRESHOLD = score_for(app, product) + 1  # one above the score
    results = match_application_v2(app)
    assert results == []
    m = Match.objects.get(application=app, product=product)
    assert m.eligible is True          # passed hard criteria
    assert m.referral_eligible is False  # but below threshold


def test_partner_specific_threshold_overrides_global(settings):
    settings.MATCH_THRESHOLD = 70
    app = ready_application()
    low = make_product(make_partner("low"), "low")
    strict_partner = make_partner("strict", minimum_match_score=100)  # unreachable
    strict = make_product(strict_partner, "strict")
    results = match_application_v2(app)
    ids = {r["product_id"] for r in results}
    assert str(low.id) in ids
    assert str(strict.id) not in ids
    assert Match.objects.get(application=app, product=strict).threshold_used == 100


# --------------------------------------------------------------------------
# 7-8: partner policy
# --------------------------------------------------------------------------
def test_inactive_partner_not_referral_eligible(settings):
    settings.MATCH_THRESHOLD = 70
    partner = make_partner("a")
    partner.active = False
    partner.save()
    make_product(partner, "pa")
    app = ready_application()
    assert match_application_v2(app) == []


def test_partner_not_accepting_shared_leads_still_matches(settings):
    # accepts_shared_leads governs distribution, NEVER matching visibility.
    settings.MATCH_THRESHOLD = 70
    partner = make_partner("a", accepts_shared_leads=False)
    product = make_product(partner, "pa")
    app = ready_application()
    results = match_application_v2(app)
    assert any(r["product_id"] == str(product.id) for r in results)


# --------------------------------------------------------------------------
# 9-10: referrals
# --------------------------------------------------------------------------
def test_duplicate_referral_prevented(settings):
    settings.MATCH_THRESHOLD = 70
    from apps.leads.referrals import create_referral

    product = make_product(make_partner("a"), "pa")
    app = ready_application()
    match_application_v2(app)
    create_referral(app, product)
    create_referral(app, product)  # idempotent
    assert Lead.objects.filter(application=app, product=product).count() == 1


def test_multiple_referrals_for_one_application(settings):
    settings.MATCH_THRESHOLD = 70
    from apps.leads.referrals import create_referral

    pa = make_product(make_partner("a"), "pa")
    pb = make_product(make_partner("b"), "pb")
    app = ready_application()
    match_application_v2(app)
    create_referral(app, pa)
    create_referral(app, pb)
    assert Lead.objects.filter(application=app).count() == 2


def test_partner_referral_cap_enforced(settings):
    settings.MATCH_THRESHOLD = 70
    from apps.core.exceptions import VeyraAPIError
    from apps.leads.referrals import create_referral

    partner = make_partner("a", max_referrals_per_application=1)
    pa = make_product(partner, "pa")
    pb = make_product(partner, "pb")  # same partner, second product
    app = ready_application()
    match_application_v2(app)
    create_referral(app, pa)
    with pytest.raises(VeyraAPIError):
        create_referral(app, pb)


# --------------------------------------------------------------------------
# 11-12: consent + trust boundary (API level)
# --------------------------------------------------------------------------
def _api_create(api_client, **overrides):
    payload = {"desired_amount_eur": "2000", "desired_term_months": 12, "current_step": "amount"}
    payload.update(overrides)
    return api_client.post(reverse("p2-application-create"), payload, format="json").json()


def test_consent_required_before_matching(api_client, settings):
    settings.MATCH_THRESHOLD = 70
    make_product(make_partner("a"), "pa")
    data = _api_create(api_client)
    api_client.patch(
        reverse("p2-application-detail", args=[data["id"]]),
        {"monthly_income_eur": "2000", "employment_status": "employed"},
        format="json",
    )
    resp = api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "CONSENT_REQUIRED"


def test_backend_does_not_trust_frontend_score(api_client, settings):
    # A hard-eligible product held below the threshold must be un-referrable even
    # if the client posts its product_id directly.
    settings.MATCH_THRESHOLD = 70
    strict = make_product(make_partner("strict", minimum_match_score=100), "strict")
    data = _api_create(api_client)
    api_client.patch(
        reverse("p2-application-detail", args=[data["id"]]),
        {"monthly_income_eur": "2000", "employment_status": "employed"},
        format="json",
    )
    api_client.post(
        reverse("p2-application-consent", args=[data["id"]]),
        {
            "privacy_processing_consent": True,
            "partner_data_sharing_consent": True,
            "marketing_consent": False,
        },
        format="json",
    )
    api_client.post(reverse("p2-application-match", args=[data["id"]]), {}, format="json")
    resp = api_client.post(
        reverse("p2-application-select-partner", args=[data["id"]]),
        {"product_id": str(strict.id)},
        format="json",
    )
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "INVALID_PARTNER_SELECTION"


# --------------------------------------------------------------------------
# 13: reasons + audit stored
# --------------------------------------------------------------------------
def test_match_reasons_and_threshold_stored(settings):
    settings.MATCH_THRESHOLD = 70
    product = make_product(make_partner("a"), "pa")
    app = ready_application()
    match_application_v2(app)
    m = Match.objects.get(application=app, product=product)
    assert m.reasons  # reason objects captured
    assert m.evaluation.get("amount") == "PASS"
    assert m.threshold_used == 70
    assert m.reason_summary


# --------------------------------------------------------------------------
# Delivery layer
# --------------------------------------------------------------------------
def test_email_delivery_sends_minimal_payload(settings):
    from django.core import mail

    settings.MATCH_THRESHOLD = 70
    from apps.leads.referrals import create_referral

    partner = make_partner(
        "a", delivery_method=DeliveryMethod.EMAIL, delivery_email="leads@partner.example"
    )
    product = make_product(partner, "pa")
    app = ready_application()
    app.full_name = "Ivan Ivanov"
    app.email = "ivan@example.com"
    app.save()
    match_application_v2(app)
    create_referral(app, product)
    assert len(mail.outbox) == 1
    msg = mail.outbox[0]
    assert msg.to == ["leads@partner.example"]
    assert app.public_id in msg.body
    # No internal DB pk leaks into the delivered payload.
    assert str(app.id) not in msg.body


def test_manual_delivery_is_noop_but_referral_exists(settings):
    from django.core import mail

    settings.MATCH_THRESHOLD = 70
    from apps.leads.referrals import create_referral

    partner = make_partner("a", delivery_method=DeliveryMethod.MANUAL)
    product = make_product(partner, "pa")
    app = ready_application()
    match_application_v2(app)
    lead = create_referral(app, product)
    assert lead is not None
    assert mail.outbox == []  # nothing auto-sent for MANUAL
