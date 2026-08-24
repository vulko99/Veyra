"""Analytics API (admin-only)."""
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdminUser

from .services import compute_kpis


class KPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        filters = {
            "date_from": request.query_params.get("date_from"),
            "date_to": request.query_params.get("date_to"),
            "lender": request.query_params.get("lender"),
            "product": request.query_params.get("product"),
            "source": request.query_params.get("source"),
            "campaign": request.query_params.get("campaign"),
        }
        filters = {k: v for k, v in filters.items() if v}
        return Response(compute_kpis(filters=filters))
