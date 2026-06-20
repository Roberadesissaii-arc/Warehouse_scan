# Warehouse Scan — architecture

Floor PWA for staff: sign-in, QR scan, tasks, fleet. Talks to **WarehouseDB** over HTTP only.

| Piece | Port | Database |
|-------|------|----------|
| Next.js UI | 5002 | — |
| Flask API | 5003 | `instance/scan.db` (floor staff) |

Inventory and robots are **not** stored here — they come from WarehouseDB via `WAREHOUSE_URL` + `SCAN_API_KEY`.

Ecosystem overview: [../WarehouseDB/ARCHITECTURE.md](../WarehouseDB/ARCHITECTURE.md)

## Run (development)

```powershell
.\dev.ps1
```

## Configuration

Copy [.env.example](.env.example) to `.env`.

License: [MIT](LICENSE)
