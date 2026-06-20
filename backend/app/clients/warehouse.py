"""HTTP client for WarehouseDB — server-to-server via X-Scan-Key (no shared database)."""
from __future__ import annotations

import requests


class WarehouseError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


class StaffWarehouseClient:
    def __init__(self, base_url: str, api_key: str, timeout: int = 20):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def _headers(self, staff_username: str | None = None) -> dict[str, str]:
        headers = {"X-Scan-Key": self.api_key}
        if staff_username:
            headers["X-Scan-Staff"] = staff_username
        return headers

    def request(self, method: str, path: str, staff_username: str | None = None, **kwargs):
        url = f"{self.base_url}{path}"
        kwargs.setdefault("timeout", self.timeout)
        headers = dict(kwargs.pop("headers", {}) or {})
        headers.update(self._headers(staff_username))
        try:
            res = requests.request(method, url, headers=headers, **kwargs)
        except requests.RequestException as exc:
            raise WarehouseError(f"Cannot reach warehouse at {self.base_url}") from exc

        data = {}
        if res.content:
            try:
                data = res.json()
            except ValueError:
                data = {}

        if not res.ok:
            raise WarehouseError(data.get("error") or res.reason or "Request failed", res.status_code)
        return data, res.status_code

    def health(self):
        data, _status = self.request("GET", "/api/health")
        return data
