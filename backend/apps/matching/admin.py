from django.contrib import admin

from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = (
        "application",
        "lender",
        "status",
        "score",
        "threshold_used",
        "referral_eligible",
        "rank",
        "eligible",
    )
    list_filter = ("status", "referral_eligible", "eligible", "lender")
    search_fields = ("application__public_reference", "lender__name")
    readonly_fields = (
        "application",
        "lender",
        "product",
        "eligible",
        "referral_eligible",
        "status",
        "score",
        "threshold_used",
        "rank",
        "reason_summary",
        "evaluation",
        "reasons",
    )

    def has_add_permission(self, request):
        return False
