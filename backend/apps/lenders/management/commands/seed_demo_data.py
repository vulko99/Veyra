"""Seed demo lenders, products, and eligibility rules.

    python manage.py seed_demo_data

Demo lenders are clearly labelled and must NOT be presented as real companies.
Values here are illustrative only, not real partner terms.
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.lenders.models import (
    EligibilityRule,
    Lender,
    LenderProduct,
    PayoutModel,
    ProductType,
    RuleField,
    RuleOperator,
)

DEMO = [
    {
        "name": "Demo Lender A",
        "slug": "demo-lender-a",
        "description": "Illustrative short-term lender (demo data only).",
        "priority": 30,
        "product": {
            "name": "Demo Short-Term Loan A",
            "slug": "demo-short-term-a",
            "product_type": ProductType.SHORT_TERM_LOAN,
            "min_amount": Decimal("200"),
            "max_amount": Decimal("1000"),
            "min_term_months": 1,
            "max_term_months": 12,
            "min_income": Decimal("800"),
            "payout_model": PayoutModel.CPL,
            "payout_value": Decimal("12.00"),
        },
    },
    {
        "name": "Demo Lender B",
        "slug": "demo-lender-b",
        "description": "Illustrative consumer lender (demo data only).",
        "priority": 20,
        "product": {
            "name": "Demo Consumer Loan B",
            "slug": "demo-consumer-b",
            "product_type": ProductType.CONSUMER_LOAN,
            "min_amount": Decimal("500"),
            "max_amount": Decimal("5000"),
            "min_term_months": 3,
            "max_term_months": 36,
            "min_income": Decimal("1200"),
            "payout_model": PayoutModel.CPA,
            "payout_value": Decimal("45.00"),
        },
    },
    {
        "name": "Demo Lender C",
        "slug": "demo-lender-c",
        "description": "Illustrative larger consumer lender (demo data only).",
        "priority": 10,
        "product": {
            "name": "Demo Consumer Loan C",
            "slug": "demo-consumer-c",
            "product_type": ProductType.CONSUMER_LOAN,
            "min_amount": Decimal("1000"),
            "max_amount": Decimal("10000"),
            "min_term_months": 6,
            "max_term_months": 60,
            "min_income": Decimal("1800"),
            "payout_model": PayoutModel.CPS_PERCENT,
            "payout_value": Decimal("3.50"),
        },
    },
]


class Command(BaseCommand):
    help = "Seed demo lenders, products, and eligibility rules (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        for entry in DEMO:
            lender, _ = Lender.objects.update_or_create(
                slug=entry["slug"],
                defaults={
                    "name": entry["name"],
                    "description": entry["description"],
                    "active": True,
                    "priority": entry["priority"],
                },
            )
            p = entry["product"]
            product, _ = LenderProduct.objects.update_or_create(
                lender=lender,
                slug=p["slug"],
                defaults={
                    "name": p["name"],
                    "product_type": p["product_type"],
                    "min_amount": p["min_amount"],
                    "max_amount": p["max_amount"],
                    "currency": "EUR",
                    "min_term_months": p["min_term_months"],
                    "max_term_months": p["max_term_months"],
                    "min_income": p["min_income"],
                    "application_url": f"https://example.com/{entry['slug']}/apply",
                    "tracking_url_template": (
                        f"https://example.com/{entry['slug']}/apply"
                        "?tid={tracking_id}"
                    ),
                    "payout_model": p["payout_model"],
                    "payout_value": p["payout_value"],
                    "active": True,
                },
            )
            # A representative generic rule: exclude unemployed applicants.
            EligibilityRule.objects.update_or_create(
                product=product,
                field=RuleField.EMPLOYMENT_TYPE,
                operator=RuleOperator.NOT_EQUALS,
                defaults={
                    "value": "UNEMPLOYED",
                    "show_reason_to_customer": False,
                    "active": True,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(DEMO)} demo lenders with products and rules."
            )
        )
