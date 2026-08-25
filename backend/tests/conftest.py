"""Shared pytest fixtures."""
from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.applications.models import Application, ApplicationStatus
from apps.consents.models import ConsentType
from apps.consents.services import record_consent
from apps.lenders.models import (
    EligibilityRule,
    Lender,
    LenderProduct,
    PayoutModel,
    ProductType,
    RuleField,
    RuleOperator,
)


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    """Reset DRF throttle history between tests (LocMemCache persists in-process)."""
    from django.core.cache import cache

    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db, django_user_model):
    return django_user_model.objects.create_superuser(
        email="admin@veyra.test", password="a-very-long-password-123"
    )


@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def lender(db):
    return Lender.objects.create(name="Test Lender", slug="test-lender", priority=10)


@pytest.fixture
def product(lender):
    return LenderProduct.objects.create(
        lender=lender,
        name="Test Consumer Loan",
        slug="test-consumer",
        product_type=ProductType.CONSUMER_LOAN,
        min_amount=Decimal("500"),
        max_amount=Decimal("5000"),
        min_term_months=3,
        max_term_months=36,
        min_income=Decimal("1000"),
        application_url="https://example.com/apply",
        payout_model=PayoutModel.CPL,
        payout_value=Decimal("20.00"),
    )


@pytest.fixture
def product_factory(db):
    def _make(lender, **kwargs):
        defaults = dict(
            name="Product",
            slug="product",
            product_type=ProductType.CONSUMER_LOAN,
            min_amount=Decimal("200"),
            max_amount=Decimal("10000"),
            min_term_months=1,
            max_term_months=60,
            application_url="https://example.com/apply",
            payout_model=PayoutModel.CPL,
            payout_value=Decimal("10.00"),
        )
        defaults.update(kwargs)
        return LenderProduct.objects.create(lender=lender, **defaults)

    return _make


@pytest.fixture
def application(db):
    return Application.objects.create(
        requested_amount=Decimal("1000"),
        requested_term_months=12,
        monthly_income=Decimal("2500"),
        employment_type="FULL_TIME",
        employment_months=24,
        purpose="MAJOR_PURCHASE",
        status=ApplicationStatus.STARTED,
        email="applicant@example.com",
    )


@pytest.fixture
def consented_application(application):
    for ct in (ConsentType.PLATFORM_PROCESSING, ConsentType.PARTNER_DATA_TRANSFER):
        record_consent(
            application=application,
            consent_type=ct,
            accepted=True,
            consent_text_version="1",
        )
    return application


@pytest.fixture
def make_rule(db):
    def _make(product, field, operator, value, **kwargs):
        return EligibilityRule.objects.create(
            product=product,
            field=field,
            operator=operator,
            value=value,
            **kwargs,
        )

    return _make
