"""Seed demo partners, products, and eligibility rules.

    python manage.py seed_demo_data

Demo partners are clearly labelled and must NOT be presented as real companies.
Values here are illustrative only, not real partner terms. All amounts are EUR.
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.lenders.models import (
    EligibilityRule,
    Lender,
    LenderProduct,
    PartnerStatus,
    PartnerType,
    PayoutModel,
    ProductType,
    RuleField,
    RuleOperator,
)

# Phase 2 employment codes accepted per demo product.
ALL_EMPLOYMENT = ["employed", "self_employed", "business_owner", "pensioner"]

DEMO = [
    {
        "name": "Demo Partner A",
        "slug": "demo-partner-a",
        "description": "Illustrative short-term partner (demo data only).",
        "priority": 30,
        "display_order": 1,
        "product": {
            "name": "Demo Short-Term Credit A",
            "slug": "demo-short-term-a",
            "product_type": ProductType.SHORT_TERM_LOAN,
            "min_amount": Decimal("500"),
            "max_amount": Decimal("3000"),
            "min_term_months": 3,
            "max_term_months": 24,
            "min_income": Decimal("800"),
            "priority": 80,
            "payout_model": PayoutModel.CPL,
            "payout_value": Decimal("12.00"),
            "employment": ["employed", "self_employed"],
        },
    },
    {
        "name": "Demo Partner B",
        "slug": "demo-partner-b",
        "description": "Illustrative consumer partner (demo data only).",
        "priority": 20,
        "display_order": 2,
        "product": {
            "name": "Demo Consumer Credit B",
            "slug": "demo-consumer-b",
            "product_type": ProductType.CONSUMER_LOAN,
            "min_amount": Decimal("500"),
            "max_amount": Decimal("5000"),
            "min_term_months": 3,
            "max_term_months": 36,
            "min_income": Decimal("1000"),
            "priority": 90,
            "payout_model": PayoutModel.CPA,
            "payout_value": Decimal("45.00"),
            "employment": ALL_EMPLOYMENT,
        },
    },
    {
        "name": "Demo Partner C",
        "slug": "demo-partner-c",
        "description": "Illustrative larger consumer partner (demo data only).",
        "priority": 10,
        "display_order": 3,
        "product": {
            "name": "Demo Consumer Credit C",
            "slug": "demo-consumer-c",
            "product_type": ProductType.CONSUMER_LOAN,
            "min_amount": Decimal("1000"),
            "max_amount": Decimal("10000"),
            "min_term_months": 6,
            "max_term_months": 60,
            "min_income": Decimal("1500"),
            "priority": 70,
            "payout_model": PayoutModel.CPS_PERCENT,
            "payout_value": Decimal("3.50"),
            "employment": ALL_EMPLOYMENT,
            "max_obligations": Decimal("1500"),
            # Illustrative age band (demo only).
            "min_age": 21,
            "max_age": 70,
        },
    },
]


class Command(BaseCommand):
    help = "Seed demo partners, products, and eligibility rules (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        for entry in DEMO:
            lender, _ = Lender.objects.update_or_create(
                slug=entry["slug"],
                defaults={
                    "name": entry["name"],
                    "display_name": entry["name"],
                    "legal_name": f"{entry['name']} (demo) EOOD",
                    "description": entry["description"],
                    "partner_type": PartnerType.LENDER,
                    "status": PartnerStatus.ACTIVE,
                    "contact_name": "Demo Contact",
                    "contact_email": f"partners+{entry['slug']}@example.com",
                    "notes": "Demo partner — not a real company. Illustrative data only.",
                    "active": True,
                    "priority": entry["priority"],
                    "display_order": entry["display_order"],
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
                    "min_age": p.get("min_age"),
                    "max_age": p.get("max_age"),
                    "priority": p["priority"],
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

            # Employment eligibility: accept only the listed statuses.
            EligibilityRule.objects.update_or_create(
                product=product,
                field=RuleField.EMPLOYMENT_TYPE,
                operator=RuleOperator.IN,
                defaults={
                    "value": p["employment"],
                    "show_reason_to_customer": False,
                    "active": True,
                },
            )

            # Optional: cap existing monthly obligations.
            if "max_obligations" in p:
                EligibilityRule.objects.update_or_create(
                    product=product,
                    field=RuleField.MONTHLY_DEBT_PAYMENT,
                    operator=RuleOperator.LESS_THAN_OR_EQUAL,
                    defaults={
                        "value": str(p["max_obligations"]),
                        "show_reason_to_customer": False,
                        "active": True,
                    },
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(DEMO)} demo partners with products and rules."
            )
        )
