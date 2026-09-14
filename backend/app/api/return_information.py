import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.schemas.common import ReturnInfoCreate, ReturnInfoUpdate, ReturnInfoOut
from backend.app.dependencies.auth import get_current_user
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/return-information", tags=["Return Information"])

@router.get("/claim/{claim_id}", response_model=ReturnInfoOut)
def get_return_info_by_claim(claim_id: str, user: dict = Depends(get_current_user)):
    """
    CRITICAL SECURITY CHECK:
    Only the item poster, the approved claimant, or an administrator can view
    return pickup details and contact information.
    Student C (arbitrary student) MUST receive 403 FORBIDDEN.
    """
    claim = db.claims.get(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="ไม่พบคำขอรับสิ่งของที่ระบุ")

    item = db.found_items.get(claim["item_id"])
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่เชื่อมโยง")

    user_id = user["id"]
    is_admin = user.get("role") == "ADMIN"
    is_poster = item["posted_by"] == user_id
    is_approved_claimant = (claim["claimant_id"] == user_id and claim["status"] == "APPROVED")

    if not (is_admin or is_poster or is_approved_claimant):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="คุณไม่มีสิทธิ์เข้าถึงข้อมูลการนัดรับสิ่งของนี้ (Privacy & Security Protection)"
        )

    # Find return info
    return_record = None
    for r in db.return_information.values():
        if r["claim_id"] == claim_id:
            return_record = r
            break

    if not return_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ผู้พบยังไม่ได้ระบุข้อมูลการนัดรับสิ่งของ กรุณารอการติดต่อหรือนัดหมายในระบบ"
        )

    return return_record

@router.post("", response_model=ReturnInfoOut)
def create_or_update_return_info(data: ReturnInfoCreate, user: dict = Depends(get_current_user)):
    """
    Only the original poster of the item or an Admin can create/specify return information.
    """
    claim = db.claims.get(data.claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="ไม่พบคำขอรับสิ่งของ")

    if claim["status"] != "APPROVED":
        raise HTTPException(status_code=400, detail="คำขอนี้ยังไม่ได้รับการอนุมัติจากอาจารย์/แอดมิน")

    item = db.found_items.get(claim["item_id"])
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่เชื่อมโยง")

    user_id = user["id"]
    is_admin = user.get("role") == "ADMIN"
    is_poster = item["posted_by"] == user_id

    if not (is_admin or is_poster):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="เฉพาะผู้พบสิ่งของหรือแอดมินเท่านั้นที่สามารถระบุข้อมูลการนัดรับได้"
        )

    # Check if return info already exists for this claim
    existing_id = None
    for r in db.return_information.values():
        if r["claim_id"] == data.claim_id:
            existing_id = r["id"]
            break

    if existing_id:
        record = db.return_information[existing_id]
        record["pickup_location"] = data.pickup_location
        record["pickup_date"] = data.pickup_date
        record["pickup_time"] = data.pickup_time
        record["contact_method"] = data.contact_method
        record["notes"] = data.notes
        record["updated_at"] = datetime.now()
        target_id = existing_id
    else:
        target_id = f"return-{uuid.uuid4().hex[:8]}"
        record = {
            "id": target_id,
            "claim_id": data.claim_id,
            "pickup_location": data.pickup_location,
            "pickup_date": data.pickup_date,
            "pickup_time": data.pickup_time,
            "contact_method": data.contact_method,
            "notes": data.notes,
            "created_by": user_id,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        db.return_information[target_id] = record

    # Update item status to READY_FOR_PICKUP
    item["status"] = "READY_FOR_PICKUP"
    item["updated_at"] = datetime.now()

    # Notify claimant that return info is available!
    notif_id = f"notif-{uuid.uuid4().hex[:8]}"
    db.notifications[notif_id] = {
        "id": notif_id,
        "user_id": claim["claimant_id"],
        "type": "RETURN_INFO_READY",
        "title": "มีข้อมูลนัดรับสิ่งของแล้ว!",
        "message": f"ผู้พบสิ่งของ '{item['item_name']}' ได้ระบุสถานที่และเวลานัดรับเรียบร้อยแล้ว: {data.pickup_location} ({data.pickup_time})",
        "related_item_id": item["id"],
        "related_claim_id": claim["id"],
        "is_read": False,
        "created_at": datetime.now()
    }

    return record
