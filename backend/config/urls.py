"""Root URL configuration."""
from django.contrib import admin
from django.urls import include, path

from apps.core.views import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health"),
    # Phase 2 public API (VY- ids, EUR, step-saving).
    path("api/", include("apps.applications.phase2_urls")),
    # Phase 1 API (retained; UUID ids).
    path("api/v1/", include("config.api_urls")),
]
