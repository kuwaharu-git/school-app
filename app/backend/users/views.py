from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.db.models import F, Value, Sum
from django.db.models.functions import Coalesce
from .models import User, RequestUser
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from users.exception import BusinessException
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from users.serializers import (
    CustomTokenObtainPairSerializer,
    RequestUserSerializer,
)


class TestView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({"username": user.username})


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


class RetryView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def post(self, request):
        refresh = request.COOKIES.get("refresh")
        if not refresh:
            return Response(
                {"errMsg": "リフレッシュトークンが存在しません"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data.get("access", None)
        new_refresh = serializer.validated_data.get("refresh", None)

        if access:
            response = Response(status=status.HTTP_200_OK)
            max_age = settings.COOKIE_TIME
            response.set_cookie(
                "access", access, httponly=True, max_age=max_age
            )
            if new_refresh:
                response.set_cookie(
                    "refresh", new_refresh, httponly=True, max_age=max_age
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
        current_password = request.data.get("current-password")
        password = request.data.get("new-password")
        if not current_password:
            raise BusinessException("現在のパスワードが未入力です")
        if not user.check_password(current_password):
            raise BusinessException("現在のパスワードが正しくありません")
        if not password:
            raise BusinessException("パスワードが未入力です")
        if current_password == password:
            raise BusinessException(
                "新しいパスワードが現在のパスワードと同じです"
            )
        user.set_password(password)
        user.is_initial_password = False
        user.save()
        return Response(status=status.HTTP_200_OK)


class RequestUserView(APIView):
    """
    ユーザー登録のリクエスト処理
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def post(self, request):
        serializer = RequestUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student_id = serializer.validated_data.get("student_id")
        username = serializer.validated_data.get("username")
        agreed_to_terms = serializer.validated_data.get("agreed_to_terms")
        if not student_id or not username:
            raise BusinessException("student_idまたはusernameが未入力です")
        if RequestUser.objects.filter(student_id=student_id).exists():
            raise BusinessException("すでにリクエスト済みです")
        if User.objects.filter(student_id=student_id).exists():
            raise BusinessException("すでにユーザーが存在します")
        if RequestUser.objects.filter(username=username).exists():
            raise BusinessException("すでに使われているユーザー名です")
        if User.objects.filter(username=username).exists():
            raise BusinessException("すでに使われているユーザー名です")
        request_user = RequestUser.objects.create(
            student_id=student_id,
            username=username,
            is_created=False,
            agreed_to_terms=agreed_to_terms,
        )
        request_user.save()
        return Response(status=status.HTTP_201_CREATED)
