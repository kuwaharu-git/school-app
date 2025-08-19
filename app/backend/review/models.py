from django.db import models
from django.conf import settings
from django.db.models import Avg, Count
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from decimal import Decimal
from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model


class Project(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    repository_url = models.URLField(max_length=2000, null=True, blank=True)
    live_url = models.URLField(max_length=2000, null=True, blank=True)
    ogp_image_url = models.URLField(max_length=2000, null=True, blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cached_reviewer_count = models.IntegerField(default=0)
    cached_average_rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=Decimal("0.00")
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["author"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "project"
            slug = base
            i = 1
            while (
                Project.objects.filter(slug=slug).exclude(pk=self.pk).exists()
            ):
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def update_cached_rating(self):
        agg = self.reviews.aggregate(avg=Avg("rating"), cnt=Count("id"))
        avg = agg["avg"] or 0
        cnt = agg["cnt"] or 0
        # Decimal として保存
        self.cached_average_rating = Decimal(str(round(avg or 0, 2)))
        self.cached_reviewer_count = cnt
        # avoid recursive signals by saving only these fields
        Project.objects.filter(pk=self.pk).update(
            cached_average_rating=self.cached_average_rating,
            cached_reviewer_count=self.cached_reviewer_count,
        )


class Review(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="reviews"
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews_made",
    )
    reviewer_name_snapshot = models.CharField(
        max_length=255, default="削除されたユーザ"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("project", "reviewer")
        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["reviewer"]),
            models.Index(fields=["created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        name = self.reviewer_name_snapshot or (
            get_user_model()
            .objects.filter(pk=self.reviewer_id)
            .values_list("username", flat=True)
            .first()
            if self.reviewer_id
            else "削除されたユーザ"
        )
        return f"{self.project.title} - {name} ({self.rating})"

    def save(self, *args, **kwargs):
        # ensure reviewer_name_snapshot is set when reviewer exists
        if self.reviewer and (
            not self.reviewer_name_snapshot
            or self.reviewer_name_snapshot == "削除されたユーザ"
        ):
            # try to read a display name or username from the user model
            user = getattr(self, "reviewer")
            display = (
                getattr(user, "display_name", None)
                or getattr(user, "username", None)
                or ""
            )
            if display:
                self.reviewer_name_snapshot = display
        super().save(*args, **kwargs)


# Signals to keep cached fields in sync (safe when Project may be deleted)
@receiver(post_save, sender=Review)
def on_review_saved(sender, instance, created, **kwargs):
    project_id = getattr(instance, "project_id", None)
    if not project_id:
        return
    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        return
    project.update_cached_rating()


@receiver(post_delete, sender=Review)
def on_review_deleted(sender, instance, **kwargs):
    project_id = getattr(instance, "project_id", None)
    if not project_id:
        return
    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        return
    project.update_cached_rating()


# ユーザ削除時に関連レビューを匿名化する
@receiver(pre_delete, sender=get_user_model())
def anonymize_reviews_on_user_delete(sender, instance, **kwargs):
    # set reviewer to NULL and replace name snapshot with a generic label
    Review.objects.filter(reviewer=instance).update(
        reviewer=None, reviewer_name_snapshot="削除されたユーザ"
    )
