from rest_framework import serializers
from .models import (
    Profiles,
    UserLanguages,
    UserFrameworks,
    UserSocialMedias,
    Languages,
    Frameworks,
    SocialMedias,
)
from users.models import User


class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["student_id", "username"]


class ProfilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profiles
        fields = ["self_introduction", "portfolio_url", "github_url"]


class LanguagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Languages
        fields = ["id", "language_name"]


class UserLanguagesSerializer(serializers.ModelSerializer):
    language = LanguagesSerializer()

    class Meta:
        model = UserLanguages
        fields = ["language", "other_language_name"]


class FrameworksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Frameworks
        fields = ["id", "framework_name"]


class UserFrameworksSerializer(serializers.ModelSerializer):
    framework = FrameworksSerializer()

    class Meta:
        model = UserFrameworks
        fields = ["framework", "other_framework_name"]


class SocialMediasSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMedias
        fields = ["id", "social_media_name"]


class UserSocialMediasSerializer(serializers.ModelSerializer):
    social_media = SocialMediasSerializer()

    class Meta:
        model = UserSocialMedias
        fields = ["social_media", "other_social_media_name", "url"]


class AllProfilesSerializer(serializers.Serializer):
    user_info = UserInfoSerializer()
    profiles = ProfilesSerializer()
    user_languages = UserLanguagesSerializer(many=True)
    user_frameworks = UserFrameworksSerializer(many=True)
    user_social_medias = UserSocialMediasSerializer(many=True)
