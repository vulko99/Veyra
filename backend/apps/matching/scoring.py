"""Configurable compatibility scoring.

The score is an internal compatibility score in the range 0-100. It is NOT a
credit score and NOT a probability of approval. Weights are configurable via
SCORING_WEIGHTS (overridable in settings).
"""
from __future__ import annotations

from decimal import Decimal

from django.conf import settings

# Default weights sum to 100.
DEFAULT_WEIGHTS = {
    "amount": 25,
    "term": 20,
    "income": 20,
    "employment": 20,
    "product_suitability": 15,
}


def get_weights() -> dict[str, int]:
    return getattr(settings, "SCORING_WEIGHTS", DEFAULT_WEIGHTS)


def _range_fit(value, low, high) -> float:
    """Return 0..1 for how centrally ``value`` sits within [low, high].

    Full marks at the midpoint, tapering toward the edges but never below 0.5
    while inside the range (being in range is what matters most). 0 if outside.
    """
    if value is None or low is None or high is None:
        return 0.0
    value, low, high = Decimal(str(value)), Decimal(str(low)), Decimal(str(high))
    if value < low or value > high:
        return 0.0
    if high == low:
        return 1.0
    midpoint = (low + high) / 2
    half_span = (high - low) / 2
    distance = abs(value - midpoint)
    # 1.0 at midpoint -> 0.5 at the edge.
    return float(1 - (distance / half_span) * Decimal("0.5"))


def score_match(context: dict, product) -> int:
    """Compute a 0-100 compatibility score for an (application, product) pair.

    Assumes the product is already known to be eligible.
    """
    weights = get_weights()

    amount_fit = _range_fit(
        context.get("requested_amount"), product.min_amount, product.max_amount
    )
    term_fit = _range_fit(
        context.get("requested_term_months"),
        product.min_term_months,
        product.max_term_months,
    )

    # Income: full marks if comfortably above the product minimum.
    income = context.get("monthly_income")
    if product.min_income and income is not None:
        ratio = float(Decimal(str(income)) / Decimal(str(product.min_income)))
        income_fit = max(0.0, min(1.0, ratio / 2))  # 2x the min income -> full marks
    else:
        income_fit = 1.0 if income else 0.5

    # Employment: stable employment scores higher.
    employment = (context.get("employment_type") or "").upper()
    employment_fit = {
        "FULL_TIME": 1.0,
        "SELF_EMPLOYED": 0.85,
        "CONTRACT": 0.8,
        "PART_TIME": 0.7,
        "RETIRED": 0.7,
        "STUDENT": 0.5,
        "UNEMPLOYED": 0.2,
    }.get(employment, 0.6)

    # Product suitability: does requested purpose align with product type?
    product_fit = _purpose_fit(context.get("loan_purpose"), product.product_type)

    total = (
        amount_fit * weights["amount"]
        + term_fit * weights["term"]
        + income_fit * weights["income"]
        + employment_fit * weights["employment"]
        + product_fit * weights["product_suitability"]
    )
    return int(round(total))


def _purpose_fit(purpose, product_type) -> float:
    if not purpose:
        return 0.8
    purpose = purpose.upper()
    aligned = {
        "DEBT_CONSOLIDATION": {"DEBT_CONSOLIDATION", "REFINANCING", "CONSUMER_LOAN"},
        "EMERGENCY": {"SHORT_TERM_LOAN", "CONSUMER_LOAN"},
        "MAJOR_PURCHASE": {"CONSUMER_LOAN", "CREDIT_CARD"},
    }.get(purpose)
    if aligned is None:
        return 0.85
    return 1.0 if product_type in aligned else 0.7
