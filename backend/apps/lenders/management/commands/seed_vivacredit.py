"""Onboard Viva Credit as a real partner — held PENDING until terms arrive.

    python manage.py seed_vivacredit

Only the criteria the partner has actually provided are encoded here:

  * Age 21–75 (hard criterion)  -> product.min_age / max_age
  * Provable income, salary or pension -> employment rule IN (employed, pensioner)

"Good credit history" is Viva Credit's OWN underwriting preference; Veyra does
not assess credit history or make credit decisions, so it is recorded in the
partner notes rather than encoded as an eligibility rule.

The partner and product are created INACTIVE / PENDING and are therefore
excluded from matching. Nothing commercial is invented: amount range, term
range, minimum income, application/tracking URL and the commission model are
left as unset placeholders and must be entered (in admin or by re-running this
command after the constants below are filled in) before activation.
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
    ProductType,
    RuleField,
    RuleOperator,
)

# Provable-income employment categories requested by Viva Credit
# (заплата -> employed, пенсия -> pensioner). These map to Applicant
# .employment_status codes used by the matching context.
PROVABLE_INCOME = ["employed", "pensioner"]

NOTES = (
    "Целеви клиентски профил (подаден от Viva Credit):\n"
    "• Навършени 21 години, горна граница 75 години.\n"
    "• Предпочитание за добра кредитна история — това е собствена преценка на "
    "партньора при кандидатстване; Veyra не оценява кредитна история и не взема "
    "кредитно решение, затова не е кодирано като правило за съответствие.\n"
    "• Доказуем доход (заплата или пенсия).\n\n"
    "СТАТУС: PENDING. Липсват, за да се активира партньорът: диапазон на сумата (EUR), "
    "диапазон на срока, минимален доход (ако има), URL за кандидатстване/проследяване "
    "и комисионен модел. Не са попълвани, за да не се измислят търговски условия."
)


class Command(BaseCommand):
    help = "Onboard Viva Credit (PENDING, excluded from matching) with known criteria."

    @transaction.atomic
    def handle(self, *args, **options):
        lender, _ = Lender.objects.update_or_create(
            slug="viva-credit",
            defaults={
                "name": "Viva Credit",
                "display_name": "Viva Credit",
                # legal_name intentionally left blank — not inventing the entity.
                "partner_type": PartnerType.LENDER,
                "status": PartnerStatus.PENDING,  # save() forces active=False
                "notes": NOTES,
                "priority": 100,  # commercially most advanced; ranks first once live
                "display_order": 0,
            },
        )

        # Product held INACTIVE. Commercial fields are placeholders (0 / blank):
        # nothing matches a 0–0 range, so it is fail-closed even if activated by
        # mistake before real terms are entered.
        product, _ = LenderProduct.objects.update_or_create(
            lender=lender,
            slug="viva-credit-pending",
            defaults={
                "name": "Viva Credit (условия предстоят)",
                "product_type": ProductType.OTHER,
                "min_amount": Decimal("0"),  # TODO: real amount range (EUR)
                "max_amount": Decimal("0"),
                "currency": "EUR",
                "min_term_months": 0,  # TODO: real term range
                "max_term_months": 0,
                "min_income": None,  # TODO: minimum income if any
                "min_age": 21,
                "max_age": 75,
                "application_url": "",  # TODO: real application/tracking URL
                "active": False,
            },
        )

        # Provable-income criterion (salary or pension). Non-mandatory: a missing
        # employment value is reported UNKNOWN, not an automatic rejection.
        EligibilityRule.objects.update_or_create(
            product=product,
            field=RuleField.EMPLOYMENT_TYPE,
            operator=RuleOperator.IN,
            defaults={
                "value": PROVABLE_INCOME,
                "mandatory": False,
                "show_reason_to_customer": False,
                "active": True,
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Viva Credit onboarded as PENDING (excluded from matching). "
                "Age 21–75 and provable-income (employed/pensioner) criteria set. "
                "Enter amount/term ranges, min income, application URL and commission "
                "model, then set status ACTIVE to go live."
            )
        )
