import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from backend.app.schemas.common import SchoolOut, SchoolUpdate, SchoolJoinRequest
from backend.app.dependencies.auth import get_current_user, get_current_admin
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/schools", tags=["Schools"])

@router.get("", response_model=List[SchoolOut])
def list_schools():
    return list(db.schools.values())

@router.get("/{school_id}", response_model=SchoolOut)
def get_school_by_id(school_id: str):
    school = db.schools.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลโรงเรียนนี้")
    return school

@router.post("/join")
def join_school(req: SchoolJoinRequest, user: dict = Depends(get_current_user)):
    # Find school with matching join_code (case insensitive)
    matched_school = None
    for s in db.schools.values():
        if s["join_code"].strip().upper() == req.join_code.strip().upper():
            matched_school = s
            break

    if not matched_school:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="รหัสเข้าร่วมโรงเรียน (Join Code) ไม่ถูกต้อง กรุณาตรวจสอบกับทางโรงเรียน"
        )

    # Check if already joined
    for sm in db.school_members.values():
        if sm["school_id"] == matched_school["id"] and sm["user_id"] == user["id"]:
            return {
                "success": True,
                "message": f"คุณเป็นสมาชิกของ {matched_school['name']} อยู่แล้ว",
                "school": matched_school
            }

    # Add membership
    mem_id = f"sm-{uuid.uuid4().hex[:8]}"
    db.school_members[mem_id] = {
        "id": mem_id,
        "school_id": matched_school["id"],
        "user_id": user["id"],
        "role": "STUDENT",
        "status": "ACTIVE",
        "joined_at": datetime.now()
    }
    user.setdefault("active_schools", []).append(matched_school["id"])

    return {
        "success": True,
        "message": f"เข้าร่วมโรงเรียน {matched_school['name']} สำเร็จเรียบร้อย!",
        "school": matched_school
    }

@router.put("/{school_id}")
def update_school_settings(
    school_id: str,
    data: SchoolUpdate,
    admin: dict = Depends(get_current_admin)
):
    school = db.schools.get(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="ไม่พบโรงเรียนที่ต้องการแก้ไข")

    if data.name:
        school["name"] = data.name
    if data.logo_url is not None:
        school["logo_url"] = data.logo_url
    if data.primary_color:
        school["primary_color"] = data.primary_color
    if data.banner_url is not None:
        school["banner_url"] = data.banner_url
    school["updated_at"] = datetime.now()

    # Log audit
    log_id = f"log-{uuid.uuid4().hex[:8]}"
    db.audit_logs[log_id] = {
        "id": log_id,
        "school_id": school_id,
        "actor_id": admin["id"],
        "action": "UPDATE_SCHOOL_SETTINGS",
        "entity_type": "schools",
        "entity_id": school_id,
        "metadata": {"updated_fields": list(data.model_dump(exclude_unset=True).keys())},
        "created_at": datetime.now()
    }

    return school
