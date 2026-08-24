"""Consistent API error envelope.

All API errors are shaped as:

    {"error": {"code": "...", "message": "...", "details": {...}}}
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


class VeyraAPIError(Exception):
    """Raise inside a view/service to return a structured error response."""

    def __init__(self, code: str, message: str, details=None, http_status=400):
        self.code = code
        self.message = message
        self.details = details or {}
        self.http_status = http_status
        super().__init__(message)


def _envelope(code: str, message: str, details) -> dict:
    return {"error": {"code": code, "message": message, "details": details or {}}}


def veyra_exception_handler(exc, context):
    if isinstance(exc, VeyraAPIError):
        return Response(
            _envelope(exc.code, exc.message, exc.details),
            status=exc.http_status,
        )

    response = drf_exception_handler(exc, context)
    if response is None:
        # Unhandled exception: never leak a stack trace to clients.
        return Response(
            _envelope("INTERNAL_ERROR", "An unexpected error occurred.", {}),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Map DRF's default error payloads into our envelope.
    code = "ERROR"
    if response.status_code == status.HTTP_400_BAD_REQUEST:
        code = "VALIDATION_ERROR"
    elif response.status_code in (status.HTTP_401_UNAUTHORIZED,):
        code = "NOT_AUTHENTICATED"
    elif response.status_code == status.HTTP_403_FORBIDDEN:
        code = "PERMISSION_DENIED"
    elif response.status_code == status.HTTP_404_NOT_FOUND:
        code = "NOT_FOUND"
    elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        code = "RATE_LIMITED"

    detail = response.data
    message = "Request could not be processed."
    if isinstance(detail, dict) and "detail" in detail and len(detail) == 1:
        message = str(detail["detail"])
        details: dict = {}
    else:
        details = detail if isinstance(detail, dict) else {"detail": detail}
        if code == "VALIDATION_ERROR":
            message = "Invalid data."

    response.data = _envelope(code, message, details)
    return response
