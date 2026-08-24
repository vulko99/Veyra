"""Application: the central business object of the funnel.

An applicant can submit without creating an account (see accounts app). PII
is minimised: IP and user agent are stored only as salted hashes.
"""
from django.db import models

from apps.core.models import UUIDTimeStampedModel
from apps.core.reference import public_reference


class ApplicationStatus(models.TextChoices):
    DRAFT = "DRAFT"
    STARTED = "STARTED"
    SUBMITTED = "SUBMITTED"
    QUALIFIED = "QUALIFIED"
    MATCHED = "MATCHED"
    ROUTED = "ROUTED"
    IN_PROGRESS = "IN_PROGRESS"
    APPROVED = "APPROVED"
    FUNDED = "FUNDED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


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


class Application(UUIDTimeStampedModel):
    public_reference = models.CharField(
        max_length=32, unique=True, editable=False, db_index=True
    )

    # --- Request ---
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    requested_currency = models.CharField(max_length=3, default="BGN")
    requested_term_months = models.PositiveIntegerField()

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
        return self.public_reference or str(self.id)

    def save(self, *args, **kwargs):
        if not self.public_reference:
            ref = public_reference()
            while Application.objects.filter(public_reference=ref).exists():
                ref = public_reference()
            self.public_reference = ref
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
