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


# Create your views here.
class UserProfileView(APIView):
    """
    ユーザープロフィールの取得と更新
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
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
                "profiles": profile_data,
                "user_languages": user_languages_data,
                "user_frameworks": user_frameworks_data,
                "user_social_medias": user_social_medias_data,
            }
        )
        # レスポンスとして返す
        response_data = all_profiles_serializer.data
        return Response(response_data)
