from fastapi import Depends, HTTPException, status
from backend.app.core.security import get_current_user_from_token

def get_current_user(user: dict = Depends(get_current_user_from_token)) -> dict:
    if user.get("status") == "SUSPENDED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อฝ่ายกิจการนักเรียน"
        )
    return user

def get_current_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="สิทธิ์การเข้าถึงเฉพาะผู้ดูแลระบบและอาจารย์เท่านั้น"
        )
    return user

def verify_school_access(school_id: str, user: dict):
    if user.get("role") == "ADMIN":
        return True
    if school_id not in user.get("active_schools", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="คุณไม่มีสิทธิ์เข้าถึงข้อมูลของโรงเรียนอื่น (Multi-school Isolation)"
        )
    return True
