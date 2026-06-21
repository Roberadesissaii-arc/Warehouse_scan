from flask import Blueprint, current_app, jsonify, request, session

from ..clients.warehouse import WarehouseError
from ..models import staff
from ..services import rate_limit
from ..services.auth import get_staff_user_id, get_staff_username, proxy_request, require_staff
from ..services.scan_parser import parse_scan_payload

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.get("/health")
def health():
    # Public liveness probe — keep it free of paths, URLs, and other internals.
    return jsonify(ok=True, app="scan-api")


@api_bp.get("/config")
def app_config():
    return jsonify(
        app_name="Warehouse Scan",
        version="1.0.0",
        warehouse_url=current_app.config["WAREHOUSE_URL"],
    )


@api_bp.get("/auth/status")
def auth_status():
    return jsonify(
        needs_setup=staff.needs_setup(),
        signed_in=bool(get_staff_user_id()),
    )


@api_bp.get("/me")
def me():
    user_id = get_staff_user_id()
    if not user_id:
        return jsonify(signed_in=False, username=None, remember_device=False)
    row = staff.get_by_id(user_id)
    if not row:
        session.clear()
        return jsonify(signed_in=False, username=None, remember_device=False)
    return jsonify(
        signed_in=True,
        username=row["username"],
        first_name=row["first_name"] or "",
        last_name=row["last_name"] or "",
        email=row["email"] or "",
        remember_device=bool(session.permanent),
    )


@api_bp.post("/auth/setup")
def setup_account():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    confirm = body.get("confirm_password") or ""
    if not username or not password:
        return jsonify(error="Username and password are required"), 400
    if confirm and password != confirm:
        return jsonify(error="The two passwords do not match"), 400
    if not staff.needs_setup():
        return jsonify(error="This Scan server already has an owner account"), 403
    try:
        row = staff.setup_owner(
            username,
            password,
            first_name=body.get("first_name") or "",
            last_name=body.get("last_name") or "",
            email=body.get("email") or "",
        )
    except ValueError as exc:
        return jsonify(error=str(exc)), 400
    remember = bool(body.get("remember_device"))
    session.clear()
    session.permanent = remember
    session["staff_user_id"] = row["id"]
    session["staff_username"] = row["username"]
    return jsonify(signed_in=True, username=row["username"], remember_device=remember), 201


