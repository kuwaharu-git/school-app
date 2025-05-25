from django.contrib import admin
from user_profile.models import (
    Profiles,
    Languages,
    Frameworks,
    SocialMedias,
    UserLanguages,
    UserFrameworks,
    UserSocialMedias,
)

# Register your models here.
admin.site.register(Profiles)
admin.site.register(Languages)
admin.site.register(Frameworks)
admin.site.register(SocialMedias)
admin.site.register(UserLanguages)
admin.site.register(UserFrameworks)
admin.site.register(UserSocialMedias)
