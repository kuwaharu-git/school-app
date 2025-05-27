from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    UserInfoSerializer,
    ProfilesSerializer,
    UserLanguagesSerializer,
    UserFrameworksSerializer,
    UserSocialMediasSerializer,
    AllProfilesSerializer,
)
from .models import Profiles, UserLanguages, UserFrameworks, UserSocialMedias
from users.models import User
from django.db import transaction


# Create your views here.
class UserProfileView(APIView):
    """
    ユーザープロフィールの取得と更新
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id is None:
            user_id = request.user.id
        # ユーザープロフィールの取得
        user_info = User.objects.get(id=user_id)
        profile = Profiles.objects.get(user=user_info)
        user_languages = UserLanguages.objects.filter(user=user_info)
        user_frameworks = UserFrameworks.objects.filter(user=user_info)
        user_social_medias = UserSocialMedias.objects.filter(user=user_info)
        # シリアライザを使用してデータを整形
        user_info_data = UserInfoSerializer(user_info).data
        profile_data = ProfilesSerializer(profile).data
        user_languages_data = UserLanguagesSerializer(
            user_languages, many=True
        ).data
        user_frameworks_data = UserFrameworksSerializer(
            user_frameworks, many=True
        ).data
        user_social_medias_data = UserSocialMediasSerializer(
            user_social_medias, many=True
        ).data
        # AllProfilesSerializerを使用して全てのデータをまとめる
        all_profiles_serializer = AllProfilesSerializer(
            {
                "user_info": user_info_data,
                "profile": profile_data,
                "user_languages": user_languages_data,
                "user_frameworks": user_frameworks_data,
                "user_social_medias": user_social_medias_data,
            }
        )
        # レスポンスとして返す
        response_data = all_profiles_serializer.data
        return Response(response_data)

    def post(self, request):
        with transaction.atomic():
            # ユーザープロフィールの更新
            user = request.user
            request_data = request.data
            # profileの更新
            request_profile_data = request_data.get("profiles", {})
            # ProfilesSerializerを使用してリクエストデータを検証
            profile_serializer = ProfilesSerializer(data=request_profile_data)
            if not profile_serializer.is_valid():
                return Response(profile_serializer.errors, status=400)

            profile_data = profile_serializer.validated_data
            Profiles.objects.update_or_create(
                user=user,
                defaults=profile_data,
            )
            # user_languagesの更新(なくなったものを削除し、新しいものを追加)
            request_user_languages_data = request_data.get(
                "user_languages", []
            )
            # UserLanguagesSerializerを使用してリクエストデータを検証
            user_languages_serializer = UserLanguagesSerializer(
                data=request_user_languages_data, many=True
            )
            if not user_languages_serializer.is_valid():
                return Response(user_languages_serializer.errors, status=400)
            user_languages_data = user_languages_serializer.validated_data
            # 既存の言語を取得
            prev_user_languages = UserLanguages.objects.filter(user=user)
            # 既存の言語を削除(language_idで)
            for user_language in prev_user_languages:
                if user_language.language is not None:
                    if user_language.language.id not in [
                        lang.get("id")
                        for lang in user_languages_data
                        if lang.get("language") and lang["language"].get("id")
                    ]:
                        user_language.delete()
            # 既存の言語を削除(other_language_nameで)
            for user_language in prev_user_languages:
                if (
                    user_language.other_language_name
                    not in [
                        lang.get("other_language_name")
                        for lang in user_languages_data
                    ]
                    and user_language.language is None
                ):
                    user_language.delete()
            # 新しい言語を追加
            for lang_data in user_languages_data:
                language = lang_data.get("language")
                language_id = language.get("id") if language else None
                other_language_name = lang_data.get("other_language_name", "")
                # 言語IDとother_language_nameが両方ともあった場合リクエストエラー
                if language_id and other_language_name:
                    return Response(
                        {
                            "error": "language_idとother_language_nameの両方を同時に指定することはできません。"
                        },
                        status=400,
                    )
                # 言語IDがあったばあい、すでにあれば何もしない、なければ新規追加
                if language_id:
                    if not UserLanguages.objects.filter(
                        user=user, language_id=language_id
                    ).exists():
                        UserLanguages.objects.create(
                            user=user,
                            language_id=language_id,
                            other_language_name=other_language_name,
                        )
                # other_language_nameがあったばあい、すでにあれば何もしない、なければ新規追加
                elif other_language_name:
                    if not UserLanguages.objects.filter(
                        user=user, other_language_name=other_language_name
                    ).exists():
                        UserLanguages.objects.create(
                            user=user,
                            other_language_name=other_language_name,
                        )

            # user_frameworksの更新(同様に)
            request_user_frameworks_data = request_data.get(
                "user_frameworks", []
            )
            user_frameworks_serializer = UserFrameworksSerializer(
                data=request_user_frameworks_data, many=True
            )
            if not user_frameworks_serializer.is_valid():
                return Response(user_frameworks_serializer.errors, status=400)
            user_frameworks_data = user_frameworks_serializer.validated_data
            prev_user_frameworks = UserFrameworks.objects.filter(user=user)
            # 既存のフレームワークを削除(フレームワークIDで)
            for user_framework in prev_user_frameworks:
                if user_framework.framework is not None:
                    if user_framework.id not in [
                        fw.get("id") for fw in user_frameworks_data
                    ]:
                        user_framework.delete()
            # 既存のフレームワークを削除(other_framework_nameで)
            for user_framework in prev_user_frameworks:
                if (
                    user_framework.other_framework_name
                    not in [
                        fw.get("other_framework_name")
                        for fw in user_frameworks_data
                    ]
                    and user_framework.framework is None
                ):
                    user_framework.delete()
            # 新しいフレームワークを追加
            for fw_data in user_frameworks_data:
                framework = fw_data.get("framework")
                framework_id = framework.get("id") if framework else None
                other_framework_name = fw_data.get("other_framework_name", "")
                # フレームワークIDとother_framework_nameが両方ともあった場合リクエストエラー
                if framework_id and other_framework_name:
                    return Response(
                        {
                            "error": "framework_idとother_framework_nameの両方を同時に指定することはできません。"
                        },
                        status=400,
                    )
                # フレームワークIDがあったばあい、すでにあれば何もしない、なければ新規追加
                if framework_id:
                    if not UserFrameworks.objects.filter(
                        user=user, framework_id=framework_id
                    ).exists():
                        UserFrameworks.objects.create(
                            user=user,
                            framework_id=framework_id,
                            other_framework_name=other_framework_name,
                        )
                # other_framework_nameがあったばあい、すでにあれば何もしない、なければ新規追加
                elif other_framework_name:
                    if not UserFrameworks.objects.filter(
                        user=user, other_framework_name=other_framework_name
                    ).exists():
                        UserFrameworks.objects.create(
                            user=user,
                            other_framework_name=other_framework_name,
                        )
            # user_social_mediasの更新(同様に、すでにあるものはURLを更新し、ないものは新規追加)
            request_user_social_medias_data = request_data.get(
                "user_social_medias", []
            )
            # UserSocialMediasSerializerを使用してリクエストデータを検証
            user_social_medias_serializer = UserSocialMediasSerializer(
                data=request_user_social_medias_data, many=True
            )
            if not user_social_medias_serializer.is_valid():
                return Response(
                    user_social_medias_serializer.errors, status=400
                )
            user_social_medias_data = (
                user_social_medias_serializer.validated_data
            )
            # 既存のソーシャルメディアを取得
            prev_user_social_medias = UserSocialMedias.objects.filter(
                user=user
            )
            # 既存のソーシャルメディアを削除(ソーシャルメディアIDで)
            for user_social_media in prev_user_social_medias:
                if user_social_media.social_media is not None:
                    if user_social_media.social_media.id not in [
                        sm["social_media"]["id"]
                        for sm in user_social_medias_data
                        if sm.get("social_media")
                        and sm["social_media"].get("id") is not None
                        if sm.get("social_media")
                        and sm["social_media"].get("id") is not None
                    ]:
                        user_social_media.delete()
            # 既存のソーシャルメディアを削除(other_social_media_nameで)
            for user_social_media in prev_user_social_medias:
                if (
                    user_social_media.other_social_media_name
                    not in [
                        sm.get("other_social_media_name")
                        for sm in user_social_medias_data
                    ]
                    and user_social_media.social_media is None
                ):
                    user_social_media.delete()

            # 新しいソーシャルメディアを追加
            for social_media_data in user_social_medias_data:
                # ソーシャルメディアのIDとother_social_media_nameが両方ともあった場合リクエストエラー
                social_media = social_media_data.get("social_media")
                social_media_id = (
                    social_media.get("id") if social_media else None
                )
                other_social_media_name = social_media_data.get(
                    "other_social_media_name", ""
                )
                if social_media_id and other_social_media_name:
                    return Response(
                        {
                            "error": "social_media_idとother_social_media_nameの両方を同時に指定することはできません。"
                        },
                        status=400,
                    )
                # ソーシャルメディアIDがあったばあい、すでにあればURLを更新、なければ新規追加
                if social_media_id:
                    if not UserSocialMedias.objects.filter(
                        user=user, social_media_id=social_media_id
                    ).exists():
                        UserSocialMedias.objects.create(
                            user=user,
                            social_media_id=social_media_id,
                            other_social_media_name=other_social_media_name,
                            url=social_media_data.get("url"),
                        )
                    else:
                        user_social_media = UserSocialMedias.objects.get(
                            user=user, social_media_id=social_media_id
                        )
                        user_social_media.url = social_media_data.get("url")
                        user_social_media.save()
                # other_social_media_nameがあったばあい、すでにあればURLを更新、なければ新規追加
                elif other_social_media_name:
                    if not UserSocialMedias.objects.filter(
                        user=user,
                        other_social_media_name=other_social_media_name,
                    ).exists():
                        UserSocialMedias.objects.create(
                            user=user,
                            other_social_media_name=other_social_media_name,
                            url=social_media_data.get("url"),
                        )
                    else:
                        user_social_media = UserSocialMedias.objects.get(
                            user=user,
                            other_social_media_name=other_social_media_name,
                        )
                        user_social_media.url = social_media_data.get("url")
                        user_social_media.save()
            return Response(
                {"message": "プロフィールが更新されました。"}, status=200
            )
