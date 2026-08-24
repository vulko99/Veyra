"""Commission tracking.

Payout values are never hard-coded; they are derived from the lender
product's configured payout_model/payout_value at the time of calculation.
"""
from django.db import models

from apps.core.models import UUIDModel
from apps.leads.models import Lead
from apps.lenders.models import Lender, PayoutModel


class CommissionStatus(models.TextChoices):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CLAWBACK = "CLAWBACK"
    PAID = "PAID"


class Commission(UUIDModel):
    lead = models.OneToOneField(
        Lead, on_delete=models.CASCADE, related_name="commission"
    )
    lender = models.ForeignKey(
        Lender, on_delete=models.PROTECT, related_name="commissions"
    )
    payout_model = models.CharField(max_length=16, choices=PayoutModel.choices)
    expected_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    currency = models.CharField(max_length=3, default="BGN")

    status = models.CharField(
        max_length=16,
        choices=CommissionStatus.choices,
        default=CommissionStatus.PENDING,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"Commission<{self.lender.name} {self.expected_amount} {self.currency}>"
