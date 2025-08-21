from rest_framework import routers
from django.urls import path, include
from .views import ProjectViewSet, ReviewViewSet

router = routers.DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"reviews", ReviewViewSet, basename="review")

urlpatterns = [
    path("", include(router.urls)),
]
