"""Structured, PII-safe logging.

Emits JSON log lines with a per-request request_id. Sensitive values must be
masked/hashed *before* they reach the logger; this formatter does not attempt
to scrub arbitrary message content.
"""
import datetime as dt
import json
import logging

from .request_context import get_request_id


class RequestIDFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id() or "-"
        return True


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": dt.datetime.now(dt.UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }
        # Attach structured extras when provided.
        if hasattr(record, "event"):
            payload["event"] = record.event
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)
