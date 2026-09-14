from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from backend.app.schemas.common import NotificationOut
from backend.app.dependencies.auth import get_current_user
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    notifs = [n for n in db.notifications.values() if n["user_id"] == user_id]
    notifs.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
    return notifs

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
    notif = db.notifications.get(notification_id)
    if not notif or notif["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="ไม่พบการแจ้งเตือน")

    notif["is_read"] = True
    return {"success": True, "message": "ทำเครื่องหมายอ่านแล้ว"}

@router.put("/read-all")
def mark_all_read(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    for notif in db.notifications.values():
        if notif["user_id"] == user_id:
            notif["is_read"] = True
    return {"success": True, "message": "ทำเครื่องหมายอ่านทั้งหมดเรียบร้อยแล้ว"}
