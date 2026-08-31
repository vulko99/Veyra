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

# Employment categories treated as "employment required" (has an income source).
EMPLOYMENT_REQUIRED = ["employed", "self_employed", "business_owner", "pensioner"]

# Demonstration criteria ONLY — fictional partners, not real lender conditions.
# Kept broad so a normal demo application can realistically match multiple.
DEMO = [
    {
        "name": "Demo Partner A",
        "slug": "demo-partner-a",
        "description": "Fictional demonstration partner (demo data only).",
        "priority": 30,
        "display_order": 1,
        "product": {
            "name": "Demo Consumer Credit A",
            "slug": "demo-consumer-a",
            "product_type": ProductType.CONSUMER_LOAN,
            "min_amount": Decimal("500"),
            "max_amount": Decimal("5000"),
            "min_term_months": 3,
            "max_term_months": 36,
            "min_income": Decimal("1200"),
            "priority": 80,
            "payout_model": PayoutModel.CPL,
            "payout_value": Decimal("12.00"),
            "employment": EMPLOYMENT_REQUIRED,  # employment required
        },
    },
    {
        "name": "Demo Partner B",
        "slug": "demo-partner-b",
        "description": "Fictional demonstration partner (demo data only).",
        "priority": 20,
        "display_order": 2,
        "product": {
            "name": "Demo Consumer Credit B",
            "slug": "demo-consumer-b",
            "product_type": ProductType.CONSUMER_LOAN,
            "min_amount": Decimal("1000"),
            "max_amount": Decimal("8000"),
            "min_term_months": 3,
            "max_term_months": 48,
            "min_income": Decimal("1000"),
            "priority": 70,
            "payout_model": PayoutModel.CPA,
            "payout_value": Decimal("45.00"),
            "employment": EMPLOYMENT_REQUIRED,  # employment required
        },
    },
    {
        "name": "Demo Partner C",
        "slug": "demo-partner-c",
        "description": "Fictional demonstration partner (demo data only).",
        "priority": 10,
        "display_order": 3,
        "product": {
            "name": "Demo Consumer Credit C",
            "slug": "demo-consumer-c",
            "product_type": ProductType.CONSUMER_LOAN,
            "min_amount": Decimal("500"),
            "max_amount": Decimal("10000"),
            "min_term_months": 3,
            "max_term_months": 60,
            "min_income": Decimal("900"),
            "priority": 60,
            "payout_model": PayoutModel.CPS_PERCENT,
            "payout_value": Decimal("3.50"),
            # employment NOT required -> no employment eligibility rule
            "employment": None,
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
                    "is_demo": True,
                    "minimum_match_score": 80,  # demo threshold
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

            # Employment eligibility: only when the product requires employment.
            if p.get("employment"):
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
            else:
                # Partner C does not require employment — remove any prior rule.
                EligibilityRule.objects.filter(
                    product=product, field=RuleField.EMPLOYMENT_TYPE
                ).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(DEMO)} demo partners with products and rules."
            )
        )
