from django.contrib import admin

from apps.consents.models import Consent
from apps.matching.models import Match

from .models import (
    Applicant,
    ApplicantIdentity,
    Application,
    ApplicationEvent,
    FinancialProfile,
)


@admin.register(ApplicantIdentity)
class ApplicantIdentityAdmin(admin.ModelAdmin):
    """EGN is NEVER shown in clear. Only the masked value and metadata."""

    list_display = ("application", "masked_egn", "egn_verified", "egn_collected_at")
    search_fields = ("application__public_id",)
    # The encrypted token and raw fields are never editable/visible in admin.
    readonly_fields = (
        "application",
        "masked_egn",
        "egn_verified",
        "egn_collected_at",
        "created_at",
        "updated_at",
    )
    exclude = ("egn_encrypted", "egn_last4")

    def masked_egn(self, obj):
        return obj.masked_egn or "—"

    masked_egn.short_description = "EGN"

    def has_add_permission(self, request):
        return False


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


class ApplicationEventInline(admin.TabularInline):
    model = ApplicationEvent
    extra = 0
    fields = ("event_type", "timestamp", "metadata")
    readonly_fields = fields
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = (
        "__str__",
        "email",
        "employment_status",
        "monthly_income_eur",
        "created_at",
    )
    list_filter = ("employment_status", "created_at")
    search_fields = ("first_name", "last_name", "email", "phone")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "public_id",
        "created_at",
        "requested_amount",
        "requested_term_months",
        "status",
        "current_step",
        "source",
    )
    list_filter = ("status", "source", "current_step", "created_at")
    search_fields = ("public_id", "public_reference", "applicant__email")
    date_hierarchy = "created_at"
    raw_id_fields = ("applicant",)
    readonly_fields = (
        "public_id",
        "public_reference",
        "ip_hash",
        "user_agent_hash",
        "created_at",
        "updated_at",
        "completed_at",
    )
    inlines = [FinancialProfileInline, ConsentInline, MatchInline, ApplicationEventInline]


@admin.register(ApplicationEvent)
class ApplicationEventAdmin(admin.ModelAdmin):
    list_display = ("application", "event_type", "timestamp")
    list_filter = ("event_type", "timestamp")
    search_fields = ("application__public_id",)
    date_hierarchy = "timestamp"
    readonly_fields = ("application", "event_type", "metadata", "timestamp")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
