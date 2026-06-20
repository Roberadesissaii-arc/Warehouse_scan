#!/usr/bin/env python3
"""Reset Warehouse Scan floor staff password (scan/instance/scan.db only)."""
from __future__ import annotations

import argparse
import getpass
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app import create_app  # noqa: E402
from app.models import staff  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Reset Scan app staff password")
    parser.add_argument("--username", default=staff.DEFAULT_USERNAME, help="Staff username")
    parser.add_argument("--password", help="New password (prompted if omitted)")
    parser.add_argument("--create-if-missing", action="store_true", help="Create first account on empty database")
    parser.add_argument("--list", action="store_true", help="List scan staff usernames and exit")
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        if args.list:
            names = staff.list_usernames()
            if not names:
                print("No scan staff accounts in the local database.")
            else:
                print("Scan staff accounts (local to this Scan server):")
                for name in names:
                    print(f"  - {name}")
            print(f"Database: {app.config['DATABASE']}")
            print(f"Warehouse API: {app.config['WAREHOUSE_URL']} (products/tasks — not this database)")
            return 0

        password = args.password
        if not password:
            password = getpass.getpass("New password: ")
            confirm = getpass.getpass("Confirm password: ")
            if password != confirm:
                print("Passwords do not match.", file=sys.stderr)
                return 1

        try:
            action = staff.reset_staff_password(
                args.username,
                password,
                create_if_missing=args.create_if_missing,
            )
        except ValueError as exc:
            print(exc, file=sys.stderr)
            print("Tip: run with --list to see usernames in scan.db.", file=sys.stderr)
            return 1

        print(f"Scan staff account {action}: {args.username}")
        print(f"Database: {app.config['DATABASE']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
