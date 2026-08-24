from django.contrib import admin

from .models import Consent


@admin.register(Consent)
class ConsentAdmin(admin.ModelAdmin):
    list_display = (
        "application",
        "consent_type",
        "accepted",
        "accepted_at",
        "consent_text_version",
    )
    list_filter = ("consent_type", "accepted")
    search_fields = ("application__public_reference",)
    readonly_fields = (
        "application",
        "consent_type",
        "accepted",
        "accepted_at",
        "consent_text_version",
        "privacy_policy_version",
        "terms_version",
        "ip_hash",
        "user_agent_hash",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
