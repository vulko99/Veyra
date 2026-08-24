from django.contrib import admin

from .models import Commission


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    list_display = (
        "lender",
        "lead",
        "expected_amount",
        "actual_amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "payout_model", "lender")
    search_fields = ("lead__tracking_id", "lender__name")
    readonly_fields = ("lead", "lender", "payout_model", "created_at")
