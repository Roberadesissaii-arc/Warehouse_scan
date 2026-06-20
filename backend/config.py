import os
from datetime import timedelta
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    def load_dotenv(*_args, **_kwargs):
        return False

BACKEND_ROOT = Path(__file__).resolve().parent
SCAN_ROOT = BACKEND_ROOT.parent
load_dotenv(SCAN_ROOT / ".env")


def _env_flag(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


class Config:
    DEFAULT_SECRET_KEY = "scan-dev-secret"
    SECRET_KEY = os.environ.get("SCAN_SECRET_KEY", DEFAULT_SECRET_KEY)
    # Send the session cookie only over HTTPS. Leave off for plain-HTTP LAN
    # deployments; set SCAN_COOKIE_SECURE=true when serving behind HTTPS.
    SESSION_COOKIE_SECURE = _env_flag("SCAN_COOKIE_SECURE", False)
    WAREHOUSE_URL = os.environ.get("WAREHOUSE_URL", "http://127.0.0.1:8000").rstrip("/")
    SCAN_API_KEY = os.environ.get("SCAN_API_KEY", "scan-dev-key")
    SCAN_INSTANCE_PATH = os.environ.get(
        "SCAN_INSTANCE_PATH",
        str(SCAN_ROOT / "instance"),
    )
    DATABASE = os.environ.get(
        "SCAN_DATABASE",
        str(Path(SCAN_INSTANCE_PATH) / "scan.db"),
    )
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)
    DEBUG = os.environ.get("FLASK_ENV", "development").lower() != "production"
    HOST = os.environ.get("SCAN_API_HOST", "127.0.0.1")
    PORT = int(os.environ.get("SCAN_API_PORT", "5003"))
