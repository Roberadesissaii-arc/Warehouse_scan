"""Scan-local SQLite schema (separate from WarehouseDB)."""
from .connection import get_db


def ensure_schema():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS scan_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS scan_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kind TEXT NOT NULL,
            payload TEXT,
            staff_username TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS staff_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL DEFAULT '',
            last_name TEXT NOT NULL DEFAULT '',
            email TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        """
    )
    # Add profile columns to older staff_users tables.
    cols = {row[1] for row in db.execute("PRAGMA table_info(staff_users)").fetchall()}
    if "first_name" not in cols:
        db.execute("ALTER TABLE staff_users ADD COLUMN first_name TEXT NOT NULL DEFAULT ''")
    if "last_name" not in cols:
        db.execute("ALTER TABLE staff_users ADD COLUMN last_name TEXT NOT NULL DEFAULT ''")
    if "email" not in cols:
        db.execute("ALTER TABLE staff_users ADD COLUMN email TEXT NOT NULL DEFAULT ''")
    db.execute(
        "INSERT OR IGNORE INTO scan_meta(key, value) VALUES (?, ?)",
        ("app", "warehouse-scan"),
    )
    db.commit()
    from ..models import staff

    staff.ensure_default_staff()
