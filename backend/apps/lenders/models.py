"""Lenders, their products, and their eligibility rules.

No lender-specific logic lives in code. Everything a lender's matching
behaviour depends on is configuration: products define ranges, and
EligibilityRule rows express arbitrary field/operator/value conditions
evaluated generically by the matching engine.
"""
from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import UUIDTimeStampedModel


class Lender(UUIDTimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="lenders/logos/", blank=True, null=True)
    # URL-based logo (Phase 2 Partner.logo_url); no fabricated partner logos.
    logo_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)

    active = models.BooleanField(default=True)
    priority = models.IntegerField(
        default=0,
        help_text="Higher priority lenders are preferred as a tie-breaker in ranking.",
    )
    # Presentation order in partner listings (Phase 2 Partner.display_order).
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ("display_order", "-priority", "name")

    def __str__(self) -> str:
        return self.name


class ProductType(models.TextChoices):
    SHORT_TERM_LOAN = "SHORT_TERM_LOAN"
    CONSUMER_LOAN = "CONSUMER_LOAN"
    REFINANCING = "REFINANCING"
    DEBT_CONSOLIDATION = "DEBT_CONSOLIDATION"
    CREDIT_CARD = "CREDIT_CARD"
    OTHER = "OTHER"


class TrackingType(models.TextChoices):
    DIRECT = "DIRECT", "Direct link"
    AFFILIATE = "AFFILIATE", "Affiliate network"
    POSTBACK = "POSTBACK", "Server postback"


class PayoutModel(models.TextChoices):
    CPL = "CPL", "Cost per lead"
    CPA = "CPA", "Cost per action"
    CPS = "CPS", "Cost per sale (fixed)"
    CPS_PERCENT = "CPS_PERCENT", "Cost per sale (percentage)"
    HYBRID = "HYBRID", "Hybrid"


class LenderProduct(UUIDTimeStampedModel):
    lender = models.ForeignKey(
        Lender, on_delete=models.CASCADE, related_name="products"
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120)
    product_type = models.CharField(
        max_length=32, choices=ProductType.choices, default=ProductType.CONSUMER_LOAN
    )

    min_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="BGN")

    min_term_months = models.PositiveIntegerField()
    max_term_months = models.PositiveIntegerField()

    min_income = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    # Where the applicant is sent, and how outbound clicks are tracked.
    application_url = models.URLField()
    tracking_type = models.CharField(
        max_length=16, choices=TrackingType.choices, default=TrackingType.DIRECT
    )
    tracking_url_template = models.TextField(
        blank=True,
        help_text=(
            "Optional template for the outbound URL. Placeholders: "
            "{application_url}, {tracking_id}, {click_id}, {affiliate_id}."
        ),
    )
    affiliate_id = models.CharField(max_length=120, blank=True)

    # Commission configuration (never hard-coded).
    payout_model = models.CharField(
        max_length=16, choices=PayoutModel.choices, default=PayoutModel.CPL
    )
    payout_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Fixed payout amount, or percentage (0-100) for CPS_PERCENT.",
    )

    active = models.BooleanField(default=True)
    # Configurable ranking priority (higher ranks first in matching results).
    priority = models.IntegerField(default=0)

    class Meta:
        ordering = ("-priority", "lender", "name")
        constraints = [
            models.UniqueConstraint(
                fields=["lender", "slug"], name="uniq_product_slug_per_lender"
            )
        ]

    def __str__(self) -> str:
        return f"{self.lender.name} – {self.name}"

    def clean(self):
        if self.min_amount > self.max_amount:
            raise ValidationError("min_amount cannot exceed max_amount.")
        if self.min_term_months > self.max_term_months:
            raise ValidationError("min_term_months cannot exceed max_term_months.")


class RuleField(models.TextChoices):
    REQUESTED_AMOUNT = "requested_amount"
    REQUESTED_TERM_MONTHS = "requested_term_months"
    MONTHLY_INCOME = "monthly_income"
    EMPLOYMENT_TYPE = "employment_type"
    EMPLOYMENT_MONTHS = "employment_months"
    EXISTING_DEBT = "existing_debt"
    MONTHLY_DEBT_PAYMENT = "monthly_debt_payment"
    LOAN_PURPOSE = "loan_purpose"


class RuleOperator(models.TextChoices):
    EQUALS = "EQUALS"
    NOT_EQUALS = "NOT_EQUALS"
    GREATER_THAN = "GREATER_THAN"
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL"
    LESS_THAN = "LESS_THAN"
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL"
    IN = "IN"
    NOT_IN = "NOT_IN"
    BETWEEN = "BETWEEN"


class EligibilityRule(UUIDTimeStampedModel):
    """A single generic condition attached to a product.

    ``value`` is stored as JSON so it can hold a scalar, a list (IN/NOT_IN),
    or a two-element list (BETWEEN). The matching engine interprets it based
    on the operator and the field's type.
    """

    product = models.ForeignKey(
        LenderProduct, on_delete=models.CASCADE, related_name="eligibility_rules"
    )
    field = models.CharField(max_length=40, choices=RuleField.choices)
    operator = models.CharField(max_length=32, choices=RuleOperator.choices)
    value = models.JSONField(
        help_text="Scalar for comparisons; list for IN/NOT_IN; [low, high] for BETWEEN."
    )

    # Whether a human-readable reason derived from this rule may be shown to
    # the consumer (some underwriting criteria are confidential).
    show_reason_to_customer = models.BooleanField(default=True)
    reason_template = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional custom reason text shown when the rule passes.",
    )

    active = models.BooleanField(default=True)

    class Meta:
        ordering = ("product", "field")

    def __str__(self) -> str:
        return f"{self.product.name}: {self.field} {self.operator} {self.value}"

    def clean(self):
        list_ops = {RuleOperator.IN, RuleOperator.NOT_IN}
        if self.operator in list_ops and not isinstance(self.value, list):
            raise ValidationError("IN/NOT_IN require a list value.")
        if self.operator == RuleOperator.BETWEEN:
            if not (isinstance(self.value, list) and len(self.value) == 2):
                raise ValidationError("BETWEEN requires a [low, high] list value.")
