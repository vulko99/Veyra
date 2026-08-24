"""Generic eligibility-rule evaluation.

The engine never contains lender-specific branches. It reads EligibilityRule
rows and evaluates them against a normalised applicant context dict.
"""
from __future__ import annotations

from decimal import Decimal, InvalidOperation

from apps.lenders.models import RuleOperator


def to_number(value):
    """Coerce a value to Decimal for numeric comparison, or None if not numeric."""
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, Decimal):
        return value
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def evaluate_rule(operator: str, actual, expected) -> bool:
    """Evaluate a single condition. Numeric comparisons coerce to Decimal;
    equality/membership fall back to case-insensitive string comparison."""
    a_num = to_number(actual)

    if operator == RuleOperator.EQUALS:
        return _eq(actual, expected)
    if operator == RuleOperator.NOT_EQUALS:
        return not _eq(actual, expected)

    if operator in (
        RuleOperator.GREATER_THAN,
        RuleOperator.GREATER_THAN_OR_EQUAL,
        RuleOperator.LESS_THAN,
        RuleOperator.LESS_THAN_OR_EQUAL,
    ):
        e_num = to_number(expected)
        if a_num is None or e_num is None:
            return False
        if operator == RuleOperator.GREATER_THAN:
            return a_num > e_num
        if operator == RuleOperator.GREATER_THAN_OR_EQUAL:
            return a_num >= e_num
        if operator == RuleOperator.LESS_THAN:
            return a_num < e_num
        return a_num <= e_num  # LESS_THAN_OR_EQUAL

    if operator in (RuleOperator.IN, RuleOperator.NOT_IN):
        options = expected if isinstance(expected, (list, tuple)) else [expected]
        hit = any(_eq(actual, opt) for opt in options)
        return hit if operator == RuleOperator.IN else not hit

    if operator == RuleOperator.BETWEEN:
        if not (isinstance(expected, (list, tuple)) and len(expected) == 2):
            return False
        low, high = to_number(expected[0]), to_number(expected[1])
        if a_num is None or low is None or high is None:
            return False
        return low <= a_num <= high

    return False


def _eq(actual, expected) -> bool:
    a_num = to_number(actual)
    e_num = to_number(expected)
    if a_num is not None and e_num is not None:
        return a_num == e_num
    return str(actual).strip().lower() == str(expected).strip().lower()
