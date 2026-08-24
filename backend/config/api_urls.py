"""Versioned API routing (/api/v1/)."""
from django.urls import include, path

urlpatterns = [
    path("", include("apps.applications.urls")),
    path("", include("apps.matching.urls")),
    path("", include("apps.leads.urls")),
    path("", include("apps.lenders.urls")),
    path("", include("apps.analytics.urls")),
    path("webhooks/", include("apps.leads.webhook_urls")),
]
