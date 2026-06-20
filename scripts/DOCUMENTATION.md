# Warehouse Scan scripts — documentation

Operator and debug tools for the **Scan PWA server** (`Warehouse_scan/`). Use these for floor staff logins in `scan.db`, local audit logs, and checking the connection to WarehouseDB.

---

## Before you start

1. Open a terminal.
2. Go to the Scan app folder:

```powershell
cd path\to\test\Warehouse_scan
```

3. Use **Python 3.10+**.
4. Install Scan API dependencies:

```powershell
pip install -r requirements.txt
```

5. Built-in help:

```powershell
python scripts/debug.py --help
python scripts/debug.py users --help
python scripts/debug.py warehouse --help
```

---

## Two different “users” (important)

| Login | Database | Tool |
|-------|----------|------|
| **Scan sign-in** (floor PWA) | `Warehouse_scan/instance/scan.db` | This folder |
| **Warehouse board** (browser UI on port 8000) | `WarehouseDB/instance/warehouse.db` | `WarehouseDB/scripts/` |

Scan staff passwords live **only** in `scan.db` unless you also use the warehouse web UI on the same machine.

---

## Database this folder touches

| File | Table | Purpose |
|------|-------|---------|
| `instance/scan.db` | `staff_users` | Scan sign-in usernames/passwords |
| `instance/scan.db` | `scan_events` | Optional scan audit log |
| `instance/scan.db` | `scan_meta` | App metadata |

Products, tasks, and robots come from **WarehouseDB over HTTP** (`WAREHOUSE_URL` + `SCAN_API_KEY`). Scan never opens `warehouse.db` on disk.

---

## Environment (`.env` in `Warehouse_scan/`)

| Variable | Purpose |
|----------|---------|
| `WAREHOUSE_URL` | Warehouse API base (e.g. `http://192.168.1.10:8000`) |
| `SCAN_API_KEY` | Must match `SCAN_API_KEY` on WarehouseDB |
| `SCAN_SECRET_KEY` | Session cookie signing for Scan |
| `SCAN_DATABASE` | Override path to `scan.db` (optional) |

Check what is loaded:

```powershell
python scripts/debug.py env
```

---

## Main tool: `debug.py`

```powershell
python scripts/debug.py <command> [options]
```

### `status`

```powershell
python scripts/debug.py status
```

Shows scan root, API port (default **5003**), database path, setup needed, staff count, and warehouse URL.

---

### `env`

Masked view of secrets and URLs.

```powershell
python scripts/debug.py env
```

---

### `db`

Row counts for `staff_users`, `scan_events`, `scan_meta`.

```powershell
python scripts/debug.py db
```

---

### `users` — Scan staff (local `scan.db`)

Run `users list` after first sign-in — the username is whatever you chose on the setup screen (no preset login).

#### List usernames

```powershell
python scripts/debug.py users list
```

#### Show one account

```powershell
python scripts/debug.py users show <username>
```

#### Verify password (no change)

```powershell
python scripts/debug.py users verify <username> -p "your-password"
```

Or prompt for password:

```powershell
python scripts/debug.py users verify <username>
```

#### Reset password

```powershell
python scripts/debug.py users reset <username> -p "NewPass123"
```

First account on empty database:

```powershell
python scripts/debug.py users reset <username> -p "NewPass123" --create-if-missing
```

**Password rules:** 8+ characters, at least one letter and one number.

**First sign-in:** no preset username or password. The sign-in page creates the one owner account when the database is empty. Use `users list` to see the username after setup.

---

### `warehouse` — connection to WarehouseDB

#### Ping health endpoint

```powershell
python scripts/debug.py warehouse ping
```

Expect `OK` and JSON fields from `GET /api/health`. If this fails, check `WAREHOUSE_URL`, firewall, and that WarehouseDB is running.

#### Bootstrap (tasks / robots / items)

```powershell
python scripts/debug.py warehouse bootstrap
```

Calls `GET /api/bootstrap` with the scan API key. Shows how many tasks, robots, and items the warehouse returned.

**Use when:** Scan UI shows empty data but sign-in works — often warehouse offline or wrong API key.

---

### `events` — local scan log

```powershell
python scripts/debug.py events list
python scripts/debug.py events list --limit 30
```

---

## Legacy script: `reset_staff_password.py`

Same as `debug.py users reset`:

```powershell
python scripts/reset_staff_password.py --list
python scripts/reset_staff_password.py --username <username> --password "NewPass123"
```

---

## Common tasks

| I want to… | Command |
|------------|---------|
| List Scan sign-in users | `python scripts/debug.py users list` |
| Forgot Scan password | `python scripts/debug.py users reset <username> -p "NewPass123"` |
| Test if password is correct | `python scripts/debug.py users verify <username> -p "…"` |
| Scan app says warehouse offline | `python scripts/debug.py warehouse ping` |
| See if warehouse returns tasks | `python scripts/debug.py warehouse bootstrap` |
| Check which `.env` values load | `python scripts/debug.py env` |

---

## Troubleshooting

**`users verify` fails but you expect it to work**

- Confirm username with `users list`.
- Password is case-sensitive.
- You may be thinking of WarehouseDB staff — that is a separate app and database on port 8000.

**`warehouse ping` fails**

- Start WarehouseDB: `cd WarehouseDB && python run.py`
- Match `SCAN_API_KEY` in `Warehouse_scan/.env` with `WarehouseDB/.env`
- On another PC, set `WAREHOUSE_URL` to the warehouse machine IP (not `127.0.0.1`)

---

## Related documentation

- Warehouse staff / inventory: `WarehouseDB/scripts/DOCUMENTATION.md`
- Store customers: `Warehouse_store/scripts/DOCUMENTATION.md`
- Install Scan on a server: `Warehouse_scan/INSTALL.md`
