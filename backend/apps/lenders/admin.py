from django.contrib import admin

from .models import EligibilityRule, Lender, LenderProduct


class EligibilityRuleInline(admin.TabularInline):
    model = EligibilityRule
    extra = 0
    fields = ("field", "operator", "value", "show_reason_to_customer", "active")


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


@admin.register(Lender)
class LenderAdmin(admin.ModelAdmin):
    list_display = ("name", "product_count", "active", "display_order", "priority")
    list_editable = ("active", "display_order")
    list_filter = ("active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [LenderProductInline]

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

    @admin.display(description="Amount range")
    def amount_range(self, obj):
        return f"{obj.min_amount}–{obj.max_amount} {obj.currency}"

    @admin.display(description="Term range")
    def term_range(self, obj):
        return f"{obj.min_term_months}–{obj.max_term_months} mo"


@admin.register(EligibilityRule)
class EligibilityRuleAdmin(admin.ModelAdmin):
    list_display = ("product", "field", "operator", "value", "active")
    list_filter = ("field", "operator", "active")
    search_fields = ("product__name",)