@api_bp.post("/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    if not username or not password:
        return jsonify(error="Username and password are required"), 400

    if staff.needs_setup():
        return jsonify(error="Create your Scan account first — this server has no owner yet."), 403

    throttle_key = f"login:{username.lower()}"
    locked_for = rate_limit.seconds_until_unlocked(throttle_key)
    if locked_for:
        resp = jsonify(error="Too many failed sign-in attempts. Wait a few minutes and try again.")
        resp.headers["Retry-After"] = str(locked_for)
        return resp, 429

    row = staff.verify(username, password)
    if not row:
        rate_limit.record_failure(throttle_key)
        return jsonify(error="Invalid username or password. Check both fields and try again."), 401

    rate_limit.reset(throttle_key)
    remember = bool(body.get("remember_device"))
    session.clear()
    session.permanent = remember
    session["staff_user_id"] = row["id"]
    session["staff_username"] = row["username"]
    return jsonify(signed_in=True, username=row["username"], remember_device=remember)


@api_bp.post("/auth/remember")
def remember_device():
    denied = require_staff()
    if denied:
        return denied
    body = request.get_json(silent=True) or {}
    remember = bool(body.get("remember_device"))
    session.permanent = remember
    return jsonify(ok=True, remember_device=remember)


@api_bp.post("/auth/logout")
def logout():
    session.clear()
    return jsonify(ok=True)


@api_bp.put("/account")
def update_account():
    denied = require_staff()
    if denied:
        return denied
    body = request.get_json(silent=True) or {}
    user_id = get_staff_user_id()
    if not user_id:
        return jsonify(error="Sign in required"), 401
    try:
        updated = staff.update_credentials(
            user_id,
            username=(body.get("username") or "").strip(),
            current_password=body.get("current_password") or "",
            new_password=(body.get("new_password") or "").strip() or None,
            first_name=body.get("first_name"),
            last_name=body.get("last_name"),
            email=body.get("email"),
        )
    except ValueError as exc:
        return jsonify(error=str(exc)), 400
    session["staff_username"] = updated["username"]
    return jsonify(
        ok=True,
        username=updated["username"],
        first_name=updated["first_name"] or "",
        last_name=updated["last_name"] or "",
        email=updated["email"] or "",
    )


@api_bp.get("/bootstrap")
def bootstrap():
    denied = require_staff()
    if denied:
        return denied
    client = current_app.extensions["warehouse_client"]
    try:
        data, status = client.request("GET", "/api/bootstrap", staff_username=get_staff_username())
        if isinstance(data, dict):
            data["warehouse_connected"] = True
        return jsonify(data), status
    except WarehouseError as exc:
        return jsonify(
            tasks=[],
            robots=[],
            items=[],
            warehouse_connected=False,
            message="WarehouseDB is not connected — tasks and inventory will appear when it is online.",
            error=str(exc),
        )


@api_bp.post("/resolve")
def resolve_scan():
    denied = require_staff()
    if denied:
        return denied

    body = request.get_json(silent=True) or {}
    try:
        parsed = parse_scan_payload(body.get("code") or body.get("raw") or "")
    except ValueError as exc:
        return jsonify(error=str(exc)), 400

    client = current_app.extensions["warehouse_client"]
    try:
        if parsed["kind"] == "item_id":
            data, status = client.request(
                "GET",
                f"/api/items/{parsed['item_id']}",
                staff_username=get_staff_username(),
            )
        else:
            from urllib.parse import quote

            sku = quote(parsed["sku"], safe="")
            data, status = client.request(
                "GET",
                f"/api/items/by-sku/{sku}",
                staff_username=get_staff_username(),
            )
    except WarehouseError as exc:
        return jsonify(error=str(exc)), exc.status

    return jsonify(item=data, parsed=parsed), status


@api_bp.get("/items/<int:item_id>")
def get_item(item_id):
    return proxy_request("GET", f"/api/items/{item_id}", current_app.extensions["warehouse_client"])


@api_bp.get("/tasks")
def list_tasks():
    return proxy_request("GET", "/api/tasks", current_app.extensions["warehouse_client"])


@api_bp.get("/tasks/<int:task_id>")
def get_task(task_id):
    return proxy_request("GET", f"/api/tasks/{task_id}", current_app.extensions["warehouse_client"])


@api_bp.post("/tasks")
def create_task():
    return proxy_request(
        "POST",
        "/api/tasks",
        current_app.extensions["warehouse_client"],
        json=request.get_json(silent=True) or {},
    )


@api_bp.post("/tasks/<int:task_id>/accept")
def accept_task(task_id):
    return proxy_request(
        "POST",
        f"/api/tasks/{task_id}/accept",
        current_app.extensions["warehouse_client"],
        json={},
    )


@api_bp.post("/tasks/<int:task_id>/fulfill")
def fulfill_task(task_id):
    return proxy_request(
        "POST",
        f"/api/tasks/{task_id}/fulfill",
        current_app.extensions["warehouse_client"],
        json={},
    )


@api_bp.get("/robots")
def list_robots():
    return proxy_request("GET", "/api/robots", current_app.extensions["warehouse_client"])


@api_bp.get("/notifications")
def list_notifications():
    return proxy_request("GET", "/api/notifications", current_app.extensions["warehouse_client"])


@api_bp.get("/notifications/unread-count")
def notifications_unread_count():
    return proxy_request("GET", "/api/notifications/unread-count", current_app.extensions["warehouse_client"])


@api_bp.put("/notifications/<int:notification_id>/read")
def notification_read(notification_id):
    return proxy_request(
        "PUT",
        f"/api/notifications/{notification_id}/read",
        current_app.extensions["warehouse_client"],
    )


@api_bp.put("/notifications/read-all")
def notifications_read_all():
    return proxy_request("PUT", "/api/notifications/read-all", current_app.extensions["warehouse_client"])


@api_bp.delete("/notifications/clear-all")
def notifications_clear_all():
    return proxy_request("DELETE", "/api/notifications/clear-all", current_app.extensions["warehouse_client"])
