from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Object-level permission to only allow authors to edit objects."""

    def has_permission(self, request, view):
        # Allow list/retrieve for any (read-only) or authenticated for write
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsReviewerOrReadOnly(permissions.BasePermission):
    """Permission that allows reviewers to edit their reviews, others read-only."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # obj is Review instance
        return obj.reviewer == request.user
