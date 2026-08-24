"""Request middleware: attach a request ID for observability."""
import uuid

from .request_context import set_request_id


class RequestIDMiddleware:
    """Assign/propagate an X-Request-ID header and expose it to logging."""

    header = "HTTP_X_REQUEST_ID"
    response_header = "X-Request-ID"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.META.get(self.header) or uuid.uuid4().hex
        request.request_id = request_id
        set_request_id(request_id)
        try:
            response = self.get_response(request)
        finally:
            set_request_id(None)
        response[self.response_header] = request_id
        return response
