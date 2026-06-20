#!/usr/bin/env python3
"""Warehouse Scan operator/debug CLI — staff users, local DB, warehouse API."""
from __future__ import annotations

import argparse
import getpass
import os
import sqlite3
import sys
from pathlib import Path

SCAN_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = SCAN_ROOT / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app import create_app  # noqa: E402
from app.clients.warehouse import StaffWarehouseClient, WarehouseError  # noqa: E402
from app.models import staff  # noqa: E402


def _mask(value: str | None, show: int = 12) -> str:
    if not value:
        return "(not set)"
    if len(value) <= show:
        return value
    return f"{value[:show]}… ({len(value)} chars)"


def _db_path(app) -> Path:
    return Path(app.config["DATABASE"])


def _db_size(path: Path) -> str:
    if not path.is_file():
        return "missing"
    kb = path.stat().st_size / 1024
    return f"{kb:.1f} KB"


def _table_counts(db_path: Path, tables: list[str]) -> list[tuple[str, int | str]]:
    if not db_path.is_file():
        return [(t, "—") for t in tables]
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    out: list[tuple[str, int | str]] = []
    for name in tables:
        try:
            n = conn.execute(f"SELECT COUNT(*) c FROM {name}").fetchone()["c"]
            out.append((name, int(n)))
        except sqlite3.Error:
            out.append((name, "missing"))
    conn.close()
    return out


def _warehouse_client(app) -> StaffWarehouseClient:
    return StaffWarehouseClient(app.config["WAREHOUSE_URL"], app.config["SCAN_API_KEY"])


def cmd_status(app) -> int:
    cfg = app.config
    db = _db_path(app)
    print("=== Warehouse Scan status ===")
    print(f"Scan root:      {SCAN_ROOT}")
    print(f"FLASK_ENV:      {os.environ.get('FLASK_ENV', 'development')}")
    print(f"API host:port:  {cfg.get('HOST')}:{cfg.get('PORT')}")
    print(f"Database:       {db}")
    print(f"DB size:        {_db_size(db)}")
    print(f"Setup needed:   {staff.needs_setup()}")
    print(f"Staff count:    {len(staff.list_usernames())}")
    print(f"Warehouse URL:  {cfg.get('WAREHOUSE_URL')}")
    return 0


def cmd_env(app) -> int:
    cfg = app.config
    print("=== Scan environment ===")
    print(f"SCAN_SECRET_KEY: {_mask(cfg.get('SECRET_KEY'))}")
    print(f"SCAN_API_KEY:    {_mask(cfg.get('SCAN_API_KEY'))}")
    print(f"WAREHOUSE_URL:   {cfg.get('WAREHOUSE_URL')}")
    print(f"SCAN_DATABASE:   {cfg.get('DATABASE')}")
    return 0


def cmd_db(app) -> int:
    db = _db_path(app)
    tables = ["staff_users", "scan_events", "scan_meta"]
    print(f"=== Database: {db} ===")
    print(f"Size: {_db_size(db)}")
    print("Table rows:")
    for name, count in _table_counts(db, tables):
        print(f"  {name:16} {count}")
    return 0


def cmd_events_list(app, limit: int) -> int:
    db = _db_path(app)
    if not db.is_file():
        print("Database missing.", file=sys.stderr)
        return 1
    conn = sqlite3.connect(db)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT id, kind, staff_username, created_at
        FROM scan_events
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    conn.close()
    if not rows:
        print("No scan events logged.")
        return 0
    print(f"Last {len(rows)} scan events:")
    for row in rows:
        print(f"  #{row['id']} {row['created_at']} [{row['kind']}] staff={row['staff_username'] or '—'}")
    return 0


def cmd_warehouse_ping(app) -> int:
    client = _warehouse_client(app)
    url = app.config["WAREHOUSE_URL"]
    try:
        data = client.health()
    except WarehouseError as exc:
        print(f"FAIL — cannot reach warehouse at {url}")
        print(f"       {exc}", file=sys.stderr)
        return 1
    print(f"OK — warehouse health at {url}")
    for key in sorted(data):
        print(f"  {key}: {data[key]}")
    return 0


