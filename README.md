# Warehouse Scan

**Your warehouse, your control.** Self-hosted.

A mobile PWA for warehouse staff — scan shelf labels, queue robot picks, and manage floor
tasks from a phone. A Next.js front end with a small Flask API that proxies to **WarehouseDB**.

> Needs **WarehouseDB** reachable (it holds the inventory and the fleet).

| App | Folder | Port |
|-----|--------|------|
| **Scan** (this repo) | `.` | 5002 PWA · 5003 API |
| WarehouseDB | `../WarehouseDB` | 8000 |
| Store | `../Warehouse_store` | 5001 · 5004 |

## What you get

| Area | Description |
|------|-------------|
| Camera scanning | Point at a shelf QR label to pull up the item (html5-qrcode) |
| Queue picks | Send a scanned item to the robot pick queue in WarehouseDB |
| Floor tasks | View and update assigned pick tasks with live progress |
| Account | Staff sign-in and account settings, stored in local SQLite |
| Installable PWA | Add to Home Screen on iOS/Android for an app-like experience |
| Public access | Optional Cloudflare tunnel for a public URL |

## Prerequisites

A Linux server or Raspberry Pi (Debian/Ubuntu) with `git`, `sudo`, Python 3.10+, and Node 18+.
The installer pulls in everything else. **WarehouseDB** on port 8000 must be reachable
(install it alongside with `--with-warehouse`). Windows is supported for local development.

## Quick start

```bash
git clone https://github.com/Roberadesissaii-arc/Warehouse_scan.git
cd Warehouse_scan
chmod +x install.sh
./install.sh
```

`./install.sh` will, in one shot:

1. Install system deps (apt update, Node, pnpm, Python venv, `cloudflared`)
2. Create the Python virtualenv and install the API
3. Generate `.env` with a random secret and free ports (PWA **5002**, API **5003**)
4. Build the production PWA
5. Register a **systemd service** (`systemctl enable --now warehouse-scan`) — UI + API **start
   now and again on every boot**, and restart on crash

When it finishes it prints the URL, e.g. `http://<server-ip>:5002`.

> You run `install.sh` **once**. After that the PWA is always on — **you never start it by
> hand.** Re-run it anytime to update after `git pull`.

```bash
./install.sh --with-warehouse   # also install WarehouseDB on this machine
./install.sh --no-service       # install only — start by hand with ./run.sh
./install.sh --docker           # run with Docker instead of native
```

Open **`http://<server-ip>:5002`** on a phone → **Add to Home Screen** for the PWA.

**First sign-in:** no preset login — the sign-in screen shows a one-time **setup** form.
Create the owner username and password (8+ chars, with a letter and a number) right away so
nobody else can claim it. Change credentials later under **Account**.

## Managing the service

```bash
systemctl status warehouse-scan          # is it running?
sudo systemctl restart warehouse-scan    # restart now
sudo systemctl stop warehouse-scan       # stop until next boot
sudo systemctl disable warehouse-scan    # stop auto-starting on boot
journalctl -u warehouse-scan -f          # live logs

git pull && ./install.sh                 # update after pulling new code
```

## Public access (Cloudflare tunnel)

Optional public domain: see [deploy/CLOUDFLARE-TUNNEL.md](deploy/CLOUDFLARE-TUNNEL.md).

## Development (Windows / macOS / Linux)

Two processes — the Next.js PWA and the Flask API. **Needs WarehouseDB on port 8000.**

**Windows — use the script:**

```powershell
cd Warehouse_scan
.\dev.ps1      # start API + UI together
```

**macOS / Linux — two terminals:**

```bash
# Terminal 1 — API (port 5003)
cd Warehouse_scan/backend
pip install -r requirements.txt
python run.py

# Terminal 2 — PWA (port 5002)
cd Warehouse_scan
cp .env.example .env
pnpm install
pnpm dev
```

Open `http://localhost:5002`. **Camera scanning requires HTTPS or localhost** in most mobile
browsers — on a LAN, put nginx/Caddy in front for HTTPS.

## Environment (`.env`)

Generated on install. Key values:

| Variable | Default | Purpose |
|----------|---------|---------|
| `WAREHOUSE_URL` | `http://127.0.0.1:8000` | WarehouseDB host |
| `SCAN_API_KEY` | `scan-dev-key` | Must match WarehouseDB's `SCAN_API_KEY` |
| `SCAN_SECRET_KEY` | *(generated)* | Staff session signing |
| `SCAN_PORT` / `SCAN_HOST` | `5002` / `0.0.0.0` | PWA port and bind (phones connect here) |
| `SCAN_API_PORT` | `5003` | Flask API (proxied by Next.js) |
| `SCAN_BACKEND_URL` | `http://127.0.0.1:5003` | API origin used by the Next.js proxy |

For item-label QR codes to open the right URL on phones, set `SCAN_PUBLIC_URL` in WarehouseDB's
`instance/warehousedb.env` to your LAN URL, e.g. `http://192.168.1.10:5002`.

## Project layout

```
Warehouse_scan/
├── app/                  # Next.js App Router (PWA UI)
│   └── api/[[...path]]/   # Proxy route → Flask API
├── components/           # React UI (scan, tasks, account)
├── backend/              # Flask API → WarehouseDB session proxy
│   └── app/              # routes, models (staff), services
├── public/icons/         # PWA icons + manifest
├── deploy/               # install lib, systemd unit, Cloudflare guide
└── install.sh            # one-shot installer
```

| Layer | Tech |
|-------|------|
| UI | Next.js 16, React 19, [Lucide icons](https://lucide.dev/icons/) |
| API | Flask + SQLite (`backend/`) → WarehouseDB |
| Camera | html5-qrcode (requires HTTPS or localhost) |

Full install guide: [INSTALL.md](INSTALL.md).

License: [MIT](LICENSE) · Third-party: [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)

Warehouse Scan — built for the warehouse you own.
