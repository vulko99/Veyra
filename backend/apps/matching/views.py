"""Matching API.

    POST /api/v1/applications/{id}/match/    run/refresh matching
    GET  /api/v1/applications/{id}/matches/  fetch top matches
"""
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.applications.models import Application, ApplicationStatus

from .engine import match_application
from .models import Match
from .serializers import MatchSerializer


class MatchRunView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, id=None):
        application = get_object_or_404(Application, id=id)
        result = match_application(application)

        # Advance status to MATCHED once matches exist.
        if result["matches"] and application.status in (
            ApplicationStatus.SUBMITTED,
            ApplicationStatus.QUALIFIED,
            ApplicationStatus.STARTED,
        ):
            application.status = ApplicationStatus.MATCHED
            application.save(update_fields=["status", "updated_at"])

        matches = (
            Match.objects.filter(application=application, rank__isnull=False)
            .select_related("lender", "product")
            .order_by("rank")
        )
        return Response(
            {
                "application_id": str(application.id),
                "matches": MatchSerializer(matches, many=True).data,
            }
        )


class MatchListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id=None):
        application = get_object_or_404(Application, id=id)
        matches = (
            Match.objects.filter(application=application, rank__isnull=False)
            .select_related("lender", "product")
            .order_by("rank")
        )
        return Response(
            {
                "application_id": str(application.id),
                "matches": MatchSerializer(matches, many=True).data,
            }
        )
