from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime
from backend.app.schemas.common import ProfileOut, ProfileUpdate
from backend.app.dependencies.auth import get_current_user
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_current_profile(user: dict = Depends(get_current_user)):
    user_schools = []
    for sm in db.school_members.values():
        if sm["user_id"] == user["id"] and sm["status"] == "ACTIVE":
            sc = db.schools.get(sm["school_id"])
            if sc:
                user_schools.append({
                    "school_id": sc["id"],
                    "school_name": sc["name"],
                    "role": sm["role"],
                    "primary_color": sc.get("primary_color", "#2563EB"),
                    "logo_url": sc.get("logo_url")
                })
    return {
        **user,
        "schools": user_schools
    }

@router.put("/me")
def update_profile(data: ProfileUpdate, user: dict = Depends(get_current_user)):
    profile = db.profiles.get(user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลผู้ใช้งาน")
    if data.display_name:
        profile["display_name"] = data.display_name
    if data.avatar_url is not None:
        profile["avatar_url"] = data.avatar_url
    profile["updated_at"] = datetime.now()
    return profile
