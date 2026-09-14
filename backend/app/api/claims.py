import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.schemas.common import ClaimCreate, ClaimReview, ClaimOut, ClaimStatus
from backend.app.dependencies.auth import get_current_user, get_current_admin
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/claims", tags=["Claims"])

@router.get("/my", response_model=List[ClaimOut])
def get_my_claims(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    results = []
    for c in db.claims.values():
        if c["claimant_id"] == user_id:
            item = db.found_items.get(c["item_id"], {})
            claimant = db.profiles.get(user_id, {})
            results.append({
                **c,
                "item_name": item.get("item_name", "สิ่งของ"),
                "claimant_name": claimant.get("display_name"),
                "claimant_email": claimant.get("email")
            })
    results.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
    return results

@router.get("/item/{item_id}", response_model=List[ClaimOut])
def get_claims_for_item(item_id: str, user: dict = Depends(get_current_user)):
    item = db.found_items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของ")

    # Only item poster, admin, or individual claimant can view
    is_poster = item["posted_by"] == user["id"]
    is_admin = user.get("role") == "ADMIN"

    results = []
    for c in db.claims.values():
        if c["item_id"] == item_id:
            if is_poster or is_admin or c["claimant_id"] == user["id"]:
                claimant = db.profiles.get(c["claimant_id"], {})
                results.append({
                    **c,
                    "item_name": item.get("item_name"),
                    "claimant_name": claimant.get("display_name"),
                    "claimant_email": claimant.get("email")
                })
    return results

@router.post("", response_model=ClaimOut)
def create_claim(data: ClaimCreate, user: dict = Depends(get_current_user)):
    item = db.found_items.get(data.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่ต้องการขอรับคืน")

    if item["posted_by"] == user["id"]:
        raise HTTPException(status_code=400, detail="คุณไม่สามารถส่งคำขอรับของที่คุณเป็นผู้โพสต์เองได้")

    if item["status"] not in ["AVAILABLE", "CLAIM_PENDING"]:
        raise HTTPException(status_code=400, detail="สิ่งของนี้ไม่สามารถส่งคำขอรับคืนได้ในขณะนี้")

    new_claim_id = f"claim-{uuid.uuid4().hex[:8]}"
    claim_record = {
        "id": new_claim_id,
        "item_id": data.item_id,
        "claimant_id": user["id"],
        "verification_answer": data.verification_answer,
        "status": "PENDING",
        "reviewed_by": None,
        "reviewed_at": None,
        "rejection_reason": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    db.claims[new_claim_id] = claim_record

    # Update item status
    item["status"] = "CLAIM_PENDING"
    item["updated_at"] = datetime.now()

    # Create notification for item poster
    notif_id = f"notif-{uuid.uuid4().hex[:8]}"
    db.notifications[notif_id] = {
        "id": notif_id,
        "user_id": item["posted_by"],
        "type": "NEW_CLAIM",
        "title": "มีผู้ส่งคำขอรับสิ่งของที่คุณพบ!",
        "message": f"มีผู้ส่งคำขอเป็นเจ้าของสิ่งของ '{item['item_name']}' เจ้าหน้าที่กำลังดำเนินการตรวจสอบ",
        "related_item_id": item["id"],
        "related_claim_id": new_claim_id,
        "is_read": False,
        "created_at": datetime.now()
    }

    # Notification for claimant
    notif_id_c = f"notif-{uuid.uuid4().hex[:8]}"
    db.notifications[notif_id_c] = {
        "id": notif_id_c,
        "user_id": user["id"],
        "type": "CLAIM_SUBMITTED",
        "title": "ส่งคำขอรับสิ่งของเรียบร้อยแล้ว",
        "message": f"คำขอของคุณสำหรับ '{item['item_name']}' อยู่ระหว่างการพิจารณาตรวจสอบโดยอาจารย์/แอดมิน",
        "related_item_id": item["id"],
        "related_claim_id": new_claim_id,
        "is_read": False,
        "created_at": datetime.now()
    }

    return {
        **claim_record,
        "item_name": item["item_name"],
        "claimant_name": user.get("display_name"),
        "claimant_email": user.get("email")
    }

@router.post("/{claim_id}/review", response_model=ClaimOut)
def review_claim(
    claim_id: str,
    data: ClaimReview,
    admin: dict = Depends(get_current_admin)
):
    claim = db.claims.get(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="ไม่พบคำขอที่ต้องการตรวจสอบ")

    item = db.found_items.get(claim["item_id"])
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่เชื่อมโยง")

    claim["status"] = data.status.value
    claim["reviewed_by"] = admin["id"]
    claim["reviewed_at"] = datetime.now()
    claim["rejection_reason"] = data.rejection_reason if data.status == ClaimStatus.REJECTED else None
    claim["updated_at"] = datetime.now()

    if data.status == ClaimStatus.APPROVED:
        item["status"] = "CLAIM_APPROVED"
        # Notify claimant
        notif_c = f"notif-{uuid.uuid4().hex[:8]}"
        db.notifications[notif_c] = {
            "id": notif_c,
            "user_id": claim["claimant_id"],
            "type": "CLAIM_APPROVED",
            "title": "คำขอรับสิ่งของของคุณได้รับการอนุมัติแล้ว!",
            "message": f"คำขอรับสิ่งของ '{item['item_name']}' ได้รับการอนุมัติแล้ว ผู้พบจะนัดหมายสถานที่และเวลารับคืนในระบบ",
            "related_item_id": item["id"],
            "related_claim_id": claim["id"],
            "is_read": False,
            "created_at": datetime.now()
        }
        # Notify poster to provide return info
        notif_p = f"notif-{uuid.uuid4().hex[:8]}"
        db.notifications[notif_p] = {
            "id": notif_p,
            "user_id": item["posted_by"],
            "type": "POSTER_RETURN_REQUIRED",
            "title": "คำขอรับของได้รับการอนุมัติ: กรุณากรอกข้อมูลนัดรับคืน",
            "message": f"คำขอรับของ '{item['item_name']}' ได้รับการอนุมัติแล้ว กรุณากรอกสถานที่และเวลานัดรับเพื่อประสานงานส่งมอบ",
            "related_item_id": item["id"],
            "related_claim_id": claim["id"],
            "is_read": False,
            "created_at": datetime.now()
        }
    elif data.status == ClaimStatus.REJECTED:
        # Check if there are other pending claims
        other_pending = any(
            c["item_id"] == item["id"] and c["id"] != claim_id and c["status"] == "PENDING"
            for c in db.claims.values()
        )
        item["status"] = "CLAIM_PENDING" if other_pending else "AVAILABLE"

        notif_r = f"notif-{uuid.uuid4().hex[:8]}"
        db.notifications[notif_r] = {
            "id": notif_r,
            "user_id": claim["claimant_id"],
            "type": "CLAIM_REJECTED",
            "title": "คำขอรับสิ่งของไม่ผ่านการอนุมัติ",
            "message": f"คำขอรับสิ่งของ '{item['item_name']}' ไม่ผ่านการอนุมัติ: {data.rejection_reason or 'ข้อมูลยืนยันความเป็นเจ้าของไม่สอดคล้อง'}",
            "related_item_id": item["id"],
            "related_claim_id": claim["id"],
            "is_read": False,
            "created_at": datetime.now()
        }

    # Audit log
    log_id = f"log-{uuid.uuid4().hex[:8]}"
    db.audit_logs[log_id] = {
        "id": log_id,
        "school_id": item["school_id"],
        "actor_id": admin["id"],
        "action": f"CLAIM_{data.status.value}",
        "entity_type": "claims",
        "entity_id": claim["id"],
        "metadata": {"item_id": item["id"], "reason": data.rejection_reason},
        "created_at": datetime.now()
    }

    claimant = db.profiles.get(claim["claimant_id"], {})
    return {
        **claim,
        "item_name": item["item_name"],
        "claimant_name": claimant.get("display_name"),
        "claimant_email": claimant.get("email")
    }
