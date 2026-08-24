from django.urls import path

from .views import KPIView

urlpatterns = [
    path("analytics/kpis/", KPIView.as_view(), name="analytics-kpis"),
]
