from rest_framework import serializers

from .models import EligibilityRule, Lender, LenderProduct


class LenderProductPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = LenderProduct
        fields = [
            "id",
            "name",
            "slug",
            "product_type",
            "min_amount",
            "max_amount",
            "currency",
            "min_term_months",
            "max_term_months",
            "min_income",
            "min_age",
            "max_age",
            "active",
        ]


class LenderPublicSerializer(serializers.ModelSerializer):
    # Consumer-facing name (display_name if set, else name). ``name`` is kept
    # for backward compatibility with existing clients.
    display_name = serializers.CharField(source="public_name", read_only=True)
    products = serializers.SerializerMethodField()

    class Meta:
        model = Lender
        fields = [
            "id",
            "name",
            "display_name",
            "slug",
            "description",
            "logo_url",
            "website_url",
            "application_url",
            "partner_type",
            "status",
            "active",
            "priority",
            "products",
        ]

    def get_products(self, obj):
        products = obj.products.filter(active=True)
        return LenderProductPublicSerializer(products, many=True).data


class LenderAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lender
        fields = [
            "id",
            "name",
            "legal_name",
            "display_name",
            "slug",
            "description",
            "logo_url",
            "website_url",
            "application_url",
            "partner_type",
            "status",
            "contact_name",
            "contact_email",
            "notes",
            "accepts_shared_leads",
            "minimum_match_score",
            "max_referrals_per_application",
            "requires_user_selection",
            "delivery_method",
            "delivery_email",
            "active",
            "priority",
            "display_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LenderProductAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = LenderProduct
        fields = [
            "id",
            "lender",
            "name",
            "slug",
            "product_type",
            "min_amount",
            "max_amount",
            "currency",
            "min_term_months",
            "max_term_months",
            "min_income",
            "min_age",
            "max_age",
            "application_url",
            "tracking_type",
            "tracking_url_template",
            "affiliate_id",
            "payout_model",
            "payout_value",
            "active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        min_amount = data.get("min_amount")
        max_amount = data.get("max_amount")
        if min_amount is not None and max_amount is not None and min_amount > max_amount:
            raise serializers.ValidationError("min_amount cannot exceed max_amount.")
        min_term = data.get("min_term_months")
        max_term = data.get("max_term_months")
        if min_term is not None and max_term is not None and min_term > max_term:
            raise serializers.ValidationError(
                "min_term_months cannot exceed max_term_months."
            )
        return data


class EligibilityRuleAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibilityRule
        fields = [
            "id",
            "product",
            "field",
            "operator",
            "value",
            "mandatory",
            "show_reason_to_customer",
            "reason_template",
            "active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
