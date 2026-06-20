# Warehouse Floor Scan

Next.js mobile PWA for warehouse staff. Python API proxies to WarehouseDB.

## Server install (Raspberry Pi / Linux)

See **[INSTALL.md](./INSTALL.md)** for the full guide. Run this **once** — it
installs everything and auto-starts on every reboot (you never start it by hand):

```bash
git clone <your-repo-url> warehouse  # or copy the project onto the server
cd warehouse/Warehouse_scan          # the folder that holds install.sh
chmod +x install.sh run.sh start.sh
./install.sh                         # install + systemd (PWA + API), starts now + on boot
./install.sh --with-warehouse        # + WarehouseDB on same host
```

Open **http://\<server-ip\>:5002** on phones → Add to Home Screen.

```bash
# after code updates: git pull && ./install.sh
systemctl status warehouse-scan      # check the always-on service
sudo systemctl restart warehouse-scan
```

License: MIT — see `LICENSE` and `THIRD_PARTY_LICENSES.md`.

## Run locally (development)

**Windows (easiest)**

```powershell
cd Warehouse_scan
.\dev.ps1
```

**Linux / macOS — two terminals**

```bash
# Terminal 1 — API (port 5003)
cd Warehouse_scan/backend
pip install -r requirements.txt
python run.py

# Terminal 2 — UI (port 5002)
cd Warehouse_scan
cp .env.example .env
pnpm install
pnpm dev
```

Open http://localhost:5002/sign-in — on **first visit**, create the one owner account on the setup form (username and password of your choice). Sign in with those credentials afterward. Change them later under **Account**.

## Production (manual)

```bash
cd Warehouse_scan
./install.sh
./run.sh
```

## Stack

| Layer | Tech |
|-------|------|
| UI | Next.js 16, React 19, [Lucide icons](https://lucide.dev/icons/) |
| API | Flask (`Warehouse_scan/backend/`) → WarehouseDB session proxy |
| Camera | html5-qrcode (requires HTTPS or localhost) |

## PWA

Add to home screen from Safari (iOS) or Chrome (Android). Icons use the teal brand with a Lucide-style scan frame.

## Environment

Copy `.env.example` to `.env`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `WAREHOUSE_URL` | `http://127.0.0.1:8000` | WarehouseDB server |
| `SCAN_SECRET_KEY` | dev secret | Flask session signing |
| `SCAN_BACKEND_URL` | `http://127.0.0.1:5003` | Used by Next API proxy |
| `SCAN_PORT` | `5002` | Production PWA port |
| `SCAN_HOST` | `0.0.0.0` | Production bind address |
