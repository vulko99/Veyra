"""Application: the central business object of the funnel.

An applicant can submit without creating an account (see accounts app). PII
is minimised: IP and user agent are stored only as salted hashes.
"""
from django.db import models

from apps.core.models import UUIDModel, UUIDTimeStampedModel
from apps.core.reference import public_reference, veyra_application_id


class ApplicationStatus(models.TextChoices):
    # Phase 1 + Phase 2 statuses (configurable). Values are stable identifiers.
    DRAFT = "DRAFT"
    STARTED = "STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    SUBMITTED = "SUBMITTED"
    QUALIFIED = "QUALIFIED"
    MATCHED = "MATCHED"
    PARTNER_SELECTED = "PARTNER_SELECTED"
    ROUTED = "ROUTED"
    REFERRED = "REFERRED"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FUNDED = "FUNDED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class EmploymentStatus(models.TextChoices):
    """Phase 2 applicant employment categories."""

    EMPLOYED = "employed", "Employed"
    SELF_EMPLOYED = "self_employed", "Self-employed"
    BUSINESS_OWNER = "business_owner", "Business owner"
    PENSIONER = "pensioner", "Pensioner"
    OTHER = "other", "Other"


class EmploymentType(models.TextChoices):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    SELF_EMPLOYED = "SELF_EMPLOYED"
    CONTRACT = "CONTRACT"
    UNEMPLOYED = "UNEMPLOYED"
    RETIRED = "RETIRED"
    STUDENT = "STUDENT"
    OTHER = "OTHER"


class LoanPurpose(models.TextChoices):
    HOME_IMPROVEMENT = "HOME_IMPROVEMENT"
    DEBT_CONSOLIDATION = "DEBT_CONSOLIDATION"
    VEHICLE = "VEHICLE"
    MEDICAL = "MEDICAL"
    EDUCATION = "EDUCATION"
    TRAVEL = "TRAVEL"
    MAJOR_PURCHASE = "MAJOR_PURCHASE"
    EMERGENCY = "EMERGENCY"
    OTHER = "OTHER"


class Applicant(UUIDTimeStampedModel):
    """The person behind an application.

    Phase 2 stores contact + financial profile here (EUR-native). Applicants
    never authenticate; the same person may have multiple applications over
    time (linked by matching email at the service layer).
    """

    first_name = models.CharField(max_length=120, blank=True)
    last_name = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)

    monthly_income_eur = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    employment_status = models.CharField(
        max_length=20, choices=EmploymentStatus.choices, blank=True
    )
    existing_monthly_obligations_eur = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        name = f"{self.first_name} {self.last_name}".strip()
        return name or (self.email or str(self.id))


