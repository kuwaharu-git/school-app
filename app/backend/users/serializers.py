from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import RequestUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "student_id"


class RequestUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestUser
        fields = (
            "student_id",
            "username",
            "agreed_to_terms",
        )
