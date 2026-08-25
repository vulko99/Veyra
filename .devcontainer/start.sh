#!/usr/bin/env bash
# Start both servers in a Codespace (runs on postAttach; safe to re-run).
#
# The frontend proxies /api/* to the backend (see next.config.mjs), so your
# browser only ever talks to the forwarded port 3000 — no cross-origin issues.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/.devcontainer/logs"
mkdir -p "$LOG_DIR"

# Forwarded HTTPS origin for the Django admin (port 8000), for CSRF trust.
if [ -n "$CODESPACE_NAME" ] && [ -n "$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN" ]; then
  APP_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  ADMIN_URL="https://${CODESPACE_NAME}-8000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  export CSRF_TRUSTED_ORIGINS="${APP_URL},${ADMIN_URL}"
else
  APP_URL="http://localhost:3000"
  ADMIN_URL="http://localhost:8000"
fi

# --- Backend (Django, SQLite, eager Celery via dev settings) ---
if ! pgrep -f "manage.py runserver" >/dev/null 2>&1; then
  echo "==> Starting backend on :8000"
  (
    cd "$ROOT/backend"
    # shellcheck disable=SC1091
    source .venv/bin/activate
    nohup python manage.py runserver 0.0.0.0:8000 >"$LOG_DIR/backend.log" 2>&1 &
  )
else
  echo "==> Backend already running"
fi

# --- Frontend (Next.js; proxies /api to the backend) ---
if ! pgrep -f "next dev" >/dev/null 2>&1; then
  echo "==> Starting frontend on :3000"
  (
    cd "$ROOT/frontend"
    API_PROXY_TARGET="http://localhost:8000" \
    NEXT_PUBLIC_API_URL="/api/v1" \
      nohup npx next dev -H 0.0.0.0 -p 3000 >"$LOG_DIR/frontend.log" 2>&1 &
  )
else
  echo "==> Frontend already running"
fi

cat <<EOF

────────────────────────────────────────────────────────
  Veyra is starting up.

  App:   ${APP_URL}
  Admin: ${ADMIN_URL}/admin  (admin@veyra.example / veyra-demo-pass)

  Open the app from the "Ports" tab (port 3000) if the preview
  does not pop up automatically. First load takes a few seconds
  while Next.js compiles.
────────────────────────────────────────────────────────
EOF
