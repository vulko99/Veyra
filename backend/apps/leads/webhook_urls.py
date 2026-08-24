from django.urls import path

from .webhook_views import WebhookView

urlpatterns = [
    path("<slug:lender_slug>/", WebhookView.as_view(), name="lender-webhook"),
]
