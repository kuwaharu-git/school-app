from django.urls import path
from . import views


urlpatterns = [
    path("", views.UserProfileView.as_view(), name="profile"),
    path(
        "<int:user_id>/", views.UserProfileView.as_view(), name="user_profile"
    ),
]
