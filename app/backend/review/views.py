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
from rest_framework.permissions import IsAuthenticated


# 認証済みユーザー用: 全プロジェクト（公開＋自分の非公開）
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Project.objects.all()
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


# ゲスト用: 公開プロジェクトのみ
class PublicProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.filter(is_public=True)
    authentication_classes = []
    permission_classes = [IsAuthorOrReadOnly]

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectCreateUpdateSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("project", "reviewer").all()
    permission_classes = [IsAuthenticated]

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


class PublicReviewViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    公開レビュー用のビューセット。レビューの一覧表示と詳細表示を提供します。
    """

    queryset = Review.objects.select_related("project", "reviewer").all()
    authentication_classes = []
    permission_classes = [IsReviewerOrReadOnly]

    def get_queryset(self):
        """
        公開されているプロジェクトに関連するレビューのみを返します。
        """
        return self.queryset.filter(project__is_public=True)

    def get_serializer_class(self):
        return ReviewSerializer
