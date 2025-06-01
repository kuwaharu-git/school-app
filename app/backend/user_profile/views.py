from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    UserInfoSerializer,
    UserProfilesSerializer,
    UserLanguagesSerializer,
    UserFrameworksSerializer,
    UserSocialMediasSerializer,
    AllProfilesSerializer,
    LanguagesSerializer,
    FrameworksSerializer,
    SocialMediasSerializer,
)
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
from django.db import transaction


class UserListView(APIView):
    """
    ユーザー一覧の取得
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ユーザー情報の取得
        users = User.objects.all()
        # シリアライザを使用してデータを整形
        serializer = UserInfoSerializer(users, many=True)
        # レスポンスとして返す
        response_data = {
            "users": serializer.data,
        }
        return Response(response_data)


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
        user_profile = Profiles.objects.filter(user=user_info).first()
        user_languages = UserLanguages.objects.filter(user=user_info)
        user_frameworks = UserFrameworks.objects.filter(user=user_info)
        user_social_medias = UserSocialMedias.objects.filter(user=user_info)
        # シリアライザを使用してデータを整形
        user_info_data = UserInfoSerializer(user_info).data
        profile_data = UserProfilesSerializer(user_profile).data
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
                "user_profile": profile_data,
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
            # リクエストデータの検証
            errors = {}
            # user_profile
            request_user_profile_data = request_data.get("user_profile", {})
            # ProfilesSerializerを使用してリクエストデータを検証
            user_profile_serializer = UserProfilesSerializer(
                data=request_user_profile_data
            )
            if not user_profile_serializer.is_valid():
                errors["user_profile"] = user_profile_serializer.errors
            # languages
            request_user_languages_data = request_data.get(
                "user_languages", []
            )
            # UserLanguagesSerializerを使用してリクエストデータを検証
            user_languages_serializer = UserLanguagesSerializer(
                data=request_user_languages_data, many=True
            )
            if not user_languages_serializer.is_valid():
                errors["user_languages"] = user_languages_serializer.errors
            # frameworks
            request_user_frameworks_data = request_data.get(
                "user_frameworks", []
            )
            # UserFrameworksSerializerを使用してリクエストデータを検証
            user_frameworks_serializer = UserFrameworksSerializer(
                data=request_user_frameworks_data, many=True
            )
            if not user_frameworks_serializer.is_valid():
                errors["user_frameworks"] = user_frameworks_serializer.errors
            # social_medias
            request_user_social_medias_data = request_data.get(
                "user_social_medias", []
            )
            # UserSocialMediasSerializerを使用してリクエストデータを検証
            user_social_medias_serializer = UserSocialMediasSerializer(
                data=request_user_social_medias_data, many=True
            )
            if not user_social_medias_serializer.is_valid():
                errors["user_social_medias"] = (
                    user_social_medias_serializer.errors
                )

            # エラーがあった場合は400エラーを返す
            if errors:
                return Response({"errors": errors}, status=400)

            # すべてのシリアライザが有効な場合、データを保存
            # profileの更新（なかった場合は新規作成）
            Profiles.objects.update_or_create(
                user=user,
                defaults=user_profile_serializer.validated_data,
            )
            # user_languagesの更新(なくなったものを削除し、新しいものを追加)
            request_user_languages_data = (
                user_languages_serializer.validated_data
            )
            # 既存の言語を取得
            prev_user_languages = UserLanguages.objects.filter(user=user)
            # リクエストに含まれる言語IDのリストを作成
            request_user_language_ids = [
                lang.get("language", {}).get("id")
                for lang in request_user_languages_data
                if lang.get("language")
                and lang["language"].get("id") is not None
            ]
            # リクエストに含まれるother_language_nameのリストを作成
            request_user_other_language_names = [
                lang.get("other_language_name", "")
                for lang in request_user_languages_data
                if lang.get("other_language_name")
            ]
            # リクエストにない既存の言語を削除
            for prev_user_language in prev_user_languages:
                if prev_user_language.language is not None:
                    if (
                        prev_user_language.language.id
                        not in request_user_language_ids
                    ):
                        prev_user_language.delete()
                if prev_user_language.other_language_name:
                    if (
                        prev_user_language.other_language_name
                        not in request_user_other_language_names
                    ):
                        prev_user_language.delete()
            # 新しい言語を追加
            for lang_data in request_user_languages_data:
                language = lang_data.get("language")
                language_id = language.get("id") if language else None
                other_language_name = lang_data.get("other_language_name", "")
                # 言語IDがすでにあれば何もしない、なければ新規追加
                if language_id:
                    if not UserLanguages.objects.filter(
                        user=user, language_id=language_id
                    ).exists():
                        UserLanguages.objects.create(
                            user=user,
                            language_id=language_id,
                            other_language_name=other_language_name,
                        )
                # other_language_nameがすでにあれば何もしない、なければ新規追加
                elif other_language_name:
                    if not UserLanguages.objects.filter(
                        user=user, other_language_name=other_language_name
                    ).exists():
                        UserLanguages.objects.create(
                            user=user,
                            other_language_name=other_language_name,
                        )

            # user_frameworksの更新(同様に)
            request_user_frameworks_data = (
                user_frameworks_serializer.validated_data
            )
            prev_user_frameworks = UserFrameworks.objects.filter(user=user)
            # リクエストに含まれるフレームワークIDのリストを作成
            request_user_framework_ids = [
                fw.get("framework", {}).get("id")
                for fw in request_user_frameworks_data
                if fw.get("framework")
                and fw["framework"].get("id") is not None
            ]
            # リクエストに含まれるother_framework_nameのリストを作成
            request_user_other_framework_names = [
                fw.get("other_framework_name", "")
                for fw in request_user_frameworks_data
                if fw.get("other_framework_name")
            ]
            # リクエストにない既存のフレームワークを削除
            for user_framework in prev_user_frameworks:
                if user_framework.framework is not None:
                    if user_framework.id not in request_user_framework_ids:
                        user_framework.delete()
                if user_framework.other_framework_name:
                    if (
                        user_framework.other_framework_name
                        not in request_user_other_framework_names
                    ):
                        user_framework.delete()
            # 新しいフレームワークを追加
            for fw_data in request_user_frameworks_data:
                framework = fw_data.get("framework")
                framework_id = framework.get("id") if framework else None
                other_framework_name = fw_data.get("other_framework_name", "")
                # フレームワークIDがすでにあれば何もしない、なければ新規追加
                if framework_id:
                    if not UserFrameworks.objects.filter(
                        user=user, framework_id=framework_id
                    ).exists():
                        UserFrameworks.objects.create(
                            user=user,
                            framework_id=framework_id,
                            other_framework_name=other_framework_name,
                        )
                # other_framework_nameがすでにあれば何もしない、なければ新規追加
                elif other_framework_name:
                    if not UserFrameworks.objects.filter(
                        user=user, other_framework_name=other_framework_name
                    ).exists():
                        UserFrameworks.objects.create(
                            user=user,
                            other_framework_name=other_framework_name,
                        )
            # user_social_mediasの更新(同様に、すでにあるものはURLを更新し、ないものは新規追加)
            request_user_social_medias_data = (
                user_social_medias_serializer.validated_data
            )
            # 既存のソーシャルメディアを取得
            prev_user_social_medias = UserSocialMedias.objects.filter(
                user=user
            )
            # リクエストに含まれるソーシャルメディアIDのリストを作成
            request_user_social_media_ids = [
                sm.get("social_media", {}).get("id")
                for sm in request_user_social_medias_data
                if sm.get("social_media")
                and sm["social_media"].get("id") is not None
            ]
            # リクエストに含まれるother_social_media_nameのリストを作成
            request_user_other_social_media_names = [
                sm.get("other_social_media_name", "")
                for sm in request_user_social_medias_data
                if sm.get("other_social_media_name")
            ]
            # 既存のソーシャルメディアを削除(ソーシャルメディアIDで)
            for user_social_media in prev_user_social_medias:
                if user_social_media.social_media is not None:
                    if (
                        user_social_media.social_media.id
                        not in request_user_social_media_ids
                    ):
                        user_social_media.delete()
                if user_social_media.other_social_media_name:
                    if (
                        user_social_media.other_social_media_name
                        not in request_user_other_social_media_names
                    ):
                        user_social_media.delete()

            # 新しいソーシャルメディアを追加
            for social_media_data in request_user_social_medias_data:
                # ソーシャルメディアのIDとother_social_media_nameが両方ともあった場合リクエストエラー
                social_media = social_media_data.get("social_media")
                social_media_id = (
                    social_media.get("id") if social_media else None
                )
                other_social_media_name = social_media_data.get(
                    "other_social_media_name", ""
                )
                # ソーシャルメディアIDがすでにあればURLを更新、なければ新規追加
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
                # other_social_media_nameがすでにあればURLを更新、なければ新規追加
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


class LanguagesView(APIView):
    """
    マスタ言語情報を取得
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        languages = Languages.objects.all()
        serializer = LanguagesSerializer(languages, many=True)
        # 辞書型でデータを返す
        data = {lang["id"]: lang["language_name"] for lang in serializer.data}
        return Response(data)


class FrameworksView(APIView):
    """
    マスタフレームワーク情報を取得
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        frameworks = Frameworks.objects.all()
        serializer = FrameworksSerializer(frameworks, many=True)
        # 辞書型でデータを返す
        data = {fw["id"]: fw["framework_name"] for fw in serializer.data}
        return Response(data)


class SocialMediasView(APIView):
    """
    マスタソーシャルメディア情報を取得
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        social_medias = SocialMedias.objects.all()
        serializer = SocialMediasSerializer(social_medias, many=True)
        # 辞書型でデータを返す
        data = {sm["id"]: sm["social_media_name"] for sm in serializer.data}
        return Response(data)
