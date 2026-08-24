"""Matching engine tests: eligibility, ranking, edge cases."""
from decimal import Decimal

import pytest

from apps.applications.models import Application, ApplicationStatus
from apps.lenders.models import RuleField, RuleOperator
from apps.matching.engine import build_context, evaluate_product, match_application
from apps.matching.rules import evaluate_rule

pytestmark = pytest.mark.django_db


def _application(**kwargs):
    defaults = dict(
        requested_amount=Decimal("1000"),
        requested_term_months=12,
        monthly_income=Decimal("2500"),
        employment_type="FULL_TIME",
        employment_months=24,
        status=ApplicationStatus.SUBMITTED,
    )
    defaults.update(kwargs)
    return Application.objects.create(**defaults)


def test_amount_eligibility_within_range(product):
    app = _application(requested_amount=Decimal("1000"))
    eligible, _ = evaluate_product(build_context(app), product)
    assert eligible is True


def test_amount_eligibility_out_of_range(product):
    app = _application(requested_amount=Decimal("100"))  # below min 500
    eligible, reasons = evaluate_product(build_context(app), product)
    assert eligible is False
    assert any("amount" in r["text"].lower() for r in reasons)


def test_term_eligibility_out_of_range(product):
    app = _application(requested_term_months=48)  # above max 36
    eligible, reasons = evaluate_product(build_context(app), product)
    assert eligible is False
    assert any("term" in r["text"].lower() for r in reasons)


def test_income_eligibility_below_minimum(product):
    app = _application(monthly_income=Decimal("500"))  # below min 1000
    eligible, _ = evaluate_product(build_context(app), product)
    assert eligible is False


def test_multiple_lenders_and_ranking(product_factory, lender):
    from apps.lenders.models import Lender

    l2 = Lender.objects.create(name="L2", slug="l2", priority=5)
    # Product perfectly centred on the request (higher amount fit).
    p_good = product_factory(lender, slug="good", name="Good", min_amount=Decimal("500"),
                             max_amount=Decimal("1500"))
    # Wider product -> request sits off-centre -> lower amount fit.
    p_wide = product_factory(l2, slug="wide", name="Wide", min_amount=Decimal("100"),
                             max_amount=Decimal("10000"))
    app = _application(requested_amount=Decimal("1000"), requested_term_months=12)
    result = match_application(app)
    assert len(result["matches"]) == 2
    assert result["matches"][0]["rank"] == 1
    # The centred product should rank first.
    assert result["matches"][0]["product_id"] == str(p_good.id)


def test_no_eligible_lenders(product):
    app = _application(requested_amount=Decimal("99999"))
    result = match_application(app)
    assert result["matches"] == []


def test_top_n_limit(product_factory, lender, settings):
    settings.MATCHING_TOP_N = 2
    for i in range(4):
        product_factory(lender, slug=f"p{i}", name=f"P{i}")
    app = _application()
    result = match_application(app)
    assert len(result["matches"]) == 2


def test_generic_rule_excludes(product, make_rule):
    make_rule(product, RuleField.EMPLOYMENT_TYPE, RuleOperator.NOT_EQUALS, "UNEMPLOYED",
              show_reason_to_customer=False)
    app = _application(employment_type="UNEMPLOYED")
    eligible, _ = evaluate_product(build_context(app), product)
    assert eligible is False


def test_confidential_rule_reason_hidden_from_customer(product, make_rule):
    make_rule(product, RuleField.MONTHLY_INCOME, RuleOperator.GREATER_THAN_OR_EQUAL,
              1000, show_reason_to_customer=False, reason_template="secret underwriting")
    app = _application()
    result = match_application(app)
    match = app.matches.get(product=product)
    # The confidential reason must not be in customer-facing reasons.
    assert "secret underwriting" not in match.customer_reasons


def test_customer_reason_payload_carries_codes(product):
    app = _application()
    match_application(app)
    match = app.matches.get(product=product)
    payload = match.customer_reason_payload
    codes = {r["code"] for r in payload}
    assert "amount_in_range" in codes
    assert "term_in_range" in codes
    # income_meets_min appears because the product has a min_income.
    assert "income_meets_min" in codes
    # Every payload entry is a localizable object.
    for r in payload:
        assert set(r.keys()) == {"code", "params", "text"}


def test_out_of_range_reason_has_params(product):
    app = _application(requested_amount=Decimal("100"))  # below min 500
    match_application(app)
    match = app.matches.get(product=product)
    amount_reasons = [
        r for r in match.reasons if r.get("code") == "amount_out_of_range"
    ]
    assert amount_reasons
    assert amount_reasons[0]["params"]["min"] == "500.00"


def test_rematch_replaces_prior_matches(product):
    app = _application()
    match_application(app)
    first_count = app.matches.count()
    match_application(app)
    assert app.matches.count() == first_count  # not duplicated


@pytest.mark.parametrize(
    "operator,actual,expected,result",
    [
        (RuleOperator.EQUALS, "FULL_TIME", "full_time", True),
        (RuleOperator.NOT_EQUALS, "PART_TIME", "FULL_TIME", True),
        (RuleOperator.GREATER_THAN, 10, 5, True),
        (RuleOperator.LESS_THAN_OR_EQUAL, 5, 5, True),
        (RuleOperator.IN, "A", ["A", "B"], True),
        (RuleOperator.NOT_IN, "C", ["A", "B"], True),
        (RuleOperator.BETWEEN, 5, [1, 10], True),
        (RuleOperator.BETWEEN, 50, [1, 10], False),
    ],
)
def test_evaluate_rule_operators(operator, actual, expected, result):
    assert evaluate_rule(operator, actual, expected) is result
