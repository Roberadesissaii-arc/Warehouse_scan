#!/usr/bin/env bash
#
# Warehouse Floor Scan — Ubuntu / Debian installer
#
#   ./install.sh                    # deps + build + systemd (UI + API together)
#   ./install.sh --no-service       # install only, start with ./run.sh
#   ./install.sh --docker           # Docker instead of native
#   ./install.sh --with-warehouse   # also install WarehouseDB on this machine
#   ./install.sh --reset            # wipe the database, then reinstall fresh
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
RESET_DB=false
WEB_MODE=false

usage() {
  sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --with-warehouse) WITH_WAREHOUSE=true ;;
    --service) INSTALL_SERVICE=true ;;
    --no-service) INSTALL_SERVICE=false ;;
    --docker) USE_DOCKER=true ;;
    --reset) RESET_DB=true ;;
    --web) WEB_MODE=true ;;
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

if $WEB_MODE; then
  # No-sudo install triggered by the WarehouseDB "Install" button. Assumes the
  # toolchain (node, pnpm, python3) is already present from the first setup.
  command -v node >/dev/null 2>&1 && command -v pnpm >/dev/null 2>&1 && command -v "$PYTHON" >/dev/null 2>&1 || {
    echo "Toolchain missing — run ./install.sh once in a terminal first." >&2; exit 1; }
  cd "$SCAN_ROOT"
  UI_PORT="$(find_free_port 5002)"
  API_PORT="$(find_free_port 5003)"
  [ "$UI_PORT" = "$API_PORT" ] && API_PORT="$(find_free_port $((UI_PORT + 1)))"
  WH_ENV="$PROJECT_ROOT/WarehouseDB/instance/warehousedb.env"
  SCAN_KEY="$(grep '^SCAN_API_KEY=' "$WH_ENV" 2>/dev/null | cut -d= -f2- || true)"
  [ -n "$SCAN_KEY" ] || SCAN_KEY="$("$PYTHON" -c 'import secrets; print(secrets.token_hex(24))')"
  VENV="$SCAN_ROOT/.venv"
  [ -d "$VENV" ] || "$PYTHON" -m venv "$VENV"
  "$VENV/bin/pip" install --upgrade pip >/dev/null 2>&1 || true
  "$VENV/bin/pip" install -r "$SCAN_ROOT/requirements.txt"
  ENV_FILE="$SCAN_ROOT/.env"
  if [ ! -f "$ENV_FILE" ]; then
    SECRET="$("$VENV/bin/python" -c 'import secrets; print(secrets.token_hex(32))')"
    cat >"$ENV_FILE" <<EOF
FLASK_ENV=production
WAREHOUSE_URL=http://127.0.0.1:8000
SCAN_API_KEY=$SCAN_KEY
SCAN_SECRET_KEY=$SECRET
SCAN_API_HOST=127.0.0.1
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
  mkdir -p "$SCAN_ROOT/instance"
  cat >"$SCAN_ROOT/instance/install.env" <<EOF
SCAN_ROOT=$SCAN_ROOT
SCAN_VENV=$VENV
EOF
  pnpm install --frozen-lockfile
  pnpm build
  chmod +x "$SCAN_ROOT/start.sh" "$SCAN_ROOT/run.sh"
  install_user_service warehouse-scan "$SCAN_ROOT" "$VENV"
  echo "WEB_INSTALL_OK http://127.0.0.1:$UI_PORT"
  exit 0
fi

TOTAL_STEPS=7
if [ -t 1 ]; then clear 2>/dev/null || true; fi
printf '\n  %sW A R E H O U S E%s\n%s' "$DIM" "$RESET" "$GREEN"
cat <<'ART'
  ███████╗ ██████╗ █████╗ ███╗   ██╗
  ██╔════╝██╔════╝██╔══██╗████╗  ██║
  ███████╗██║     ███████║██╔██╗ ██║
  ╚════██║██║     ██╔══██║██║╚██╗██║
  ███████║╚██████╗██║  ██║██║ ╚████║
  ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝
ART
printf '%s\n' "$RESET"
echo "  ${BOLD}Warehouse Scan${RESET}  ${DIM}— floor scanning PWA for staff${RESET}           ${DIM}self-hosted${RESET}"
echo "  ${DIM}──────────────────────────────────────────────────────────${RESET}"
echo

step "System packages & toolchain"
ensure_sudo
stop_service_if_running warehouse-scan
if $RESET_DB; then
  warn "--reset: wiping the existing database for a clean start"
  rm -f "$SCAN_ROOT"/instance/scan.db* 2>/dev/null || true
fi
apt_bootstrap
ensure_node
ensure_pnpm
install_cloudflared

