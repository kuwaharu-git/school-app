from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.db.models import F, Value, Sum
from django.db.models.functions import Coalesce
from .models import User
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from users.exception import BusinessException
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from users.serializers import (
    CustomTokenObtainPairSerializer,
)


class TestView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Hello, world!"})


class LoginView(APIView):
    """
    ユーザーのログイン処理
    """

    # 認証クラスの指定
    authentication_classes = [JWTAuthentication]
    # アクセス許可の指定
    permission_classes = []

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data.get("access", None)
        refresh = serializer.validated_data.get("refresh", None)
        user = serializer.user
        is_initial_password = getattr(user, "is_initial_password", False)
        if access:
            response = Response(status=status.HTTP_200_OK)
            max_age = settings.COOKIE_TIME
            response.set_cookie(
                "access", access, httponly=True, max_age=max_age
            )
            response.set_cookie(
                "refresh", refresh, httponly=True, max_age=max_age
            )
            response.set_cookie(
                "is_initial_password",
                is_initial_password,
                httponly=True,
                max_age=max_age,
            )
            return response
        return Response(
            {"errMsg": "ユーザーの認証に失敗しました"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class RetryView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def post(self, request):
        request.data["refresh"] = request.COOKIES.get("refresh")
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data.get("access", None)
        refresh = serializer.validated_data.get("refresh", None)
        if access:
            response = Response(status=status.HTTP_200_OK)
            max_age = settings.COOKIE_TIME
            response.set_cookie(
                "access", access, httponly=True, max_age=max_age
            )
            response.set_cookie(
                "refresh", refresh, httponly=True, max_age=max_age
            )
            return response
        return Response(
            {"errMsg": "ユーザーの認証に失敗しました"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args):
        response = Response(status=status.HTTP_200_OK)
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        response.delete_cookie("is_initial_password")
        return response


class ChangePasswordView(APIView):
    """
    パスワード変更処理
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response(
                {"errMsg": "認証が必要です"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        password = request.data.get("password")
        if not password:
            raise BusinessException("パスワードが未入力です")
        user.set_password(password)
        user.is_initial_password = False
        user.save()
        return Response(status=status.HTTP_200_OK)
