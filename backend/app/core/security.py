from typing import Optional
from fastapi import HTTPException, Security, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.app.services.supabase_service import db

security_scheme = HTTPBearer(auto_error=False)

def get_current_user_from_token(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_school_id: Optional[str] = Header(None, alias="X-School-Id")
) -> dict:
    """
    Authenticate user using Supabase JWT or local test user header.
    Returns user profile dict along with their active schools.
    """
    user_id = None
    if x_user_id:
        user_id = x_user_id
    elif auth and auth.credentials:
        token = auth.credentials
        # In real Supabase integration, verify JWT token via Supabase Auth
        if db.client:
            try:
                res = db.client.auth.get_user(token)
                if res and res.user:
                    user_id = res.user.id
            except Exception:
                pass
        if not user_id:
            # Check if token is user ID directly (for test/local runner)
            if token in db.profiles:
                user_id = token
            else:
                user_id = "u-student-a-0002" # Fallback default student
    else:
        # Default fallback to Student A for open preview requests if not provided
        user_id = "u-student-a-0002"

    profile = db.profiles.get(user_id)
    if not profile:
        # Auto-create basic profile
        profile = {
            "id": user_id,
            "email": f"{user_id}@school.ac.th",
            "display_name": "นักเรียนทั่วไป",
            "avatar_url": None,
            "role": "STUDENT",
            "status": "ACTIVE"
        }
        db.profiles[user_id] = profile

    # Attach schools membership
    user_schools = [
        sm["school_id"] for sm in db.school_members.values()
        if sm["user_id"] == user_id and sm["status"] == "ACTIVE"
    ]
    profile["active_schools"] = user_schools
    profile["current_school_id"] = x_school_id or (user_schools[0] if user_schools else "s1111111-aaaa-1111-aaaa-111111111111")
    return profile