if $WITH_WAREHOUSE; then
  printf '\n  %s▶ Installing WarehouseDB on this machine…%s\n' "$CYAN" "$RESET"
  "$PROJECT_ROOT/WarehouseDB/install.sh"
fi

step "Network ports"
UI_PORT="$(find_free_port 5002)"
API_PORT="$(find_free_port 5003)"
if [ "$UI_PORT" = "$API_PORT" ]; then
  API_PORT="$(find_free_port $((UI_PORT + 1)))"
fi
ok "Ports — PWA $UI_PORT, API $API_PORT"

# SCAN_API_KEY must match WarehouseDB's. Reuse the hub's key if WarehouseDB is on
# this machine; otherwise generate a strong one (set the same value on WarehouseDB).
WH_ENV="$PROJECT_ROOT/WarehouseDB/instance/warehousedb.env"
if [ -f "$WH_ENV" ] && grep -q '^SCAN_API_KEY=' "$WH_ENV"; then
  SCAN_KEY="$(grep '^SCAN_API_KEY=' "$WH_ENV" | cut -d= -f2-)"
  SCAN_KEY_SRC="matched WarehouseDB on this machine"
else
  SCAN_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(24))')"
  SCAN_KEY_SRC="generated — set SCAN_API_KEY=$SCAN_KEY in WarehouseDB to match"
fi

if $USE_DOCKER; then
  install_docker_engine
  ENV_FILE="$SCAN_ROOT/.env"
  if [ ! -f "$ENV_FILE" ]; then
    SECRET="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
    cat >"$ENV_FILE" <<EOF
FLASK_ENV=production
WAREHOUSE_URL=http://127.0.0.1:8000
SCAN_API_KEY=$SCAN_KEY
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
  open_firewall_port "$UI_PORT" "Warehouse Scan"
  note "logs: docker compose logs -f scan"
  exit 0
fi

step "Python environment"
VENV="$SCAN_ROOT/.venv"
note "virtualenv: $VENV"
if [ ! -d "$VENV" ]; then
  "$PYTHON" -m venv "$VENV"
fi
"$VENV/bin/pip" install --upgrade pip >/dev/null 2>&1 || true
spin_ok "Installing API dependencies…" "API dependencies installed" \
  "$VENV/bin/pip" install -r "$SCAN_ROOT/requirements.txt"

step "Configuration"
ENV_FILE="$SCAN_ROOT/.env"
if [ ! -f "$ENV_FILE" ]; then
  note "creating $ENV_FILE with a random secret"
  SECRET="$("$VENV/bin/python" -c 'import secrets; print(secrets.token_hex(32))')"
  cat >"$ENV_FILE" <<EOF
FLASK_ENV=production
WAREHOUSE_URL=http://127.0.0.1:8000
SCAN_API_KEY=$SCAN_KEY
SCAN_SECRET_KEY=$SECRET
SCAN_API_HOST=127.0.0.1
SCAN_API_PORT=$API_PORT
SCAN_BACKEND_URL=http://127.0.0.1:$API_PORT
SCAN_PORT=$UI_PORT
SCAN_HOST=0.0.0.0
EOF
  chmod 600 "$ENV_FILE"
  ok "Created $ENV_FILE — SCAN_API_KEY $SCAN_KEY_SRC"
else
  note "updating ports in $ENV_FILE"
  set_env_kv "$ENV_FILE" SCAN_PORT "$UI_PORT"
  set_env_kv "$ENV_FILE" SCAN_API_PORT "$API_PORT"
  set_env_kv "$ENV_FILE" SCAN_BACKEND_URL "http://127.0.0.1:$API_PORT"
  if grep -q '^SCAN_API_KEY=scan-dev-key$' "$ENV_FILE"; then
    set_env_kv "$ENV_FILE" SCAN_API_KEY "$SCAN_KEY"
    warn "Updated SCAN_API_KEY ($SCAN_KEY_SRC)"
  fi
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
spin_ok "Installing Node dependencies…" "Node dependencies installed" \
  pnpm install --frozen-lockfile
spin_ok "Building production PWA…" "Production build ready" \
  pnpm build

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

step "Firewall"
open_firewall_port "$UI_PORT" "Warehouse Scan"

echo
echo "  ${GREEN}${BOLD}✓ Warehouse Scan ready${RESET}"
echo
echo "    ${BOLD}Floor PWA${RESET}      http://<server-ip>:${UI_PORT}   (Add to Home Screen)"
echo "    ${BOLD}API${RESET}            http://127.0.0.1:${API_PORT}/api/health"
echo "    ${BOLD}Service${RESET}        systemctl status warehouse-scan"
echo "    ${BOLD}Public domain${RESET}  deploy/CLOUDFLARE-TUNNEL.md"
echo
