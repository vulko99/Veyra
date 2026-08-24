from rest_framework import serializers

from .models import Match


class MatchSerializer(serializers.ModelSerializer):
    lender_id = serializers.UUIDField(source="lender.id", read_only=True)
    product_id = serializers.UUIDField(source="product.id", read_only=True)
    lender_name = serializers.CharField(source="lender.name", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_type = serializers.CharField(source="product.product_type", read_only=True)
    min_amount = serializers.DecimalField(
        source="product.min_amount", max_digits=12, decimal_places=2, read_only=True
    )
    max_amount = serializers.DecimalField(
        source="product.max_amount", max_digits=12, decimal_places=2, read_only=True
    )
    min_term_months = serializers.IntegerField(
        source="product.min_term_months", read_only=True
    )
    max_term_months = serializers.IntegerField(
        source="product.max_term_months", read_only=True
    )
    currency = serializers.CharField(source="product.currency", read_only=True)
    reasons = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            "lender_id",
            "product_id",
            "lender_name",
            "product_name",
            "product_type",
            "min_amount",
            "max_amount",
            "min_term_months",
            "max_term_months",
            "currency",
            "eligible",
            "score",
            "rank",
            "reasons",
        ]

    def get_reasons(self, obj: Match) -> list[str]:
        # Only reasons cleared for customer display are exposed via the API.
        return obj.customer_reasons
