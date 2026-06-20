#!/usr/bin/env bash
#
# Start Warehouse Floor Scan in the foreground (production build).
# Run ./install.sh once before using this script.
set -euo pipefail

SCAN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCAN_ROOT"

if [ ! -d "$SCAN_ROOT/.next" ]; then
  echo "!! Production build missing. Run: ./install.sh" >&2
  exit 1
fi

if [ -f "$SCAN_ROOT/instance/install.env" ]; then
  # shellcheck disable=SC1091
  set -a
  source "$SCAN_ROOT/instance/install.env"
  set +a
fi

export SCAN_VENV="${SCAN_VENV:-}"
exec "$SCAN_ROOT/start.sh"
