"""Phase 3 public partner API (mounted at /api/).

Read-only aliases over the existing Lender/LenderProduct domain, exposing the
partner vocabulary requested in the Phase 3 spec without duplicating the Phase 1
admin API under /api/v1/. Only ACTIVE partners and active products are visible.

    GET /api/partners/
    GET /api/partners/{public_id}/         (public_id == the Lender UUID)
    GET /api/partner-products/             (?partner=<uuid>)
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.routers import DefaultRouter

from .models import Lender, LenderProduct
from .serializers import LenderProductPublicSerializer, LenderPublicSerializer


class PartnerViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only list/detail of active partners and their products."""

    permission_classes = [AllowAny]
    serializer_class = LenderPublicSerializer
    lookup_field = "id"
    lookup_url_kwarg = "public_id"

    def get_queryset(self):
        return (
            Lender.objects.filter(active=True)
            .prefetch_related("products")
            .order_by("display_order", "-priority", "name")
        )


class PartnerProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only list/detail of active products of active partners."""

    permission_classes = [AllowAny]
    serializer_class = LenderProductPublicSerializer
    lookup_field = "id"
    lookup_url_kwarg = "public_id"

    def get_queryset(self):
        qs = (
            LenderProduct.objects.filter(active=True, lender__active=True)
            .select_related("lender")
            .order_by("-priority", "lender__display_order")
        )
        partner = self.request.query_params.get("partner")
        if partner:
            qs = qs.filter(lender__id=partner)
        return qs


router = DefaultRouter()
router.register("partners", PartnerViewSet, basename="partner")
router.register("partner-products", PartnerProductViewSet, basename="partner-product")

urlpatterns = router.urls
