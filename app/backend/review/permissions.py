from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication


class IsAuthorOrReadOnly(permissions.BasePermission):
    """オブジェクトの編集を著者のみに許可するオブジェクトレベルのパーミッション。"""

    def has_permission(self, request, view):
        # 任意のユーザーにリスト/取得（読み取り専用）を許可し、書き込みは認証済みユーザーのみ許可
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # 認証していないユーザでもリストと取得は可能にする(publicがFalseのプロジェクトは除く)
        if request.method in permissions.SAFE_METHODS:
            return obj.is_public
        return obj.author == request.user


class IsReviewerOrReadOnly(permissions.BasePermission):
    """レビュアーが自分のレビューを編集でき、他のユーザーは読み取り専用とするパーミッション。"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # 元のプロジェクトのpublicがTrueなら誰でも読み取り可能
        if request.method in permissions.SAFE_METHODS:
            return obj.project.is_public
        # obj is Review instance
        return obj.reviewer == request.user
