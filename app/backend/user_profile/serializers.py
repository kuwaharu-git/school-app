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
    """
    言語情報のシリアライザ
    渡されたidとlanguage_nameの組み合わせが正しいかを検証する
    もしidまたはlanguage_nameが指定されていない場合は、nullを返す(許容する)
    """

    id = serializers.IntegerField(required=False, allow_null=True)
    language_name = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Languages
        fields = ["id", "language_name"]

    def validate(self, attrs):
        id = attrs.get("id")
        language_name = attrs.get("language_name")

        # 両方がnullの場合は許容
        if id is None and language_name is None:
            return attrs

        # 両方が指定されている場合に検証
        if id is not None and language_name is not None:
            try:
                language = Languages.objects.get(id=id)
                if language.language_name != language_name:
                    raise serializers.ValidationError(
                        "idとlanguage_nameの組み合わせが正しくありません。"
                    )
            except Languages.DoesNotExist:
                raise serializers.ValidationError(
                    "指定されたidの言語が存在しません。"
                )

        return attrs


class UserLanguagesSerializer(serializers.ModelSerializer):
    language = LanguagesSerializer(allow_null=True)  # nullを許容

    def validate(self, attrs):
        language = attrs.get("language")
        other_language_name = attrs.get("other_language_name")
        if other_language_name != "" and language is not None:
            if (
                language.get("id") is not None
                or language.get("language_name") is not None
            ):
                raise serializers.ValidationError(
                    "other_language_nameが指定されている場合、languageはnullでなければなりません。"
                )
        return attrs

    class Meta:
        model = UserLanguages
        fields = ["language", "other_language_name"]


class FrameworksSerializer(serializers.ModelSerializer):
    """
    フレームワーク情報のシリアライザ
    渡されたidとframework_nameの組み合わせが正しいかを検証する
    もしidまたはframework_nameが指定されていない場合は、nullを返す(許容する)
    """

    id = serializers.IntegerField(required=False, allow_null=True)
    framework_name = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Frameworks
        fields = ["id", "framework_name"]

    def validate(self, attrs):
        id = attrs.get("id")
        framework_name = attrs.get("framework_name")

        # 両方がnullの場合は許容
        if id is None and framework_name is None:
            return attrs

        # 両方が指定されている場合に検証
        if id is not None and framework_name is not None:
            try:
                framework = Frameworks.objects.get(id=id)
                if framework.framework_name != framework_name:
                    raise serializers.ValidationError(
                        "idとframework_nameの組み合わせが正しくありません。"
                    )
            except Frameworks.DoesNotExist:
                raise serializers.ValidationError(
                    "指定されたidのフレームワークが存在しません。"
                )

        return attrs


class UserFrameworksSerializer(serializers.ModelSerializer):
    framework = FrameworksSerializer(allow_null=True)  # nullを許容

    def validate(self, attrs):
        framework = attrs.get("framework")
        other_framework_name = attrs.get("other_framework_name")
        if other_framework_name != "" and framework is not None:
            if (
                framework.get("id") is not None
                or framework.get("framework_name") is not None
            ):
                raise serializers.ValidationError(
                    "other_framework_nameが指定されている場合、frameworkはnullでなければなりません。"
                )
        return attrs

    class Meta:
        model = UserFrameworks
        fields = ["framework", "other_framework_name"]


class SocialMediasSerializer(serializers.ModelSerializer):
    """
    ソーシャルメディア情報のシリアライザ
    渡されたidとsocial_media_nameの組み合わせが正しいかを検証する
    もしidまたはsocial_media_nameが指定されていない場合は、nullを返す(許容する)
    """

    id = serializers.IntegerField(required=False, allow_null=True)
    social_media_name = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = SocialMedias
        fields = ["id", "social_media_name"]

    def validate(self, attrs):
        id = attrs.get("id")
        social_media_name = attrs.get("social_media_name")

        # 両方がnullの場合は許容
        if id is None and social_media_name is None:
            return attrs

        # 両方が指定されている場合に検証
        if id is not None and social_media_name is not None:
            try:
                social_media = SocialMedias.objects.get(id=id)
                if social_media.social_media_name != social_media_name:
                    raise serializers.ValidationError(
                        "idとsocial_media_nameの組み合わせが正しくありません。"
                    )
            except SocialMedias.DoesNotExist:
                raise serializers.ValidationError(
                    "指定されたidのソーシャルメディアが存在しません。"
                )

        return attrs


class UserSocialMediasSerializer(serializers.ModelSerializer):
    social_media = SocialMediasSerializer(allow_null=True)  # nullを許容

    def validate(self, attrs):
        social_media = attrs.get("social_media")
        other_social_media_name = attrs.get("other_social_media_name")
        if other_social_media_name != "" and social_media is not None:
            if (
                social_media.get("id") is not None
                or social_media.get("social_media_name") is not None
            ):
                raise serializers.ValidationError(
                    "other_social_media_nameが指定されている場合、social_mediaはnullでなければなりません。"
                )
        return attrs

    class Meta:
        model = UserSocialMedias
        fields = ["social_media", "other_social_media_name", "url"]


class AllProfilesSerializer(serializers.Serializer):
    user_info = UserInfoSerializer()
    profile = ProfilesSerializer()
    user_languages = UserLanguagesSerializer(many=True)
    user_frameworks = UserFrameworksSerializer(many=True)
    user_social_medias = UserSocialMediasSerializer(many=True)
