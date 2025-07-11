# Generated by Django 5.2 on 2025-05-25 09:52

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profile', '0004_alter_userframeworks_unique_together_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='userframeworks',
            name='unique_user_framework',
        ),
        migrations.RemoveConstraint(
            model_name='userlanguages',
            name='unique_user_language',
        ),
        migrations.RemoveConstraint(
            model_name='usersocialmedias',
            name='unique_user_social_media',
        ),
        migrations.RenameField(
            model_name='profiles',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='userframeworks',
            old_name='framework_id',
            new_name='framework',
        ),
        migrations.RenameField(
            model_name='userframeworks',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='userlanguages',
            old_name='language_id',
            new_name='language',
        ),
        migrations.RenameField(
            model_name='userlanguages',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='usersocialmedias',
            old_name='social_media_id',
            new_name='social_media',
        ),
        migrations.RenameField(
            model_name='usersocialmedias',
            old_name='user_id',
            new_name='user',
        ),
        migrations.AddConstraint(
            model_name='userframeworks',
            constraint=models.UniqueConstraint(fields=('user', 'framework'), name='unique_user_framework'),
        ),
        migrations.AddConstraint(
            model_name='userlanguages',
            constraint=models.UniqueConstraint(fields=('user', 'language'), name='unique_user_language'),
        ),
        migrations.AddConstraint(
            model_name='usersocialmedias',
            constraint=models.UniqueConstraint(fields=('user', 'social_media'), name='unique_user_social_media'),
        ),
    ]
