import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_categories_and_types():
    res = client.get("/api/found-items/categories/all")
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) >= 9
    cat_names = [c["name"] for c in categories]
    assert "อุปกรณ์อิเล็กทรอนิกส์" in cat_names
    assert "เครื่องเขียน" in cat_names

    # Check types for electronics
    elec_cat = next(c for c in categories if c["name"] == "อุปกรณ์อิเล็กทรอนิกส์")
    types_res = client.get(f"/api/found-items/types/by-category/{elec_cat['id']}")
    assert types_res.status_code == 200
    types = types_res.json()
    assert len(types) > 0
    type_names = [t["name"] for t in types]
    assert any("AirPods" in t for t in type_names)

def test_found_items_filtering():
    # Test keyword search
    res = client.get(
        "/api/found-items?keyword=AirPods",
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert any("AirPods" in item["item_name"] for item in items)

    # Test color filter
    res_color = client.get(
        "/api/found-items?color=ขาว",
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert res_color.status_code == 200
    for item in res_color.json():
        assert item["color"] == "ขาว"

def test_lost_reports_flow():
    # Create lost report
    create_res = client.post(
        "/api/lost-reports",
        json={
            "item_name": "นาฬิกาข้อมือ Casio สีดำ",
            "category_id": "c6666666-6666-6666-6666-666666666666",
            "item_type_id": "t601",
            "color": "ดำ",
            "brand": "Casio",
            "description": "สายเรซิน ลืมไว้ที่สระว่ายน้ำ",
            "last_known_location": "สระว่ายน้ำ โรงเรียน"
        },
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert create_res.status_code == 200
    report_id = create_res.json()["id"]

    # Retrieve list
    list_res = client.get(
        "/api/lost-reports",
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert list_res.status_code == 200
    assert any(r["id"] == report_id for r in list_res.json())

def test_admin_dashboard_and_users():
    # Admin stats
    stats_res = client.get(
        "/api/admin/stats",
        headers={"X-User-Id": "u-admin-0001"}
    )
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_found_items" in stats
    assert "total_lost_reports" in stats
    assert "total_members" in stats

    # Admin users list
    users_res = client.get(
        "/api/admin/users",
        headers={"X-User-Id": "u-admin-0001"}
    )
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 3

    # Student cannot access admin stats (403 Forbidden)
    unauth_res = client.get(
        "/api/admin/stats",
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert unauth_res.status_code == 403
