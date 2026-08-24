"""Persisted results of the matching engine.

A Match is the compatibility result between an application and a lender
product. The score is an internal compatibility score, NOT a credit score
and NOT a probability of approval.
"""
from django.db import models

from apps.applications.models import Application
from apps.core.models import UUIDTimeStampedModel
from apps.lenders.models import Lender, LenderProduct


class Match(UUIDTimeStampedModel):
    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="matches"
    )
    lender = models.ForeignKey(Lender, on_delete=models.CASCADE, related_name="matches")
    product = models.ForeignKey(
        LenderProduct, on_delete=models.CASCADE, related_name="matches"
    )

    eligible = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(null=True, blank=True)

    # Full reason objects (may contain internal-only reasons).
    reasons = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("application", "rank")
        constraints = [
            models.UniqueConstraint(
                fields=["application", "product"],
                name="uniq_match_per_application_product",
            )
        ]

    def __str__(self) -> str:
        return f"Match<{self.application.public_reference} -> {self.product}>"

    @property
    def customer_reasons(self) -> list[str]:
        """Reason texts safe to show to the consumer (English fallback)."""
        return [
            r["text"]
            for r in self.reasons
            if isinstance(r, dict) and r.get("show_to_customer", True) and r.get("text")
        ]

    @property
    def customer_reason_payload(self) -> list[dict]:
        """Structured, localizable reasons safe to show to the consumer.

        Each entry carries a stable ``code`` (localized on the client) with
        ``params`` to interpolate, plus an English ``text`` fallback.
        """
        payload = []
        for r in self.reasons:
            if not isinstance(r, dict) or not r.get("show_to_customer", True):
                continue
            if not r.get("text") and not r.get("code"):
                continue
            payload.append(
                {
                    "code": r.get("code", ""),
                    "params": r.get("params", {}),
                    "text": r.get("text", ""),
                }
            )
        return payload
