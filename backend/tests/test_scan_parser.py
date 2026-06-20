import unittest

from app.services.scan_parser import parse_scan_payload


class ScanParserTests(unittest.TestCase):
    def test_numeric_id(self):
        self.assertEqual(parse_scan_payload("42"), {"kind": "item_id", "item_id": 42})

    def test_wh_item_code(self):
        self.assertEqual(parse_scan_payload("WH:ITEM:7"), {"kind": "item_id", "item_id": 7})

    def test_sku_lookup(self):
        self.assertEqual(parse_scan_payload("WH:SKU:WDG-001"), {"kind": "sku", "sku": "WDG-001"})

    def test_scan_url(self):
        parsed = parse_scan_payload("http://192.168.1.10:5002/i/12")
        self.assertEqual(parsed, {"kind": "item_id", "item_id": 12})

    def test_warehouse_item_url(self):
        parsed = parse_scan_payload("https://warehouse.local/items/9")
        self.assertEqual(parsed, {"kind": "item_id", "item_id": 9})

    def test_empty_input(self):
        with self.assertRaises(ValueError):
            parse_scan_payload("")

    def test_unknown_code(self):
        with self.assertRaises(ValueError):
            parse_scan_payload("?")


if __name__ == "__main__":
    unittest.main()
