from rest_framework import routers
from django.urls import path, include
from .views import (
    ProjectViewSet,
    PublicProjectViewSet,
    ReviewViewSet,
    PublicReviewViewSet,
)

router = routers.DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(
    r"public-projects", PublicProjectViewSet, basename="public-project"
)
router.register(r"reviews", ReviewViewSet, basename="review")
router.register(
    r"public-reviews", PublicReviewViewSet, basename="public-review"
)

urlpatterns = [
    path("", include(router.urls)),
]
