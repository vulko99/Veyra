"""EGN collection, encryption, submission and privacy (Parts 2-21, 25).

Covers: EGN not required for matching; EGN only after selection; validation;
encryption at rest; no plaintext returned; per-partner submission isolation;
one EGN for multiple partners; demo isolation; consent snapshot & versioning.
"""
from __future__ import annotations

from decimal import Decimal

import pytest
from django.urls import reverse

from apps.applications.models import ApplicantIdentity, Application
from apps.consents.models import ConsentRecord, ConsentType
from apps.core.crypto import decrypt_egn, encrypt_egn
from apps.leads.models import PartnerSubmission
from apps.lenders.models import (
    EligibilityRule,
    Lender,
    LenderProduct,
    PartnerPrivacyProfile,
    ProductType,
    RecipientRole,
    RuleField,
    RuleOperator,
)

pytestmark = pytest.mark.django_db

VALID_EGN = "7523169263"  # fictional test value, 10 digits


def _make_partner(slug, name, *, egn_required=False, is_demo=True, order=1):
    lender = Lender.objects.create(
        name=name, slug=slug, active=True, display_order=order,
        egn_required=egn_required, is_demo=is_demo,
    )
    product = LenderProduct.objects.create(
        lender=lender, name=f"{name} Loan", slug=f"{slug}-loan",
        product_type=ProductType.CONSUMER_LOAN,
        min_amount=Decimal("500"), max_amount=Decimal("10000"), currency="EUR",
        min_term_months=3, max_term_months=36, min_income=Decimal("800"),
        priority=90, application_url="https://example.com/apply",
    )
    EligibilityRule.objects.create(
        product=product, field=RuleField.EMPLOYMENT_TYPE,
        operator=RuleOperator.IN, value=["employed", "self_employed"],
        show_reason_to_customer=False,
    )
    return lender, product


@pytest.fixture
def partner_egn(db):
    return _make_partner("iute", "Iute", egn_required=True, is_demo=True, order=1)


@pytest.fixture
def partner_no_egn(db):
    return _make_partner("moneyplus", "MoneyPlus", egn_required=False, is_demo=True, order=2)


def _run_to_matches(client):
    resp = client.post(
        reverse("p2-application-create"),
        {"desired_amount_eur": "2000", "desired_term_months": 12, "current_step": "amount"},
        format="json",
    )
    pid = resp.json()["id"]
    client.patch(
        reverse("p2-application-detail", args=[pid]),
        {"first_name": "Test", "last_name": "User", "email": "t@example.com",
         "phone": "+359881234567", "monthly_income_eur": "2000",
         "employment_status": "employed"},
        format="json",
    )
    client.post(
        reverse("p2-application-consent", args=[pid]),
        {"privacy_processing_consent": True, "partner_data_sharing_consent": True,
         "marketing_consent": False},
        format="json",
    )
    body = client.post(reverse("p2-application-match", args=[pid]), {}, format="json").json()
    return pid, body["matches"]


def _select(client, pid, product_id):
    return client.post(
        reverse("p2-application-select-partner", args=[pid]),
        {"product_id": product_id}, format="json",
    )


# --- Crypto ---------------------------------------------------------------
def test_egn_encrypts_and_roundtrips():
    token = encrypt_egn(VALID_EGN)
    assert token and token != VALID_EGN
    assert VALID_EGN not in token
    assert decrypt_egn(token) == VALID_EGN


# --- Matching does not need EGN -------------------------------------------
def test_egn_not_required_for_matching(api_client, partner_egn):
    pid, matches = _run_to_matches(api_client)
    assert len(matches) >= 1  # matched with no EGN collected
    app = Application.objects.get(public_id=pid)
    assert not hasattr(app, "identity") or not app.identity.has_egn


# --- EGN only after selection ---------------------------------------------
def test_egn_rejected_before_partner_selection(api_client, partner_egn):
    pid, _ = _run_to_matches(api_client)
    resp = api_client.post(
        reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json"
    )
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "PARTNER_SELECTION_REQUIRED"


# --- Validation -----------------------------------------------------------
@pytest.mark.parametrize("bad", ["123", "12345678901", "abcdefghij", "12 34 56 78", "", "12345678a"])
def test_invalid_egn_rejected(api_client, partner_egn, bad):
    _, product = partner_egn
    pid, matches = _run_to_matches(api_client)
    _select(api_client, pid, str(product.id))
    resp = api_client.post(
        reverse("p2-application-identity", args=[pid]), {"egn": bad}, format="json"
    )
    assert resp.status_code == 400


def test_valid_egn_accepted_and_masked(api_client, partner_egn):
    _, product = partner_egn
    pid, _ = _run_to_matches(api_client)
    _select(api_client, pid, str(product.id))
    resp = api_client.post(
        reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json"
    )
    assert resp.status_code == 200, resp.content
    body = resp.json()
    # Only masked value returned; never the plaintext.
    assert body["egn_masked"] == "******" + VALID_EGN[-4:]
    assert VALID_EGN not in resp.content.decode()


