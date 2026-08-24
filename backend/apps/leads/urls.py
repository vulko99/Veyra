from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ApplicationRouteView, LeadViewSet

router = DefaultRouter()
router.register("leads", LeadViewSet, basename="lead")

urlpatterns = [
    path(
        "applications/<uuid:id>/route/",
        ApplicationRouteView.as_view(),
        name="application-route",
    ),
] + router.urls
