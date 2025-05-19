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
        # viewsで重複チェックを行うため、unique=Trueは指定しない
        # ただし、DBの制約としてはunique=Trueを指定する
        # そのため、views.pyで重複チェックを行う
        extra_kwargs = {
            "student_id": {"required": True, "validators": []},
            "username": {"required": True, "validators": []},
            "agreed_to_terms": {"required": True},
        }
