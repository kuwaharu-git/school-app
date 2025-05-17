from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, school_id, password=None, **extra_fields):
        if not school_id:
            raise ValueError("The school_id must be set")
        user = self.model(school_id=school_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, school_id, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(school_id, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    school_id = models.CharField(max_length=50, unique=True, null=False)
    username = models.CharField(max_length=150, unique=True, null=False)
    is_initial_password = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(
        max_length=255, unique=True, null=True, blank=True
    )
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = "school_id"  # 認証に使うフィールド
    REQUIRED_FIELDS = ["username"]  # createsuperuserで追加入力を求められる

    def __str__(self):
        return self.username


class RequestUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    school_id = models.CharField(max_length=50, unique=True, null=False)
    username = models.CharField(max_length=150, unique=True, null=False)
    request_at = models.DateTimeField(auto_now_add=True)
    is_created = models.BooleanField(default=False)
    agreed_to_terms = models.BooleanField(default=False)

    def __str__(self):
        return self.username
