from django.contrib import admin
from .models import Project, Review


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "author",
        "is_public",
        "cached_average_rating",
        "cached_reviewer_count",
        "created_at",
    )
    search_fields = ("title", "author__username", "repository_url")
    list_filter = ("is_public",)
    prepopulated_fields = {"slug": ("title",)}
    raw_id_fields = ("author",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project",
        "reviewer_name_snapshot",
        "rating",
        "created_at",
    )
    search_fields = ("reviewer_name_snapshot", "comment", "project__title")
    list_filter = ("rating",)
    raw_id_fields = ("project", "reviewer")
