import csv
from django.core.management.base import BaseCommand, CommandError
from users.models import User


class Command(BaseCommand):
    help = "CSVからユーザーを一括作成します"

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_file", type=str, help="ユーザー情報のCSVファイルパス"
        )

    def handle(self, *args, **options):
        csv_file = options["csv_file"]
        with open(csv_file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                student_id = row.get("student_id")
                username = row.get("username")
                password = row.get("password")
                email = row.get("email", None)
                if not (student_id and username and password):
                    self.stdout.write(
                        self.style.ERROR(f"必須項目が不足: {row}")
                    )
                    continue
                if User.objects.filter(student_id=student_id).exists():
                    self.stdout.write(
                        self.style.WARNING(f"既存: {student_id}")
                    )
                    continue
                user = User.objects.create_user(
                    student_id=student_id,
                    username=username,
                    password=password,
                    email=email,
                )
                self.stdout.write(self.style.SUCCESS(f"作成: {student_id}"))

        self.stdout.write(self.style.SUCCESS("インポート完了"))
