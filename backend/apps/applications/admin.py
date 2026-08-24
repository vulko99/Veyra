from django.contrib import admin

from apps.consents.models import Consent
from apps.matching.models import Match

from .models import Application, FinancialProfile


class ConsentInline(admin.TabularInline):
    model = Consent
    extra = 0
    can_delete = False
    readonly_fields = (
        "consent_type",
        "accepted",
        "accepted_at",
        "consent_text_version",
        "privacy_policy_version",
        "terms_version",
    )

    def has_add_permission(self, request, obj=None):
        return False


class FinancialProfileInline(admin.StackedInline):
    model = FinancialProfile
    extra = 0
    can_delete = False


class MatchInline(admin.TabularInline):
    model = Match
    extra = 0
    fields = ("lender", "product", "eligible", "score", "rank")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "public_reference",
        "created_at",
        "requested_amount",
        "requested_term_months",
        "monthly_income",
        "status",
        "source",
    )
    list_filter = ("status", "source", "employment_type", "created_at")
    search_fields = ("public_reference",)
    date_hierarchy = "created_at"
    readonly_fields = ("public_reference", "ip_hash", "user_agent_hash", "created_at", "updated_at")
    inlines = [FinancialProfileInline, ConsentInline, MatchInline]
