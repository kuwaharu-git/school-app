from django.shortcuts import render
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404

from .models import Project, Review
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateUpdateSerializer,
    ReviewSerializer,
    ReviewCreateSerializer,
)
from .permissions import IsAuthorOrReadOnly, IsReviewerOrReadOnly


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    permission_classes = [IsAuthorOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.all()
        if user and user.is_authenticated:
            return qs.filter(models.Q(is_public=True) | models.Q(author=user))
        return qs.filter(is_public=True)

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        # プロジェクト更新時も作者は変更されない
        serializer.save()

    def perform_destroy(self, instance):
        # プロジェクト削除（関連するレビューも CASCADE で削除される）
        instance.delete()


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("project", "reviewer").all()
    permission_classes = [IsReviewerOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.select_related("project", "reviewer").all()

        # Filter by project ID if provided
        project_id = self.request.query_params.get("project", None)
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)

        return queryset

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ReviewCreateSerializer
        return ReviewSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        out_serializer = ReviewSerializer(review, context={"request": request})
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)
