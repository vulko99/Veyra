"""Core views: health check."""
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Liveness/readiness probe. Returns 200 when the DB is reachable."""
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:  # pragma: no cover - only on real DB outage
        db_ok = False

    status_str = "ok" if db_ok else "degraded"
    return Response({"status": status_str}, status=200 if db_ok else 503)
