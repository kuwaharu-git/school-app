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
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)


class TestView(APIView):
    def get(self, request):
        return Response({"message": "Hello, world!"})
