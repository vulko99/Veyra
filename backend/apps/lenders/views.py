"""Lenders API.

Public read:
    GET /api/v1/lenders/         list active lenders + active products
    GET /api/v1/lenders/{id}/

Admin-only writes:
    POST/PATCH /api/v1/lenders/
    POST/PATCH /api/v1/lender-products/
    POST/PATCH /api/v1/eligibility-rules/
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.core.permissions import IsAdminUser

from .models import EligibilityRule, Lender, LenderProduct
from .serializers import (
    EligibilityRuleAdminSerializer,
    LenderAdminSerializer,
    LenderProductAdminSerializer,
    LenderPublicSerializer,
)


class LenderViewSet(viewsets.ModelViewSet):
    queryset = Lender.objects.all().prefetch_related("products")
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ("list", "retrieve") and not (
            self.request.user and self.request.user.is_staff
        ):
            return qs.filter(active=True)
        return qs

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return LenderPublicSerializer
        return LenderAdminSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        record_audit(
            action=AuditAction.LENDER_UPDATED,
            entity_type="Lender",
            entity_id=instance.id,
            actor=self.request.user,
            metadata={"name": instance.name},
        )


class LenderProductViewSet(viewsets.ModelViewSet):
    queryset = LenderProduct.objects.select_related("lender").all()
    serializer_class = LenderProductAdminSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"

    def perform_create(self, serializer):
        instance = serializer.save()
        record_audit(
            action=AuditAction.PRODUCT_UPDATED,
            entity_type="LenderProduct",
            entity_id=instance.id,
            actor=self.request.user,
            metadata={"name": instance.name, "created": True},
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        record_audit(
            action=AuditAction.PRODUCT_UPDATED,
            entity_type="LenderProduct",
            entity_id=instance.id,
            actor=self.request.user,
            metadata={"name": instance.name},
        )


class EligibilityRuleViewSet(viewsets.ModelViewSet):
    queryset = EligibilityRule.objects.select_related("product").all()
    serializer_class = EligibilityRuleAdminSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"

    def _audit(self, instance):
        record_audit(
            action=AuditAction.RULE_UPDATED,
            entity_type="EligibilityRule",
            entity_id=instance.id,
            actor=self.request.user,
            metadata={
                "product_id": str(instance.product_id),
                "field": instance.field,
                "operator": instance.operator,
            },
        )

    def perform_create(self, serializer):
        self._audit(serializer.save())

    def perform_update(self, serializer):
        self._audit(serializer.save())
