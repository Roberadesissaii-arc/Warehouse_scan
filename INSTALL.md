# Installing Warehouse Floor Scan

Mobile PWA for warehouse staff — scan items, queue robot picks, and manage floor tasks.

**Requirements:** Linux server or Raspberry Pi (Debian/Ubuntu), Python 3.10+, Node.js 18+, and
**WarehouseDB** running on port 8000 (installed automatically with `--with-warehouse`).

## Quick install

Run this **once** after cloning — it installs everything and keeps the app
running on every reboot:

```bash
git clone <your-repo-url> warehouse     # or copy the project onto the server
cd warehouse/Warehouse_scan             # the folder that holds install.sh
chmod +x install.sh run.sh start.sh
./install.sh
```

This will:

1. Ask for **sudo** (apt update/upgrade, Node, cloudflared, Docker optional)
2. Pick free ports starting at **5002** (PWA) and **5003** (API)
3. Create `.env`, virtualenv, build the production PWA
4. Install and **start systemd** (`systemctl enable --now`) — UI + API run
   together, **start immediately and again automatically on every boot**, and
   restart on crash

> You run `install.sh` **once**. After that the PWA is always on — **you never
> start it manually**.

```bash
./install.sh --with-warehouse   # also install WarehouseDB on this machine
./install.sh --no-service       # install only, start with ./run.sh
./install.sh --docker           # Docker instead of native
```

## Start manually (console)

```bash
./run.sh
```

Open **http://\<server-ip\>:5002** on a phone and use **Add to Home Screen** for the PWA.

First run: there is no preset account. The sign-in screen shows a one-time
**setup** form — create the owner username and password (min 8 characters, with
at least one letter and one number). Do this immediately so nobody else can
claim the owner account. You can change the credentials later in **Account**.

## Auto-start on boot (systemd)

**Default:** `./install.sh` already enables `warehouse-scan.service`.

```bash
systemctl status warehouse-scan
journalctl -u warehouse-scan -f
```

With WarehouseDB on the same host:

```bash
./install.sh --with-warehouse
systemctl status warehousedb
```

## Install options

| Flag | Purpose |
|------|---------|
| *(default)* | Native install + systemd (PWA + API together) |
| `--with-warehouse` | Also run `../WarehouseDB/install.sh` |
| `--no-service` | Skip systemd — use `./run.sh` manually |
| `--docker` | Install Docker and run `docker compose up -d` |

Re-run `./install.sh` anytime to refresh dependencies and rebuild after code updates.

**Cloudflare tunnel** (optional public domain): `deploy/CLOUDFLARE-TUNNEL.md`

## Environment (`Warehouse_scan/.env`)

Created on first install. Key variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `WAREHOUSE_URL` | `http://127.0.0.1:8000` | WarehouseDB API |
| `SCAN_SECRET_KEY` | *(generated)* | Staff session signing |
| `SCAN_PORT` | `5002` | PWA port (phones connect here) |
| `SCAN_HOST` | `0.0.0.0` | Bind address for PWA |
| `SCAN_API_PORT` | `5003` | Internal Flask API (proxied by Next.js) |

For QR codes on item labels to open correctly on phones, set `SCAN_PUBLIC_URL` in
WarehouseDB's `instance/warehousedb.env` to your LAN URL, e.g. `http://192.168.1.10:5002`.

## LAN / HTTPS notes

- On a private garage network, HTTP is typical.
- Camera scanning requires **HTTPS or localhost** in most mobile browsers.
- For HTTPS, put nginx or Caddy in front of port 5002 and set `SESSION_COOKIE_SECURE=true`
  in warehouse env if needed.

## License

MIT — see `LICENSE` and `THIRD_PARTY_LICENSES.md`.
