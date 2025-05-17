from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("test/", views.TestView.as_view()),
    path("login/", views.LoginView.as_view(), name="login"),
    path("retry/", views.RetryView.as_view(), name="retry"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path(
        "change_password/",
        views.ChangePasswordView.as_view(),
        name="change_password",
    ),
    path(
        "request_user/", views.RequestUserView.as_view(), name="request_user"
    ),
]
