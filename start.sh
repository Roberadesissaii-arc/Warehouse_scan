#!/usr/bin/env bash
#
# Production process supervisor: Flask API (5003) + Next.js PWA (5002).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [ -f "$ROOT/instance/install.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/instance/install.env"
  set +a
fi

find_waitress() {
  local candidate
  for candidate in \
    "${SCAN_VENV:-}" \
    "$ROOT/.venv" \
    "$ROOT/../.venv"; do
    if [ -n "$candidate" ] && [ -x "$candidate/bin/waitress-serve" ]; then
      echo "$candidate/bin/waitress-serve"
      return
    fi
  done
  if command -v waitress-serve >/dev/null 2>&1; then
    command -v waitress-serve
    return
  fi
  echo "!! waitress-serve not found. Run ./install.sh first." >&2
  exit 1
}

WAITRESS="$(find_waitress)"
SCAN_PORT="${SCAN_PORT:-5002}"
SCAN_HOST="${SCAN_HOST:-0.0.0.0}"
SCAN_API_HOST="${SCAN_API_HOST:-127.0.0.1}"
SCAN_API_PORT="${SCAN_API_PORT:-5003}"
NEXT_BIN="$ROOT/node_modules/.bin/next"

if [ ! -x "$NEXT_BIN" ]; then
  echo "!! Next.js build missing. Run: pnpm install && pnpm build" >&2
  exit 1
fi

echo "==> Scan API   http://${SCAN_API_HOST}:${SCAN_API_PORT}"
echo "==> Scan PWA   http://${SCAN_HOST}:${SCAN_PORT}"

cd "$ROOT/backend"
"$WAITRESS" --host="$SCAN_API_HOST" --port="$SCAN_API_PORT" wsgi:app &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$ROOT"
exec "$NEXT_BIN" start -p "$SCAN_PORT" -H "$SCAN_HOST"
