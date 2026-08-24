"""Shared DRF permissions."""
from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminUser(BasePermission):
    """Allow only active staff users (admin dashboard / management APIs)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff and request.user.is_active)


class IsAdminOrReadOnlyPublic(BasePermission):
    """Public read for safe methods; writes require staff."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)
