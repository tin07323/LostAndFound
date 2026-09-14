import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from backend.app.schemas.common import AuditLogOut, AdminStatsOut, ClaimOut, ProfileOut
from backend.app.dependencies.auth import get_current_admin
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/admin", tags=["Admin"])

class UserStatusUpdate(BaseModel):
    status: str # ACTIVE, SUSPENDED

class CategoryCreate(BaseModel):
    name: str

class ItemTypeCreate(BaseModel):
    category_id: str
    name: str

@router.get("/stats", response_model=AdminStatsOut)
def get_dashboard_stats(
    school_id: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    target_school = school_id or admin.get("current_school_id")

    found_count = sum(1 for f in db.found_items.values() if f["school_id"] == target_school)
    lost_count = sum(1 for l in db.lost_reports.values() if l["school_id"] == target_school)
    pending_claims = sum(
        1 for c in db.claims.values()
        if c["status"] == "PENDING" and db.found_items.get(c["item_id"], {}).get("school_id") == target_school
    )
    returned_count = sum(
        1 for f in db.found_items.values()
        if f["school_id"] == target_school and f["status"] == "RETURNED"
    )
    members_count = sum(
        1 for sm in db.school_members.values()
        if sm["school_id"] == target_school and sm["status"] == "ACTIVE"
    )

    return {
        "total_found_items": found_count,
        "total_lost_reports": lost_count,
        "pending_claims": pending_claims,
        "returned_items": returned_count,
        "total_members": members_count
    }

@router.get("/claims/pending", response_model=List[ClaimOut])
def list_pending_claims(
    school_id: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    target_school = school_id or admin.get("current_school_id")
    results = []
    for c in db.claims.values():
        item = db.found_items.get(c["item_id"])
        if item and item["school_id"] == target_school:
            claimant = db.profiles.get(c["claimant_id"], {})
            results.append({
                **c,
                "item_name": item["item_name"],
                "claimant_name": claimant.get("display_name"),
                "claimant_email": claimant.get("email")
            })
    results.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
    return results

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    school_id: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    target_school = school_id or admin.get("current_school_id")
    logs = [l for l in db.audit_logs.values() if l["school_id"] == target_school]
    logs.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)

    results = []
    for log in logs:
        actor = db.profiles.get(log["actor_id"], {})
        results.append({
            **log,
            "actor_name": actor.get("display_name", "เจ้าหน้าที่")
        })
    return results

@router.get("/users")
def list_school_users(
    school_id: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    target_school = school_id or admin.get("current_school_id")
    users_list = []
    for sm in db.school_members.values():
        if sm["school_id"] == target_school:
            p = db.profiles.get(sm["user_id"])
            if p:
                users_list.append({
                    **p,
                    "school_role": sm["role"],
                    "membership_status": sm["status"],
                    "joined_at": sm["joined_at"]
                })
    return users_list

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: str,
    data: UserStatusUpdate,
    admin: dict = Depends(get_current_admin)
):
    user = db.profiles.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้นี้")

    user["status"] = data.status
    for sm in db.school_members.values():
        if sm["user_id"] == user_id:
            sm["status"] = data.status

    # Log audit
    log_id = f"log-{uuid.uuid4().hex[:8]}"
    db.audit_logs[log_id] = {
        "id": log_id,
        "school_id": admin.get("current_school_id", "s1111111-aaaa-1111-aaaa-111111111111"),
        "actor_id": admin["id"],
        "action": f"USER_STATUS_{data.status}",
        "entity_type": "profiles",
        "entity_id": user_id,
        "metadata": {"new_status": data.status},
        "created_at": datetime.now()
    }
    return {"success": True, "message": f"เปลี่ยนสถานะผู้ใช้เป็น {data.status} เรียบร้อยแล้ว"}

@router.put("/items/{item_id}/mark-returned")
def mark_item_returned(item_id: str, admin: dict = Depends(get_current_admin)):
    item = db.found_items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่ระบุ")

    item["status"] = "RETURNED"
    item["updated_at"] = datetime.now()

    # Find approved claim if exists
    for c in db.claims.values():
        if c["item_id"] == item_id and c["status"] == "APPROVED":
            # Notify claimant
            notif_id = f"notif-{uuid.uuid4().hex[:8]}"
            db.notifications[notif_id] = {
                "id": notif_id,
                "user_id": c["claimant_id"],
                "type": "ITEM_RETURNED",
                "title": "สิ่งของถูกส่งมอบคืนเรียบร้อยแล้ว!",
                "message": f"การส่งมอบสิ่งของ '{item['item_name']}' เสร็จสมบูรณ์แล้ว ขอบคุณที่ใช้งานระบบ Lost & Found",
                "related_item_id": item_id,
                "related_claim_id": c["id"],
                "is_read": False,
                "created_at": datetime.now()
            }
            break

    # Log audit
    log_id = f"log-{uuid.uuid4().hex[:8]}"
    db.audit_logs[log_id] = {
        "id": log_id,
        "school_id": item["school_id"],
        "actor_id": admin["id"],
        "action": "MARK_ITEM_RETURNED",
        "entity_type": "found_items",
        "entity_id": item_id,
        "metadata": {"item_name": item["item_name"]},
        "created_at": datetime.now()
    }

    return {"success": True, "message": "บันทึกการส่งมอบคืนสิ่งของเรียบร้อยแล้ว", "item": item}

@router.post("/categories")
def create_category(data: CategoryCreate, admin: dict = Depends(get_current_admin)):
    cid = f"cat-{uuid.uuid4().hex[:8]}"
    cat = {"id": cid, "name": data.name, "created_at": datetime.now()}
    db.categories[cid] = cat
    return cat

@router.post("/item-types")
def create_item_type(data: ItemTypeCreate, admin: dict = Depends(get_current_admin)):
    tid = f"type-{uuid.uuid4().hex[:8]}"
    itype = {"id": tid, "category_id": data.category_id, "name": data.name, "created_at": datetime.now()}
    db.item_types[tid] = itype
    return itype
