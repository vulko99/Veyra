from django.contrib import admin

from .models import EligibilityRule, Lender, LenderProduct


class EligibilityRuleInline(admin.TabularInline):
    model = EligibilityRule
    extra = 0
    fields = (
        "field",
        "operator",
        "value",
        "mandatory",
        "show_reason_to_customer",
        "active",
    )


class LenderProductInline(admin.TabularInline):
    model = LenderProduct
    extra = 0
    fields = (
        "name",
        "product_type",
        "min_amount",
        "max_amount",
        "min_term_months",
        "max_term_months",
        "payout_model",
        "active",
    )
    show_change_link = True


@admin.action(description="Activate selected partners")
def activate_partners(modeladmin, request, queryset):
    for lender in queryset:
        lender.status = "ACTIVE"
        lender.active = True
        lender.save()


@admin.action(description="Deactivate selected partners")
def deactivate_partners(modeladmin, request, queryset):
    for lender in queryset:
        lender.status = "INACTIVE"
        lender.save()


@admin.register(Lender)
class LenderAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "partner_type",
        "status",
        "product_count",
        "active",
        "display_order",
        "priority",
    )
    list_editable = ("status", "display_order")
    list_filter = ("status", "partner_type", "active")
    search_fields = ("name", "legal_name", "display_name", "slug", "contact_email")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [LenderProductInline]
    actions = [activate_partners, deactivate_partners]
    fieldsets = (
        (None, {"fields": ("name", "legal_name", "display_name", "slug")}),
        (
            "Classification",
            {"fields": ("partner_type", "status", "active", "priority", "display_order")},
        ),
        (
            "Presentation",
            {"fields": ("description", "logo", "logo_url", "website_url", "application_url")},
        ),
        ("Contact & notes", {"fields": ("contact_name", "contact_email", "notes")}),
    )

    @admin.display(description="Products")
    def product_count(self, obj):
        return obj.products.count()


@admin.register(LenderProduct)
class LenderProductAdmin(admin.ModelAdmin):
    list_display = (
        "lender",
        "name",
        "amount_range",
        "term_range",
        "payout_model",
        "active",
    )
    list_filter = ("active", "product_type", "payout_model", "lender")
    search_fields = ("name", "slug", "lender__name")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [EligibilityRuleInline]
    fieldsets = (
        (None, {"fields": ("lender", "name", "slug", "product_type", "active", "priority")}),
        (
            "Amount & term (EUR)",
            {
                "fields": (
                    "min_amount",
                    "max_amount",
                    "currency",
                    "min_term_months",
                    "max_term_months",
                )
            },
        ),
        ("Applicant criteria", {"fields": ("min_income", "min_age", "max_age")}),
        (
            "Routing & commercial",
            {
                "fields": (
                    "application_url",
                    "tracking_type",
                    "tracking_url_template",
                    "affiliate_id",
                    "payout_model",
                    "payout_value",
                )
            },
        ),
    )

    @admin.display(description="Amount range")
    def amount_range(self, obj):
        return f"{obj.min_amount}–{obj.max_amount} {obj.currency}"

    @admin.display(description="Term range")
    def term_range(self, obj):
        return f"{obj.min_term_months}–{obj.max_term_months} mo"


@admin.register(EligibilityRule)
class EligibilityRuleAdmin(admin.ModelAdmin):
    list_display = ("product", "field", "operator", "value", "mandatory", "active")
    list_filter = ("field", "operator", "mandatory", "active")
    search_fields = ("product__name",)
