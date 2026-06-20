# Warehouse Scan — scripts

Operator tools for the Scan PWA server (floor staff in `scan.db`).

**Full guide:** [DOCUMENTATION.md](DOCUMENTATION.md) — users, warehouse connection, events, troubleshooting.

**First sign-in:** no preset login. The sign-in page creates the one owner account when `scan.db` has no staff users.

## Quick start

```powershell
cd Warehouse_scan
python scripts/debug.py status
python scripts/debug.py users list
python scripts/debug.py users verify <username> -p "your-password"
python scripts/debug.py warehouse ping
```

## Files

| File | Purpose |
|------|---------|
| `debug.py` | Main debug CLI |
| `DOCUMENTATION.md` | **How-to documentation** |
| `reset_staff_password.py` | Password reset shortcut |

Warehouse board staff (port 8000) → `WarehouseDB/scripts/DOCUMENTATION.md`
