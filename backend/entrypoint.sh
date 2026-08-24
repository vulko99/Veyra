#!/usr/bin/env bash
set -e

# Wait for the database, then migrate and start.
echo "Applying database migrations..."
python manage.py migrate --noinput

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  echo "Seeding demo data..."
  python manage.py seed_demo_data
fi

exec "$@"
