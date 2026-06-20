"""Scan floor staff accounts (scan/instance/scan.db only)."""
import re

from werkzeug.security import check_password_hash, generate_password_hash

from ..database import get_db

DEFAULT_USERNAME = "admin"
DEFAULT_PASSWORD = "admin1234"

# Used to equalize verify() timing when a username does not exist, so response
# time can't be used to enumerate valid usernames.
_DUMMY_HASH = generate_password_hash("timing-equalizer-not-a-real-password")


def validate_password(password: str) -> None:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise ValueError("Password must include at least one letter and one number")


def ensure_default_staff():
    """Legacy no-op — first account is created on the setup screen."""
    return


def needs_setup() -> bool:
    return get_db().execute("SELECT COUNT(*) c FROM staff_users").fetchone()["c"] == 0


def setup_owner(username: str, password: str):
    if not needs_setup():
        raise ValueError("An account already exists for this Scan server.")
    username = (username or "").strip()
    if not username:
        raise ValueError("Username is required")
    validate_password(password)
    db = get_db()
    db.execute(
        "INSERT INTO staff_users(username, password_hash) VALUES(?,?)",
        (username, generate_password_hash(password)),
    )
    db.commit()
    return get_by_username(username)


def get_by_username(username: str):
    return get_db().execute(
        "SELECT * FROM staff_users WHERE username=?",
        ((username or "").strip(),),
    ).fetchone()


def list_usernames():
    rows = get_db().execute("SELECT username FROM staff_users ORDER BY username").fetchall()
    return [row["username"] for row in rows]


def verify(username: str, password: str):
    username = (username or "").strip()
    if not username:
        return None
    row = get_db().execute(
        "SELECT * FROM staff_users WHERE username=?",
        (username,),
    ).fetchone()
    if not row:
        check_password_hash(_DUMMY_HASH, password)  # equalize timing
        return None
    if not check_password_hash(row["password_hash"], password):
        return None
    return row


def get_by_id(user_id: int):
    return get_db().execute("SELECT * FROM staff_users WHERE id=?", (user_id,)).fetchone()


def update_credentials(user_id: int, *, username: str, current_password: str, new_password: str | None = None):
    row = get_by_id(user_id)
    if not row or not check_password_hash(row["password_hash"], current_password):
        raise ValueError("Current password is incorrect")
    username = (username or "").strip()
    if not username:
        raise ValueError("Username is required")
    if new_password:
        validate_password(new_password)
    db = get_db()
    other = db.execute(
        "SELECT id FROM staff_users WHERE username=? AND id<>?",
        (username, user_id),
    ).fetchone()
    if other:
        raise ValueError("That username is already taken")
    password_hash = generate_password_hash(new_password) if new_password else row["password_hash"]
    db.execute(
        "UPDATE staff_users SET username=?, password_hash=? WHERE id=?",
        (username, password_hash, user_id),
    )
    db.commit()
    return get_by_id(user_id)


def reset_staff_password(username: str, password: str, *, create_if_missing: bool = False):
    username = (username or "").strip()
    if not username:
        raise ValueError("Username is required")
    validate_password(password)
    db = get_db()
    row = db.execute("SELECT * FROM staff_users WHERE username=?", (username,)).fetchone()
    if not row:
        count = db.execute("SELECT COUNT(*) c FROM staff_users").fetchone()["c"]
        if create_if_missing and count == 0:
            db.execute(
                "INSERT INTO staff_users(username, password_hash) VALUES(?,?)",
                (username, generate_password_hash(password)),
            )
            db.commit()
            return "created"
        raise ValueError(f"No user named {username!r}")
    db.execute(
        "UPDATE staff_users SET password_hash=? WHERE id=?",
        (generate_password_hash(password), row["id"]),
    )
    db.commit()
    return "updated"
