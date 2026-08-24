"""Application funnel API.

Public (no account required):
    POST /api/v1/applications/
    GET  /api/v1/applications/{id}/
    POST /api/v1/applications/{id}/submit/

Applications are looked up by their UUID id, which is unguessable. Sequential
database IDs are never exposed.
"""
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.viewsets import GenericViewSet

from apps.audit.models import AuditAction
from apps.audit.services import record_audit
from apps.consents.services import record_consent
from apps.core.security import client_ip, hash_value

from .models import Application, ApplicationStatus
from .serializers import (
    ApplicationCreateSerializer,
    ApplicationReadSerializer,
)
from .services import submit_application


class ApplicationViewSet(
    CreateModelMixin, RetrieveModelMixin, GenericViewSet
):
    queryset = Application.objects.all().prefetch_related("consents")
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        return ApplicationReadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consents = serializer.validated_data.pop("consents", [])

        ip_hash = hash_value(client_ip(request))
        ua_hash = hash_value(request.META.get("HTTP_USER_AGENT", ""))

        application = Application.objects.create(
            status=ApplicationStatus.STARTED,
            ip_hash=ip_hash,
            user_agent_hash=ua_hash,
            **serializer.validated_data,
        )

        for c in consents:
            record_consent(
                application=application,
                consent_type=c["consent_type"],
                accepted=c["accepted"],
                consent_text_version=c.get("consent_text_version", "1"),
                ip_hash=ip_hash,
                user_agent_hash=ua_hash,
            )

        record_audit(
            action=AuditAction.APPLICATION_CREATED,
            entity_type="Application",
            entity_id=application.id,
            ip_hash=ip_hash,
            metadata={"reference": application.public_reference},
        )

        read = ApplicationReadSerializer(application)
        return Response(read.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], throttle_classes=[ScopedRateThrottle])
    def submit(self, request, id=None):
        self.throttle_scope = "application_submit"
        application = self.get_object()
        ip_hash = hash_value(client_ip(request))

        # Allow accepting consents as part of the submit call.
        for c in request.data.get("consents", []) or []:
            record_consent(
                application=application,
                consent_type=c["consent_type"],
                accepted=c.get("accepted", False),
                consent_text_version=c.get("consent_text_version", "1"),
                ip_hash=ip_hash,
                user_agent_hash=hash_value(request.META.get("HTTP_USER_AGENT", "")),
            )

        submit_application(application, ip_hash=ip_hash)
        return Response(ApplicationReadSerializer(application).data)