def cmd_warehouse_bootstrap(app) -> int:
    client = _warehouse_client(app)
    url = app.config["WAREHOUSE_URL"]
    try:
        data, status = client.request("GET", "/api/bootstrap", staff_username="debug-cli")
    except WarehouseError as exc:
        print(f"FAIL — bootstrap at {url}")
        print(f"       {exc}", file=sys.stderr)
        return 1
    print(f"OK — bootstrap HTTP {status}")
    tasks = data.get("tasks") if isinstance(data.get("tasks"), list) else []
    robots = data.get("robots") if isinstance(data.get("robots"), list) else []
    items = data.get("items") if isinstance(data.get("items"), list) else []
    print(f"  tasks:  {len(tasks)}")
    print(f"  robots: {len(robots)}")
    print(f"  items:  {len(items)}")
    if data.get("warehouse_connected") is False or data.get("message"):
        print(f"  note:   {data.get('message') or 'warehouse_connected=false'}")
    return 0


def cmd_users_list(_app) -> int:
    names = staff.list_usernames()
    if not names:
        print("No scan staff accounts.")
        return 0
    print("Scan staff accounts (local scan.db):")
    for name in names:
        print(f"  - {name}")
    return 0


def cmd_users_show(_app, username: str) -> int:
    row = staff.get_by_username(username)
    if not row:
        print(f"No user named {username!r}", file=sys.stderr)
        return 1
    print(f"id:         {row['id']}")
    print(f"username:   {row['username']}")
    print(f"created_at: {row.get('created_at', '—')}")
    print(f"hash:       {_mask(row['password_hash'], 16)}")
    return 0


def cmd_users_verify(_app, username: str, password: str | None) -> int:
    if not password:
        password = getpass.getpass("Password to test: ")
    ok = staff.verify(username, password)
    if ok:
        print(f"OK — password matches {username!r} (id={ok['id']})")
        return 0
    print(f"FAIL — password does not match {username!r}", file=sys.stderr)
    return 1


def cmd_users_reset(_app, username: str, password: str | None, create_if_missing: bool) -> int:
    if not password:
        password = getpass.getpass("New password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords do not match.", file=sys.stderr)
            return 1
    try:
        action = staff.reset_staff_password(username, password, create_if_missing=create_if_missing)
    except ValueError as exc:
        print(exc, file=sys.stderr)
        return 1
    print(f"Scan staff account {action}: {username}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Warehouse Scan debug / operator tools")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("status", help="App and database summary")
    sub.add_parser("env", help="Loaded config (secrets masked)")
    sub.add_parser("db", help="SQLite file and table row counts")

    events = sub.add_parser("events", help="Local scan audit log")
    events_sub = events.add_subparsers(dest="events_cmd", required=True)
    events_list = events_sub.add_parser("list", help="Recent scan events")
    events_list.add_argument("--limit", type=int, default=15)

    wh = sub.add_parser("warehouse", help="WarehouseDB HTTP checks")
    wh_sub = wh.add_subparsers(dest="wh_cmd", required=True)
    wh_sub.add_parser("ping", help="GET /api/health")
    wh_sub.add_parser("bootstrap", help="GET /api/bootstrap (tasks/robots/items)")

    users = sub.add_parser("users", help="Scan staff account tools")
    users_sub = users.add_subparsers(dest="users_cmd", required=True)
    users_sub.add_parser("list", help="List staff usernames")
    show_p = users_sub.add_parser("show", help="Show one staff account")
    show_p.add_argument("username")
    verify_p = users_sub.add_parser("verify", help="Test username/password")
    verify_p.add_argument("username")
    verify_p.add_argument("-p", "--password")
    reset_p = users_sub.add_parser("reset", help="Reset staff password")
    reset_p.add_argument("username")
    reset_p.add_argument("-p", "--password")
    reset_p.add_argument("--create-if-missing", action="store_true")

    args = parser.parse_args()
    app = create_app()

    with app.app_context():
        if args.command == "status":
            return cmd_status(app)
        if args.command == "env":
            return cmd_env(app)
        if args.command == "db":
            return cmd_db(app)
        if args.command == "events" and args.events_cmd == "list":
            return cmd_events_list(app, args.limit)
        if args.command == "warehouse":
            if args.wh_cmd == "ping":
                return cmd_warehouse_ping(app)
            if args.wh_cmd == "bootstrap":
                return cmd_warehouse_bootstrap(app)
        if args.command == "users":
            if args.users_cmd == "list":
                return cmd_users_list(app)
            if args.users_cmd == "show":
                return cmd_users_show(app, args.username)
            if args.users_cmd == "verify":
                return cmd_users_verify(app, args.username, args.password)
            if args.users_cmd == "reset":
                return cmd_users_reset(app, args.username, args.password, args.create_if_missing)

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
