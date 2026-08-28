"""Phase 2 public API — application funnel keyed by the VY- public id.

Routes (no authentication; applicants never log in):
    POST   /api/applications/
    GET    /api/applications/{public_id}/
    PATCH  /api/applications/{public_id}/
    POST   /api/applications/{public_id}/consent/
    POST   /api/applications/{public_id}/match/
    GET    /api/applications/{public_id}/matches/
    POST   /api/applications/{public_id}/select-partner/
"""
from __future__ import annotations

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.consents.models import ConsentType
from apps.consents.services import record_consent
from apps.core.exceptions import VeyraAPIError
from apps.core.security import client_ip, hash_value
from apps.leads.referrals import create_referral, referral_outbound_url
from apps.matching.models import Match
from apps.matching.phase2 import _serialize, match_application_v2

from .events import record_event
from .models import (
    Applicant,
    Application,
    ApplicationEventType,
    ApplicationStatus,
)
from .phase2_serializers import (
    ApplicationReadSerializer,
    ApplicationWriteSerializer,
    ConsentInputSerializer,
    SelectPartnerSerializer,
)

_APPLICANT_FIELDS = {
    "first_name",
    "last_name",
    "email",
    "phone",
    "monthly_income_eur",
    "employment_status",
    "existing_monthly_obligations_eur",
}
_APP_DIRECT = {
    "current_step",
    "source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "referrer",
    "landing_page",
}


def _get_application(public_id: str) -> Application:
    return get_object_or_404(Application, public_id=public_id)


def _apply_write(application: Application, data: dict) -> None:
    """Apply validated write data onto the application + its applicant."""
    update_fields: set[str] = set()

    if "desired_amount_eur" in data and data["desired_amount_eur"] is not None:
        application.requested_amount = data["desired_amount_eur"]
        update_fields.add("requested_amount")
    if "desired_term_months" in data and data["desired_term_months"] is not None:
        application.requested_term_months = data["desired_term_months"]
        update_fields.add("requested_term_months")
    for field in _APP_DIRECT:
        if field in data:
            setattr(application, field, data[field])
            update_fields.add(field)

    # Applicant fields → create the Applicant lazily on first contact/financial data.
    applicant_data = {k: data[k] for k in _APPLICANT_FIELDS if k in data}
    if applicant_data:
        applicant = application.applicant or Applicant()
        for k, v in applicant_data.items():
            setattr(applicant, k, v)
        applicant.save()
        if application.applicant_id != applicant.id:
            application.applicant = applicant
            update_fields.add("applicant")

    if application.status == ApplicationStatus.STARTED and update_fields:
        application.status = ApplicationStatus.IN_PROGRESS
        update_fields.add("status")

    if update_fields:
        update_fields.add("updated_at")
        application.save(update_fields=list(update_fields))


class ApplicationCreateView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "application_submit"

    def post(self, request):
        serializer = ApplicationWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = Application.objects.create(
            status=ApplicationStatus.STARTED,
            ip_hash=hash_value(client_ip(request)),
            user_agent_hash=hash_value(request.META.get("HTTP_USER_AGENT", "")),
        )
        record_event(application, ApplicationEventType.APPLICATION_STARTED)
        _apply_write(application, serializer.validated_data)
        return Response(ApplicationReadSerializer(application).data, status=201)


class ApplicationDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, public_id=None):
        application = _get_application(public_id)
        return Response(ApplicationReadSerializer(application).data)

    def patch(self, request, public_id=None):
        application = _get_application(public_id)
        serializer = ApplicationWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        _apply_write(application, serializer.validated_data)
        step = serializer.validated_data.get("current_step")
        record_event(
            application,
            ApplicationEventType.STEP_COMPLETED,
            {"step": step} if step else {},
        )
        return Response(ApplicationReadSerializer(application).data)


class ConsentView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "application_submit"

    _MAP = {
        "privacy_processing_consent": ConsentType.PLATFORM_PROCESSING,
        "partner_data_sharing_consent": ConsentType.PARTNER_DATA_TRANSFER,
        "marketing_consent": ConsentType.MARKETING,
    }

    def post(self, request, public_id=None):
        application = _get_application(public_id)
        serializer = ConsentInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_hash = hash_value(client_ip(request))
        ua_hash = hash_value(request.META.get("HTTP_USER_AGENT", ""))
        version = settings.PRIVACY_POLICY_VERSION

        for field, consent_type in self._MAP.items():
            record_consent(
                application=application,
                consent_type=consent_type,
                accepted=serializer.validated_data[field],
                consent_text_version=version,
                ip_hash=ip_hash,
                user_agent_hash=ua_hash,
            )
        record_event(
            application,
            ApplicationEventType.CONSENT_GRANTED,
            {
                "privacy": serializer.validated_data["privacy_processing_consent"],
                "partner_sharing": serializer.validated_data["partner_data_sharing_consent"],
                "marketing": serializer.validated_data["marketing_consent"],
            },
        )
        return Response(ApplicationReadSerializer(application).data)


class MatchRunView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "application_submit"

    def post(self, request, public_id=None):
        application = _get_application(public_id)
        # Mark the funnel complete on first match run.
        if application.completed_at is None:
            application.completed_at = timezone.now()
            if application.status == ApplicationStatus.IN_PROGRESS:
                application.status = ApplicationStatus.COMPLETED
            application.save(update_fields=["completed_at", "status", "updated_at"])
            record_event(application, ApplicationEventType.APPLICATION_COMPLETED)

        matches = match_application_v2(application)
        return Response({"application_id": application.public_id, "matches": matches})


class MatchesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, public_id=None):
        application = _get_application(public_id)
        record_event(application, ApplicationEventType.PARTNER_VIEWED)
        matches = (
            Match.objects.filter(
                application=application, eligible=True, rank__isnull=False
            )
            .select_related("lender", "product")
            .order_by("rank")
        )
        results = [
            _serialize(m.product, m.reasons, m.rank, m.score) for m in matches
        ]
        return Response(
            {"application_id": application.public_id, "matches": results}
        )


class SelectPartnerView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "application_submit"

    def post(self, request, public_id=None):
        application = _get_application(public_id)
        serializer = SelectPartnerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # The product must be one this application actually matched (eligible).
        product_id = serializer.validated_data["product_id"]
        match = (
            Match.objects.filter(
                application=application, product_id=product_id, eligible=True
            )
            .select_related("product__lender")
            .first()
        )
        if match is None:
            raise VeyraAPIError(
                code="INVALID_PARTNER_SELECTION",
                message="Selected product is not an eligible match for this application.",
                http_status=400,
            )

        lead = create_referral(application, match.product)
        return Response(
            {
                "referral_id": str(lead.id),
                "partner": match.product.lender.name,
                "product": match.product.name,
                "referral_status": lead.referral_status,
                "outbound_url": referral_outbound_url(lead),
            }
        )
