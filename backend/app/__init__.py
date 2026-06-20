"""Scan API application factory."""
import os

from flask import Flask

from config import Config
from app.clients.warehouse import StaffWarehouseClient
from app.database import init_app as init_db
from app.routes.api import api_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    if (
        app.config["SECRET_KEY"] == Config.DEFAULT_SECRET_KEY
        and os.environ.get("FLASK_ENV", "development").lower() == "production"
    ):
        raise RuntimeError(
            "Refusing to start in production with the default SCAN_SECRET_KEY. "
            "Set a strong SCAN_SECRET_KEY in Warehouse_scan/.env."
        )
    # Direct assignment, not setdefault: Flask pre-populates this key with None,
    # so setdefault would never apply "Lax".
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config.setdefault("SESSION_COOKIE_HTTPONLY", True)
    app.config.setdefault("SESSION_COOKIE_PATH", "/")
    app.config.setdefault("SESSION_COOKIE_NAME", "session")
    os.makedirs(app.config["SCAN_INSTANCE_PATH"], exist_ok=True)
    init_db(app)
    app.extensions["warehouse_client"] = StaffWarehouseClient(
        app.config["WAREHOUSE_URL"],
        app.config["SCAN_API_KEY"],
    )
    app.register_blueprint(api_bp)
    return app
