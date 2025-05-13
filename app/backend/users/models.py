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
    id = models.BigAutoField(primary_key=True)  # 明示的に書くなら
    school_id = models.CharField(max_length=50, unique=True, null=False)
    user_name = models.CharField(max_length=150, unique=True, null=False)
    is_initial_password = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "school_id"  # 認証に使うフィールド
    REQUIRED_FIELDS = ["user_name"]  # createsuperuserで追加入力を求められる

    def __str__(self):
        return self.user_name
