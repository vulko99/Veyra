#!/usr/bin/env bash
# One-time setup for a GitHub Codespace (runs on postCreate).
# Uses SQLite + eager Celery so no extra database/broker containers are needed.
set -e

echo "==> Setting up the Veyra backend"
cd "$(dirname "$0")/../backend"
python -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip >/dev/null
pip install -r requirements/development.txt

echo "==> Applying migrations and seeding demo data"
python manage.py migrate --noinput
python manage.py seed_demo_data

echo "==> Creating a demo admin (admin@veyra.example / veyra-demo-pass)"
DJANGO_SUPERUSER_PASSWORD='veyra-demo-pass' \
  python manage.py createsuperuser \
  --email admin@veyra.example --noinput 2>/dev/null \
  || echo "   (admin already exists — skipping)"

echo "==> Installing the Veyra frontend"
cd ../frontend
npm install

echo "==> Setup complete."
