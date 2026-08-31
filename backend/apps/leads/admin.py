from django.contrib import admin

from .models import Lead, LeadEvent


class LeadEventInline(admin.TabularInline):
    model = LeadEvent
    extra = 0
    readonly_fields = ("event_type", "timestamp", "external_event_id", "metadata")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "application",
        "lender",
        "referral_status",
        "status",
        "match_score",
        "source",
        "created_at",
        "funded_display",
    )
    list_filter = ("referral_status", "status", "lender", "source")
    search_fields = (
        "application__public_reference",
        "application__public_id",
        "tracking_id",
        "external_lead_id",
        "external_reference",
    )
    readonly_fields = (
        "tracking_id",
        "match_score",
        "consent_version",
        "source",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "created_at",
        "updated_at",
        "sent_at",
        "selected_at",
        "referred_at",
    )
    inlines = [LeadEventInline]

    @admin.display(description="Funded")
    def funded_display(self, obj):
        return obj.status == "FUNDED"


@admin.register(LeadEvent)
class LeadEventAdmin(admin.ModelAdmin):
    list_display = ("lead", "event_type", "timestamp", "external_event_id")
    list_filter = ("event_type",)
    search_fields = ("lead__tracking_id", "external_event_id")

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
