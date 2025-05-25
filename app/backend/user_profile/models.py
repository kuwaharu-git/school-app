from django.db import models


class Profiles(models.Model):
    user_id = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        primary_key=True,
    )
    self_introduction = models.TextField(
        max_length=500,
        blank=True,
        null=True,
    )
    portfolio_url = models.URLField(
        max_length=200,
        blank=True,
        null=True,
    )
    github_url = models.URLField(
        max_length=200,
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"Profile of {self.user_id.username}"


class Languages(models.Model):
    id = models.BigAutoField(primary_key=True)
    language_name = models.CharField(
        max_length=50,
        unique=True,
        null=False,
    )

    def __str__(self):
        return self.language_name


class Frameworks(models.Model):
    id = models.BigAutoField(primary_key=True)
    framework_name = models.CharField(
        max_length=50,
        unique=True,
        null=False,
    )

    def __str__(self):
        return self.framework_name


class SocialMedias(models.Model):
    id = models.BigAutoField(primary_key=True)
    social_media_name = models.CharField(
        max_length=50,
        unique=True,
        null=False,
    )


class UserLanguages(models.Model):
    user_id = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
    )
    language_id = models.ForeignKey(
        Languages,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    other_language_name = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    class Meta:
        unique_together = (("user_id", "language_id"),)

    def __str__(self):
        return f"{self.user_id.username} - {self.language_id.language_name}"


class UserFrameworks(models.Model):
    user_id = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
    )
    framework_id = models.ForeignKey(
        Frameworks,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    other_framework_name = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    class Meta:
        unique_together = (("user_id", "framework_id"),)

    def __str__(self):
        return f"{self.user_id.username} - {self.framework_id.framework_name}"


class UserSocialMedias(models.Model):
    user_id = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
    )
    social_media_id = models.ForeignKey(
        SocialMedias,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    other_social_media_name = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )
    url = models.URLField(
        max_length=200,
        blank=True,
        null=True,
    )

    class Meta:
        unique_together = (("user_id", "social_media_id"),)

    def __str__(self):
        return f"{self.user_id.username} - {self.social_media_id.social_media_name}"
