from django.contrib import admin

from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("application", "lender", "status", "score", "rank", "eligible")
    list_filter = ("status", "eligible", "lender")
    search_fields = ("application__public_reference", "lender__name")
    readonly_fields = (
        "application",
        "lender",
        "product",
        "eligible",
        "status",
        "score",
        "rank",
        "reason_summary",
        "evaluation",
        "reasons",
    )

    def has_add_permission(self, request):
        return False
