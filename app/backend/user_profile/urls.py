from django.urls import path
from . import views


urlpatterns = [
    path("", views.UserProfileView.as_view(), name="profile"),
    path(
        "<int:user_id>/", views.UserProfileView.as_view(), name="user_profile"
    ),
    path("languages/", views.LanguagesView.as_view(), name="languages"),
    path("frameworks/", views.FrameworksView.as_view(), name="frameworks"),
    path(
        "social_medias/", views.SocialMediasView.as_view(), name="social_media"
    ),
]
