from rest_framework import serializers

from .models import Lead, LeadEvent


class LeadEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadEvent
        fields = ["id", "event_type", "timestamp", "external_event_id", "metadata"]


class LeadSerializer(serializers.ModelSerializer):
    lender_name = serializers.CharField(source="lender.name", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    application_reference = serializers.CharField(
        source="application.public_reference", read_only=True
    )
    events = LeadEventSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "application",
            "application_reference",
            "lender",
            "lender_name",
            "product",
            "product_name",
            "status",
            "external_lead_id",
            "external_application_id",
            "tracking_id",
            "click_id",
            "affiliate_id",
            "created_at",
            "sent_at",
            "updated_at",
            "events",
        ]


class RouteRequestSerializer(serializers.Serializer):
    """Public click-through: route an application to a chosen product."""

    product_id = serializers.UUIDField()