# --- Encryption at rest, no plaintext -------------------------------------
def test_egn_encrypted_at_rest(api_client, partner_egn):
    _, product = partner_egn
    pid, _ = _run_to_matches(api_client)
    _select(api_client, pid, str(product.id))
    api_client.post(reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json")
    identity = ApplicantIdentity.objects.get(application__public_id=pid)
    assert identity.egn_encrypted and identity.egn_encrypted != VALID_EGN
    assert VALID_EGN not in identity.egn_encrypted
    assert identity.egn_last4 == VALID_EGN[-4:]
    assert decrypt_egn(identity.egn_encrypted) == VALID_EGN


def test_application_detail_never_returns_egn(api_client, partner_egn):
    _, product = partner_egn
    pid, _ = _run_to_matches(api_client)
    _select(api_client, pid, str(product.id))
    api_client.post(reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json")
    resp = api_client.get(reverse("p2-application-detail", args=[pid]))
    assert VALID_EGN not in resp.content.decode()


# --- Submission isolation + one EGN, many partners ------------------------
def test_egn_only_reaches_selected_partner(api_client, partner_egn, partner_no_egn):
    _, egn_product = partner_egn
    _, other_product = partner_no_egn
    pid, matches = _run_to_matches(api_client)
    # Select ONLY the EGN partner; the other is matched but NOT selected.
    _select(api_client, pid, str(egn_product.id))
    api_client.post(reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json")
    resp = api_client.post(reverse("p2-application-submit", args=[pid]), {}, format="json")
    assert resp.status_code == 200, resp.content
    subs = PartnerSubmission.objects.filter(application__public_id=pid)
    # Only the selected partner got a submission.
    assert subs.count() == 1
    sub = subs.first()
    assert sub.lender.slug == "iute"
    assert sub.egn_included is True
    # The unselected partner has no submission at all.
    assert not PartnerSubmission.objects.filter(lender__slug="moneyplus").exists()


def test_one_egn_used_for_multiple_selected_partners(api_client, partner_no_egn):
    # Two EGN-requiring partners, one EGN entered once, both submitted.
    _, p1 = _make_partner("iute", "Iute", egn_required=True, is_demo=True, order=1)
    _, p2 = _make_partner("cashcredit", "CashCredit", egn_required=True, is_demo=True, order=3)
    pid, _ = _run_to_matches(api_client)
    _select(api_client, pid, str(p1.id))
    _select(api_client, pid, str(p2.id))
    api_client.post(reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json")
    # Exactly one identity record holds the EGN.
    assert ApplicantIdentity.objects.filter(application__public_id=pid).count() == 1
    resp = api_client.post(reverse("p2-application-submit", args=[pid]), {}, format="json")
    assert resp.status_code == 200
    subs = PartnerSubmission.objects.filter(application__public_id=pid)
    assert subs.count() == 2
    assert all(s.egn_included for s in subs)


# --- Demo isolation -------------------------------------------------------
def test_demo_mode_simulates_and_never_calls_real_partner(api_client, partner_egn):
    _, product = partner_egn  # is_demo=True
    pid, _ = _run_to_matches(api_client)
    _select(api_client, pid, str(product.id))
    api_client.post(reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json")
    resp = api_client.post(reverse("p2-application-submit", args=[pid]), {}, format="json")
    status = resp.json()["submissions"][0]["status"]
    assert status == "DEMO_SIMULATED"


# --- Consent snapshot & privacy ------------------------------------------
def test_submit_records_consent_snapshot_with_partners_and_version(api_client, partner_egn):
    _, product = partner_egn
    pid, _ = _run_to_matches(api_client)
    _select(api_client, pid, str(product.id))
    api_client.post(reverse("p2-application-identity", args=[pid]), {"egn": VALID_EGN}, format="json")
    api_client.post(reverse("p2-application-submit", args=[pid]), {}, format="json")
    rec = ConsentRecord.objects.filter(
        application__public_id=pid, consent_type=ConsentType.PARTNER_DATA_TRANSFER
    ).first()
    assert rec is not None
    assert rec.selected_partner_ids == [str(product.lender_id)]
    assert rec.privacy_notice_version  # exact notice version recorded
    # The consent record never contains an EGN.
    assert VALID_EGN not in str(rec.selected_partner_ids)


def test_selection_endpoint_reports_egn_requirement(api_client, partner_egn):
    _, product = partner_egn
    pid, _ = _run_to_matches(api_client)
    _select(api_client, pid, str(product.id))
    body = api_client.get(reverse("p2-application-selection", args=[pid])).json()
    assert body["egn_required"] is True
    assert body["egn_provided"] is False
    assert len(body["selected_partners"]) == 1
    assert body["privacy_notice_version"]


def test_partner_privacy_profile_is_configurable(db):
    lender, _ = _make_partner("vivacredit", "VivaCredit", is_demo=False)
    profile = PartnerPrivacyProfile.objects.create(
        partner=lender, recipient_role=RecipientRole.CONTROLLER,
        processing_purposes=["credit assessment"], data_categories_shared=["contact"],
        egn_shared=True, active=False,
    )
    # Incomplete/inactive profile is not publishable (no invented legal data).
    assert profile.is_publishable is False
    profile.legal_name = "Viva Credit EOOD"
    profile.company_registration_number = "000000000"
    profile.registered_address = "Sofia"
    profile.privacy_url = "https://example.com/privacy"
    profile.active = True
    profile.save()
    assert profile.is_publishable is True
