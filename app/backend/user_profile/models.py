from django.db import models
from django.db.models import UniqueConstraint


class Profiles(models.Model):
    user = models.OneToOneField(
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
        return f"Profile of {self.user.username}"


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
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
    )
    language = models.ForeignKey(
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
        constraints = [
            UniqueConstraint(
                fields=["user", "language"],
                name="unique_user_language",
            )
        ]

    def __str__(self):
        return_str = ""
        if self.language:
            return_str = f"{self.user} - {self.language.language_name}"
        else:
            return_str = f"{self.user} - {self.other_language_name}"
        return return_str


class UserFrameworks(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
    )
    framework = models.ForeignKey(
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
        constraints = [
            UniqueConstraint(
                fields=["user", "framework"],
                name="unique_user_framework",
            )
        ]

    def __str__(self):
        return_str = ""
        if self.framework:
            return_str = f"{self.user} - {self.framework.framework_name}"
        else:
            return_str = f"{self.user} - {self.other_framework_name}"
        return return_str


class UserSocialMedias(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
    )
    social_media = models.ForeignKey(
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
        constraints = [
            UniqueConstraint(
                fields=["user", "social_media"],
                name="unique_user_social_media",
            )
        ]

    def __str__(self):
        return_str = ""
        if self.social_media:
            return_str = f"{self.user} - {self.social_media.social_media_name}"
        else:
            return_str = f"{self.user} - {self.other_social_media_name}"
        return return_str
