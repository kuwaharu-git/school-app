#!/bin/sh
set -e

echo "[backend] migrate" && python manage.py migrate --noinput
echo "[backend] collectstatic" && python manage.py collectstatic --noinput
echo "[backend] start gunicorn" && exec gunicorn myproject.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers ${GUNICORN_WORKERS:-3} \
  --timeout 120
