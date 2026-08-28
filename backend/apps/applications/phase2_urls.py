"""Phase 2 API routes (mounted at /api/)."""
from django.urls import path

from .phase2_views import (
    ApplicationCreateView,
    ApplicationDetailView,
    ConsentView,
    MatchesView,
    MatchRunView,
    SelectPartnerView,
)

urlpatterns = [
    path("applications/", ApplicationCreateView.as_view(), name="p2-application-create"),
    path(
        "applications/<str:public_id>/",
        ApplicationDetailView.as_view(),
        name="p2-application-detail",
    ),
    path(
        "applications/<str:public_id>/consent/",
        ConsentView.as_view(),
        name="p2-application-consent",
    ),
    path(
        "applications/<str:public_id>/match/",
        MatchRunView.as_view(),
        name="p2-application-match",
    ),
    path(
        "applications/<str:public_id>/matches/",
        MatchesView.as_view(),
        name="p2-application-matches",
    ),
    path(
        "applications/<str:public_id>/select-partner/",
        SelectPartnerView.as_view(),
        name="p2-application-select-partner",
    ),
    # Phase 3 spec alias for the same explicit-selection action (creates a
    # referral only on explicit user action — no duplicate logic).
    path(
        "applications/<str:public_id>/referrals/",
        SelectPartnerView.as_view(),
        name="p2-application-referrals",
    ),
]
