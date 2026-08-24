"""Leads API.

Admin:
    GET  /api/v1/leads/
    GET  /api/v1/leads/{id}/
    POST /api/v1/leads/{id}/route/     (re)send a lead, get outbound URL

Public:
    POST /api/v1/applications/{id}/route/   create+route a lead, get outbound URL
"""
from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.applications.models import Application
from apps.core.permissions import IsAdminUser
from apps.lenders.models import LenderProduct

from .models import Lead, LeadEventType
from .serializers import LeadSerializer, RouteRequestSerializer
from .services import outbound_url, record_lead_event, route_lead


class LeadViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = (
        Lead.objects.select_related("application", "lender", "product")
        .prefetch_related("events")
        .all()
    )
    serializer_class = LeadSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"
    filterset_fields = ["status", "lender", "product"]

    @action(detail=True, methods=["post"])
    def route(self, request, id=None):
        """Admin action: (re)route/send an existing lead."""
        lead = self.get_object()
        return Response(
            {"lead_id": str(lead.id), "outbound_url": outbound_url(lead)}
        )


class ApplicationRouteView(APIView):
    """Public click-through from the results page to a partner."""

    permission_classes = [AllowAny]

    def post(self, request, id=None):
        application = get_object_or_404(Application, id=id)
        serializer = RouteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(
            LenderProduct, id=serializer.validated_data["product_id"], active=True
        )

        lead = route_lead(application, product)
        # Record the outbound click as an immutable event.
        record_lead_event(lead, LeadEventType.CLICK)

        return Response(
            {
                "lead_id": str(lead.id),
                "tracking_id": lead.tracking_id,
                "outbound_url": outbound_url(lead),
            }
        )