class Application(UUIDTimeStampedModel):
    # Public, human-readable id (VY-XXXXXX). The DB primary key is never exposed.
    # Nullable at the DB level only so the column can be added to existing rows;
    # save() always assigns a unique value, so it is never null in practice.
    public_id = models.CharField(
        max_length=16, unique=True, null=True, blank=True, editable=False, db_index=True
    )
    # Legacy public reference (Phase 1); retained for backward compatibility.
    public_reference = models.CharField(
        max_length=32, unique=True, editable=False, db_index=True
    )

    applicant = models.ForeignKey(
        "applications.Applicant",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="applications",
    )

    # --- Request --- (nullable so a draft can be saved before these are set)
    requested_amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    requested_currency = models.CharField(max_length=3, default="EUR")
    requested_term_months = models.PositiveIntegerField(null=True, blank=True)

    # Which funnel step the applicant last reached (for resume-after-refresh).
    current_step = models.CharField(max_length=32, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # --- Financial snapshot (source of truth for matching) ---
    monthly_income = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    income_currency = models.CharField(max_length=3, default="BGN")
    employment_type = models.CharField(
        max_length=20, choices=EmploymentType.choices, blank=True
    )
    employment_months = models.PositiveIntegerField(null=True, blank=True)

    has_existing_loans = models.BooleanField(default=False)
    existing_loan_balance = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    existing_monthly_payments = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    purpose = models.CharField(max_length=32, choices=LoanPurpose.choices, blank=True)

    # --- Minimal demographics ---
    city = models.CharField(max_length=120, blank=True)
    age_range = models.CharField(max_length=16, blank=True)

    # --- Contact ---
    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)

    # --- Funnel / status ---
    status = models.CharField(
        max_length=16,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.DRAFT,
        db_index=True,
    )
    source = models.CharField(max_length=120, blank=True)
    campaign = models.CharField(max_length=120, blank=True)
    utm_source = models.CharField(max_length=120, blank=True)
    utm_medium = models.CharField(max_length=120, blank=True)
    utm_campaign = models.CharField(max_length=120, blank=True)
    utm_term = models.CharField(max_length=120, blank=True)
    utm_content = models.CharField(max_length=120, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    landing_page = models.CharField(max_length=500, blank=True)

    # --- Privacy-safe request fingerprints (hashed, never raw) ---
    ip_hash = models.CharField(max_length=64, blank=True)
    user_agent_hash = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self) -> str:
        return self.public_id or self.public_reference or str(self.id)

    # EUR-native accessors (Phase 2 vocabulary) over the stored columns.
    @property
    def desired_amount_eur(self):
        return self.requested_amount

    @property
    def desired_term_months(self):
        return self.requested_term_months

    def save(self, *args, **kwargs):
        if not self.public_reference:
            ref = public_reference()
            while Application.objects.filter(public_reference=ref).exists():
                ref = public_reference()
            self.public_reference = ref
        if not self.public_id:
            vid = veyra_application_id()
            while Application.objects.filter(public_id=vid).exists():
                vid = veyra_application_id()
            self.public_id = vid
        super().save(*args, **kwargs)


class IncomeType(models.TextChoices):
    SALARY = "SALARY"
    PENSION = "PENSION"
    BENEFITS = "BENEFITS"
    BUSINESS = "BUSINESS"
    OTHER = "OTHER"


class FinancialProfile(UUIDTimeStampedModel):
    """Structured financial data separated from application metadata.

    Populated at submission from the application snapshot. Keeping it as its
    own table supports data-minimisation and targeted retention/anonymisation
    of the most sensitive fields.
    """

    application = models.OneToOneField(
        Application, on_delete=models.CASCADE, related_name="financial_profile"
    )
    monthly_income = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    income_type = models.CharField(
        max_length=16, choices=IncomeType.choices, blank=True
    )
    employment_type = models.CharField(max_length=20, blank=True)
    employment_duration = models.PositiveIntegerField(null=True, blank=True)
    existing_debt = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    monthly_debt_payment = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    requested_amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    requested_term = models.PositiveIntegerField(null=True, blank=True)
    loan_purpose = models.CharField(max_length=32, blank=True)

    def __str__(self) -> str:
        return f"FinancialProfile<{self.application.public_reference}>"


class ApplicationEventType(models.TextChoices):
    APPLICATION_STARTED = "application_started"
    STEP_COMPLETED = "step_completed"
    APPLICATION_COMPLETED = "application_completed"
    CONSENT_GRANTED = "consent_granted"
    MATCHING_STARTED = "matching_started"
    MATCHING_COMPLETED = "matching_completed"
    PARTNER_VIEWED = "partner_viewed"
    PARTNER_SELECTED = "partner_selected"
    REFERRAL_CREATED = "referral_created"
    PARTNER_STATUS_UPDATED = "partner_status_updated"


class ApplicationEvent(UUIDModel):
    """Append-only event log powering auditability and conversion analytics.

    Every important application state change is represented here, so the full
    lifecycle can be reconstructed: started -> data submitted -> consent ->
    matched -> partner selected -> referred -> partner status.
    """

    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="events"
    )
    event_type = models.CharField(
        max_length=40, choices=ApplicationEventType.choices, db_index=True
    )
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("timestamp",)
        indexes = [models.Index(fields=["application", "event_type"])]

    def __str__(self) -> str:
        return f"{self.event_type}@{self.application.public_id}"
