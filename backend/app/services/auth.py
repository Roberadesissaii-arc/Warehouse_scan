from flask import jsonify, session

from ..clients.warehouse import WarehouseError


def get_staff_user_id() -> int | None:
    user_id = session.get("staff_user_id")
    return int(user_id) if user_id else None


def get_staff_username() -> str | None:
    name = (session.get("staff_username") or "").strip()
    return name or None


def require_staff():
    if not get_staff_user_id():
        return jsonify(error="Sign in required", signed_in=False), 401
    return None


def empty_warehouse_payload(message: str, error: str):
    return {
        "tasks": [],
        "robots": [],
        "items": [],
        "warehouse_connected": False,
        "message": message,
        "error": error,
    }


def proxy_request(method: str, path: str, client, **kwargs):
    denied = require_staff()
    if denied:
        return denied
    try:
        data, status = client.request(
            method,
            path,
            staff_username=get_staff_username(),
            **kwargs,
        )
        if isinstance(data, dict) and method == "GET":
            data["warehouse_connected"] = True
        return jsonify(data), status
    except WarehouseError as exc:
        if method == "GET":
            return jsonify(
                empty_warehouse_payload(
                    "WarehouseDB is not connected — showing an empty floor until it is online.",
                    str(exc),
                )
            )
        return jsonify(error=str(exc)), exc.status
