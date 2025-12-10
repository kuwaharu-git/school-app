from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, Review
from django.utils import timezone

User = get_user_model()


class UserPublicSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "display_name")

    def get_display_name(self, obj):
        return (
            getattr(obj, "display_name", None)
            or getattr(obj, "full_name", None)
            or getattr(obj, "username", "")
        )


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserPublicSerializer(read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "project",
            "reviewer",
            "reviewer_name_snapshot",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "reviewer_name_snapshot",
            "created_at",
            "updated_at",
        )


class ReviewCreateSerializer(serializers.ModelSerializer):
    # project must be provided as PK
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all()
    )

    class Meta:
        model = Review
        fields = ("id", "project", "comment")

    def validate(self, attrs):
        request = self.context.get("request")
        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            raise serializers.ValidationError(
                "Authentication required to post a review."
            )
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        project = validated_data.pop("project")
        defaults = {
            "comment": validated_data.get("comment", ""),
            "reviewer_name_snapshot": (
                getattr(user, "display_name", None)
                or getattr(user, "full_name", None)
                or getattr(user, "username", "")
            ),
            "reviewer": user,
        }
        obj, created = Review.objects.update_or_create(
            project=project, reviewer=user, defaults=defaults
        )
        if not created:
            # updated_atを手動で更新
            obj.updated_at = timezone.now()
            obj.save(update_fields=["updated_at"])
        return obj


class ProjectListSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "author",
            "repository_url",
            "live_url",
            "is_public",
            "cached_reviewer_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("cached_reviewer_count",)


class ProjectDetailSerializer(ProjectListSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ProjectListSerializer.Meta):
        model = Project
        fields = ProjectListSerializer.Meta.fields + ("description", "reviews")


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "description",
            "repository_url",
            "live_url",
            "is_public",
        )

    def create(self, validated_data):
        # author must be set from request.user in the view
        project = Project.objects.create(**validated_data)
        return project

    def update(self, instance, validated_data):
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance
