"""Parse QR / manual codes into warehouse item lookups."""
from __future__ import annotations

import re
from urllib.parse import urlparse

ITEM_URL_RE = re.compile(r"/i(?:tems)?/(\d+)(?:/|$)", re.I)
API_ITEM_RE = re.compile(r"/api/items/(\d+)(?:/|$)", re.I)
WH_ITEM_RE = re.compile(r"^WH:ITEM:(\d+)$", re.I)
WH_SKU_RE = re.compile(r"^WH:SKU:(.+)$", re.I)
NUMERIC_RE = re.compile(r"^\d+$")


def parse_scan_payload(raw: str) -> dict:
    text = (raw or "").strip()
    if not text:
        raise ValueError("Enter a code or scan a label")

    wh_item = WH_ITEM_RE.match(text)
    if wh_item:
        return {"kind": "item_id", "item_id": int(wh_item.group(1))}

    wh_sku = WH_SKU_RE.match(text)
    if wh_sku:
        return {"kind": "sku", "sku": wh_sku.group(1).strip()}

    if NUMERIC_RE.match(text):
        return {"kind": "item_id", "item_id": int(text)}

    if "://" in text or text.startswith("/"):
        path = urlparse(text).path if "://" in text else text
        for pattern in (ITEM_URL_RE, API_ITEM_RE):
            match = pattern.search(path)
            if match:
                return {"kind": "item_id", "item_id": int(match.group(1))}

    if len(text) >= 2:
        return {"kind": "sku", "sku": text}

    raise ValueError("Unrecognized code — try scanning the item QR on the shelf")
