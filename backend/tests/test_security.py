import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_critical_security_return_information_leakage():
    """
    SECTION 57: CRITICAL SECURITY TEST
    Simulate:
    Student A = Poster (u-student-a-0002)
    Student B = Approved Claimant (u-student-b-0003)
    Student C = Random Student (u-student-c-0004)
    Admin = Administrator (u-admin-0001)

    Expected:
    - Student B can read Return Information (200)
    - Student A can read/manage Return Information (200)
    - Student C CANNOT read Return Information even with valid claim ID (403 FORBIDDEN)
    - Admin can read Return Information (200)
    """
    claim_id = "claim-001"

    # 1. Student B (Approved Claimant) - MUST SUCCEED (200)
    res_b = client.get(
        f"/api/return-information/claim/{claim_id}",
        headers={"X-User-Id": "u-student-b-0003"}
    )
    assert res_b.status_code == 200, f"Approved claimant failed: {res_b.text}"
    data_b = res_b.json()
    assert "pickup_location" in data_b
    assert "contact_method" in data_b

    # 2. Student A (Original Poster) - MUST SUCCEED (200)
    res_a = client.get(
        f"/api/return-information/claim/{claim_id}",
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert res_a.status_code == 200, f"Original poster failed: {res_a.text}"

    # 3. Student C (Random Student) - MUST BE BLOCKED WITH 403 FORBIDDEN!
    res_c = client.get(
        f"/api/return-information/claim/{claim_id}",
        headers={"X-User-Id": "u-student-c-0004"}
    )
    assert res_c.status_code == 403, f"CRITICAL LEAK: Student C accessed return info! Code: {res_c.status_code}"
    assert "Privacy" in res_c.json()["detail"] or "ไม่มีสิทธิ์" in res_c.json()["detail"]

    # 4. Admin - MUST SUCCEED (200)
    res_admin = client.get(
        f"/api/return-information/claim/{claim_id}",
        headers={"X-User-Id": "u-admin-0001"}
    )
    assert res_admin.status_code == 200

def test_multi_school_isolation():
    """
    Test Multi-Tenant Isolation:
    Student from School 2 (u-student-s2-0005) trying to view School 1 items must be blocked with 403.
    """
    res = client.get(
        "/api/found-items?school_id=s1111111-aaaa-1111-aaaa-111111111111",
        headers={"X-User-Id": "u-student-s2-0005"}
    )
    assert res.status_code == 403
    assert "โรงเรียนอื่น" in res.json()["detail"]

def test_claims_and_notifications_workflow():
    """
    Test creating a new claim, verification answer, and notification creation.
    """
    # Create item by Student A
    item_res = client.post(
        "/api/found-items",
        json={
            "item_name": "กระเป๋าเป้สีดำ Adidas",
            "category_id": "c3333333-3333-3333-3333-333333333333",
            "item_type_id": "t301",
            "color": "ดำ",
            "brand": "Adidas",
            "description": "พบที่สนามบาสเกตบอล",
            "location_found": "สนามบาส 1"
        },
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert item_res.status_code == 200
    item_id = item_res.json()["id"]

    # Student C submits a claim for the backpack
    claim_res = client.post(
        "/api/claims",
        json={
            "item_id": item_id,
            "verification_answer": "ข้างในมีสมุดวิชาฟิสิกส์ชื่อธนวัฒน์"
        },
        headers={"X-User-Id": "u-student-c-0004"}
    )
    assert claim_res.status_code == 200
    claim_id = claim_res.json()["id"]
    assert claim_res.json()["status"] == "PENDING"

    # Poster (Student A) should now have a notification
    notif_res = client.get(
        "/api/notifications",
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert notif_res.status_code == 200
    assert any(n["related_claim_id"] == claim_id for n in notif_res.json())

    # Admin approves the claim
    review_res = client.post(
        f"/api/claims/{claim_id}/review",
        json={"status": "APPROVED"},
        headers={"X-User-Id": "u-admin-0001"}
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "APPROVED"

    # Now Student A creates return info
    return_res = client.post(
        "/api/return-information",
        json={
            "claim_id": claim_id,
            "pickup_location": "ป้อมยามหน้าประตู 1",
            "pickup_date": "2026-09-15",
            "pickup_time": "16:30 น.",
            "contact_method": "โทร 089-999-9999",
            "notes": "แจ้งชื่อ รปภ. ได้เลยครับ"
        },
        headers={"X-User-Id": "u-student-a-0002"}
    )
    assert return_res.status_code == 200

    # Student C (now APPROVED claimant) can read return info!
    sec_check = client.get(
        f"/api/return-information/claim/{claim_id}",
        headers={"X-User-Id": "u-student-c-0004"}
    )
    assert sec_check.status_code == 200
    assert sec_check.json()["pickup_location"] == "ป้อมยามหน้าประตู 1"
