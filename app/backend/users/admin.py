from django.contrib import admin
from users.models import User, RequestUser
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


class UserAdmin(BaseUserAdmin):
    list_display = (
        "id",
        "student_id",
        "username",
        "is_initial_password",
        "is_active",
        "is_staff",
        "email",
        "first_name",
        "last_name",
    )
    readonly_fields = ("date_joined",)
    list_filter = ("is_active", "is_staff")
    search_fields = ("student_id", "username", "email")
    ordering = ("-date_joined",)
    filter_horizontal = ()
    fieldsets = (
        (None, {"fields": ("student_id", "username", "password")}),
        ("Personal Info", {"fields": ("email", "first_name", "last_name")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_initial_password")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "student_id",
                    "username",
                    "password1",
                    "password2",
                    "is_initial_password",
                    "is_active",
                    "is_staff",
                    "email",
                    "first_name",
                    "last_name",
                ),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        try:
            request_user = RequestUser.objects.get(student_id=obj.student_id)
            request_user.is_created = True
            request_user.save()
        except RequestUser.DoesNotExist:
            pass


admin.site.register(User, UserAdmin)
admin.site.register(RequestUser)
