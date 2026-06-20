#!/usr/bin/env bash
#
# Warehouse Floor Scan — Ubuntu / Debian installer
#
#   ./install.sh                    # deps + build + systemd (UI + API together)
#   ./install.sh --no-service       # install only, start with ./run.sh
#   ./install.sh --docker           # Docker instead of native
#   ./install.sh --with-warehouse   # also install WarehouseDB on this machine
#
set -euo pipefail

SCAN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCAN_ROOT/.." && pwd)"
# shellcheck source=lib.sh
source "$SCAN_ROOT/deploy/lib.sh"

PYTHON="${PYTHON:-python3}"
WITH_WAREHOUSE=false
INSTALL_SERVICE=true
USE_DOCKER=false

usage() {
  sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --with-warehouse) WITH_WAREHOUSE=true ;;
    --service) INSTALL_SERVICE=true ;;
    --no-service) INSTALL_SERVICE=false ;;
    --docker) USE_DOCKER=true ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

trap stop_sudo_keepalive EXIT

printf '\n%s' "$GREEN"
cat <<'ART'
__      ___   ___ ___ _  _  ___  _   _ ___ ___   ___  ___   _   _  _
\ \    / /_\ | _ \ __| || |/ _ \| | | / __| __| / __|/ __| /_\ | \| |
 \ \/\/ / _ \|   / _|| __ | (_) | |_| \__ \ _|  \__ \ (__ / _ \| .` |
  \_/\_/_/ \_\_|_\___|_||_|\___/ \___/|___/___| |___/\___/_/ \_\_|\_|
ART
printf '%s\n' "$RESET"
echo "  ${DIM}Floor scanning PWA for staff — your warehouse, your control.${RESET}"
echo "  ${DIM}scan app: $SCAN_ROOT${RESET}"
echo

step "System packages & toolchain"
ensure_sudo
apt_bootstrap
ensure_node
ensure_pnpm
install_cloudflared

if $WITH_WAREHOUSE; then
  step "WarehouseDB (on this machine)"
  note "running WarehouseDB installer…"
  "$PROJECT_ROOT/WarehouseDB/install.sh"
fi

step "Network ports"
UI_PORT="$(find_free_port 5002)"
API_PORT="$(find_free_port 5003)"
if [ "$UI_PORT" = "$API_PORT" ]; then
  API_PORT="$(find_free_port $((UI_PORT + 1)))"
fi
ok "Ports — PWA $UI_PORT, API $API_PORT"

if $USE_DOCKER; then
  install_docker_engine
  ENV_FILE="$SCAN_ROOT/.env"
  if [ ! -f "$ENV_FILE" ]; then
    SECRET="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
    cat >"$ENV_FILE" <<EOF
FLASK_ENV=production
WAREHOUSE_URL=http://127.0.0.1:8000
SCAN_API_KEY=scan-dev-key
SCAN_SECRET_KEY=$SECRET
SCAN_API_HOST=0.0.0.0
SCAN_API_PORT=$API_PORT
SCAN_BACKEND_URL=http://127.0.0.1:$API_PORT
SCAN_PORT=$UI_PORT
SCAN_HOST=0.0.0.0
EOF
    chmod 600 "$ENV_FILE"
  else
    set_env_kv "$ENV_FILE" SCAN_PORT "$UI_PORT"
    set_env_kv "$ENV_FILE" SCAN_API_PORT "$API_PORT"
    set_env_kv "$ENV_FILE" SCAN_BACKEND_URL "http://127.0.0.1:$API_PORT"
  fi
  step "Docker"
  note "starting Scan with Docker…"
  cd "$SCAN_ROOT"
  sudo docker compose up -d --build
  echo
  ok "Scan running (Docker) — http://127.0.0.1:${UI_PORT}"
  note "logs: docker compose logs -f scan"
  exit 0
fi

step "Python environment"
VENV="$SCAN_ROOT/.venv"
note "virtualenv: $VENV"
if [ ! -d "$VENV" ]; then
  "$PYTHON" -m venv "$VENV"
fi
note "installing API dependencies…"
"$VENV/bin/pip" install --upgrade pip >/dev/null
"$VENV/bin/pip" install -r "$SCAN_ROOT/requirements.txt"
ok "API dependencies installed"

step "Configuration"
ENV_FILE="$SCAN_ROOT/.env"
if [ ! -f "$ENV_FILE" ]; then
  note "creating $ENV_FILE with a random secret"
  SECRET="$("$VENV/bin/python" -c 'import secrets; print(secrets.token_hex(32))')"
  cat >"$ENV_FILE" <<EOF
FLASK_ENV=production
WAREHOUSE_URL=http://127.0.0.1:8000
SCAN_API_KEY=scan-dev-key
SCAN_SECRET_KEY=$SECRET
SCAN_API_HOST=127.0.0.1
SCAN_API_PORT=$API_PORT
SCAN_BACKEND_URL=http://127.0.0.1:$API_PORT
SCAN_PORT=$UI_PORT
SCAN_HOST=0.0.0.0
EOF
  chmod 600 "$ENV_FILE"
else
  note "updating ports in $ENV_FILE"
  set_env_kv "$ENV_FILE" SCAN_PORT "$UI_PORT"
  set_env_kv "$ENV_FILE" SCAN_API_PORT "$API_PORT"
  set_env_kv "$ENV_FILE" SCAN_BACKEND_URL "http://127.0.0.1:$API_PORT"
fi

mkdir -p "$SCAN_ROOT/instance"
INSTALL_META="$SCAN_ROOT/instance/install.env"
cat >"$INSTALL_META" <<EOF
SCAN_ROOT=$SCAN_ROOT
SCAN_VENV=$VENV
EOF
chmod 600 "$INSTALL_META"

step "Build"
cd "$SCAN_ROOT"
note "installing Node dependencies + production build…"
pnpm install --frozen-lockfile
pnpm build
ok "Production build ready"

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
if "$VENV/bin/python" -c "
import os, sys
import requests
url = os.environ.get('WAREHOUSE_URL', 'http://127.0.0.1:8000').rstrip('/') + '/api/health'
try:
    requests.get(url, timeout=3).raise_for_status()
except Exception:
    sys.exit(1)
" 2>/dev/null; then
  ok "Warehouse reachable at $WAREHOUSE_URL"
else
  warn "Warehouse not reachable at $WAREHOUSE_URL (start WarehouseDB or fix WAREHOUSE_URL)"
fi

chmod +x "$SCAN_ROOT/start.sh" "$SCAN_ROOT/run.sh"

step "Service (auto-start on boot)"
if $INSTALL_SERVICE; then
  RUN_USER="${SUDO_USER:-$(whoami)}"
  install_systemd warehouse-scan "$SCAN_ROOT/deploy/warehouse-scan.service" "$SCAN_ROOT" "$RUN_USER" \
    -e "s|@VENV@|$VENV|g"
  note "logs: journalctl -u warehouse-scan -f"
else
  note "Start manually: $SCAN_ROOT/run.sh"
fi

echo
echo "  ${GREEN}${BOLD}✓ Warehouse Scan ready${RESET}"
echo
echo "    ${BOLD}Floor PWA${RESET}      http://<server-ip>:${UI_PORT}   (Add to Home Screen)"
echo "    ${BOLD}API${RESET}            http://127.0.0.1:${API_PORT}/api/health"
echo "    ${BOLD}Service${RESET}        systemctl status warehouse-scan"
echo "    ${BOLD}Public domain${RESET}  deploy/CLOUDFLARE-TUNNEL.md"
echo
