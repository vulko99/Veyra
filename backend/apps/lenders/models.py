"""Lenders, their products, and their eligibility rules.

No lender-specific logic lives in code. Everything a lender's matching
behaviour depends on is configuration: products define ranges, and
EligibilityRule rows express arbitrary field/operator/value conditions
evaluated generically by the matching engine.
"""
from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import UUIDTimeStampedModel


class PartnerStatus(models.TextChoices):
    """Lifecycle of a partner relationship (Phase 3)."""

    PENDING = "PENDING", "Pending"
    ACTIVE = "ACTIVE", "Active"
    PAUSED = "PAUSED", "Paused"
    INACTIVE = "INACTIVE", "Inactive"


class PartnerType(models.TextChoices):
    LENDER = "LENDER", "Lender"
    BROKER = "BROKER", "Broker"
    OTHER = "OTHER", "Other"


class DeliveryMethod(models.TextChoices):
    """How an agreed referral is delivered to a partner. Provider-independent:
    the referral system stays the same as new backends are added."""

    MANUAL = "MANUAL", "Manual / none (no automated delivery)"
    EMAIL = "EMAIL", "Email"
    API = "API", "Partner API"
    WEBHOOK = "WEBHOOK", "Webhook"


class Lender(UUIDTimeStampedModel):
    name = models.CharField(max_length=200)
    # Optional richer identity (Phase 3). display_name/legal_name fall back to
    # ``name`` via the properties below so existing callers keep working.
    legal_name = models.CharField(max_length=250, blank=True)
    display_name = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="lenders/logos/", blank=True, null=True)
    # URL-based logo (Phase 2 Partner.logo_url); no fabricated partner logos.
    logo_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    # Partner-level default application URL (products may override).
    application_url = models.URLField(blank=True)

    partner_type = models.CharField(
        max_length=16, choices=PartnerType.choices, default=PartnerType.LENDER
    )
    # Lifecycle status (Phase 3). ``active`` remains the authoritative matching
    # switch and is kept in sync with this field (see save()).
    status = models.CharField(
        max_length=16,
        choices=PartnerStatus.choices,
        default=PartnerStatus.ACTIVE,
        db_index=True,
    )

    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)

    # Fictional demonstration partner (not a real company). Visible in matching
    # only while settings.DEMO_MODE is on; referrals to it are simulated.
    is_demo = models.BooleanField(default=False, db_index=True)

    # --- Lead distribution policy (Phase: multi-partner marketplace) ---
    # Whether this partner accepts leads that may also be shared with other
    # matching partners. A partner may still MATCH regardless; this governs the
    # distribution/delivery layer, never the matching engine.
    accepts_shared_leads = models.BooleanField(default=True)
    # Optional per-partner override of the global MATCH_THRESHOLD (0-100).
    minimum_match_score = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Overrides the global match threshold for this partner (0-100).",
    )
    # Optional cap on how many referrals one application may create to this
    # partner (None = unlimited).
    max_referrals_per_application = models.PositiveIntegerField(null=True, blank=True)
    # Whether a referral requires explicit user selection (True today; set False
    # only for partners cleared for automatic distribution).
    requires_user_selection = models.BooleanField(default=True)

    # How agreed referrals are delivered to this partner, and where.
    delivery_method = models.CharField(
        max_length=16, choices=DeliveryMethod.choices, default=DeliveryMethod.MANUAL
    )
    delivery_email = models.EmailField(blank=True)
    # Whitelist of referral payload field names this partner is permitted to
    # receive (per agreement). Empty list = the standard minimal payload.
    referral_allowed_fields = models.JSONField(default=list, blank=True)
    # Optional custom email body template. Placeholders like {reference},
    # {product}, {requested_amount_eur}, {requested_term_months}, {contact_name},
    # {contact_email}, {contact_phone} are substituted at send time.
    referral_email_template = models.TextField(blank=True)

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

    @property
    def public_name(self) -> str:
        """Consumer-facing name: display_name if set, else name."""
        return self.display_name or self.name

    @property
    def registered_name(self) -> str:
        """Legal/registered name if provided, else name."""
        return self.legal_name or self.name

    def effective_min_score(self, global_threshold: int) -> int:
        """The score this partner requires to be referral-eligible: its own
        ``minimum_match_score`` override if set, otherwise the global threshold."""
        return (
            self.minimum_match_score
            if self.minimum_match_score is not None
            else global_threshold
        )

    def save(self, *args, **kwargs):
        # Keep the legacy ``active`` flag consistent with ``status`` without ever
        # overriding an explicit active=False (matching queries rely on active):
        #   - a non-active status forces active off,
        #   - toggling active off is reflected as INACTIVE.
        if self.status in (
            PartnerStatus.PENDING,
            PartnerStatus.PAUSED,
            PartnerStatus.INACTIVE,
        ):
            self.active = False
        elif not self.active and self.status == PartnerStatus.ACTIVE:
            self.status = PartnerStatus.INACTIVE
        super().save(*args, **kwargs)


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

    # Optional age bounds (Phase 3). Nullable: when unset the criterion is not
    # evaluated. When set but the applicant's age is unknown, the criterion is
    # reported UNKNOWN rather than a hard rejection (see the matching engine).
    min_age = models.PositiveIntegerField(null=True, blank=True)
    max_age = models.PositiveIntegerField(null=True, blank=True)

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
    AGE = "age"


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

    # When True, the applicant MUST have supplied this field: a missing value
    # (otherwise reported UNKNOWN) is treated as a hard failure. When False,
    # missing data leaves the product eligible but flags the match UNKNOWN.
    mandatory = models.BooleanField(
        default=False,
        help_text=(
            "If set, missing applicant data for this rule excludes the product; "
            "otherwise a missing value is reported as UNKNOWN, not a rejection."
        ),
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
