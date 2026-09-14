from datetime import datetime, date
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"

class MemberStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING = "PENDING"

class FoundItemStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    CLAIM_PENDING = "CLAIM_PENDING"
    CLAIM_APPROVED = "CLAIM_APPROVED"
    RETURN_INFO_PENDING = "RETURN_INFO_PENDING"
    READY_FOR_PICKUP = "READY_FOR_PICKUP"
    RETURNED = "RETURNED"

class LostReportStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"

class ClaimStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

# User Profiles
class ProfileBase(BaseModel):
    email: str
    display_name: str
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    status: MemberStatus = MemberStatus.ACTIVE

class ProfileOut(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

# Schools
class SchoolBase(BaseModel):
    name: str
    join_code: str
    logo_url: Optional[str] = None
    primary_color: str = "#2563EB"
    banner_url: Optional[str] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    banner_url: Optional[str] = None

class SchoolOut(SchoolBase):
    id: str
    created_at: datetime
    updated_at: datetime

class SchoolJoinRequest(BaseModel):
    join_code: str

# Categories & Item Types
class CategoryOut(BaseModel):
    id: str
    name: str
    created_at: datetime

class ItemTypeOut(BaseModel):
    id: str
    category_id: str
    name: str
    created_at: datetime

# Found Items
class FoundItemCreate(BaseModel):
    item_name: str
    category_id: str
    item_type_id: str
    color: str
    brand: Optional[str] = None
    description: str
    photo_url: Optional[str] = None
    location_found: str
    date_found: Optional[date] = None

class FoundItemUpdate(BaseModel):
    item_name: Optional[str] = None
    category_id: Optional[str] = None
    item_type_id: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    location_found: Optional[str] = None
    status: Optional[FoundItemStatus] = None

class FoundItemOut(BaseModel):
    id: str
    school_id: str
    posted_by: str
    poster_name: Optional[str] = None
    item_name: str
    category_id: str
    category_name: Optional[str] = None
    item_type_id: str
    item_type_name: Optional[str] = None
    color: str
    brand: Optional[str] = None
    description: str
    photo_url: Optional[str] = None
    location_found: str
    date_found: date
    status: FoundItemStatus
    created_at: datetime
    updated_at: datetime

# Lost Reports
class LostReportCreate(BaseModel):
    item_name: str
    category_id: str
    item_type_id: str
    color: str
    brand: Optional[str] = None
    description: str
    photo_url: Optional[str] = None
    last_known_location: str
    date_lost: Optional[date] = None

class LostReportUpdate(BaseModel):
    item_name: Optional[str] = None
    category_id: Optional[str] = None
    item_type_id: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    last_known_location: Optional[str] = None
    status: Optional[LostReportStatus] = None

class LostReportOut(BaseModel):
    id: str
    school_id: str
    reported_by: str
    reporter_name: Optional[str] = None
    item_name: str
    category_id: str
    category_name: Optional[str] = None
    item_type_id: str
    item_type_name: Optional[str] = None
    color: str
    brand: Optional[str] = None
    description: str
    photo_url: Optional[str] = None
    last_known_location: str
    date_lost: date
    status: LostReportStatus
    created_at: datetime
    updated_at: datetime

# Claims
class ClaimCreate(BaseModel):
    item_id: str
    verification_answer: str

class ClaimReview(BaseModel):
    status: ClaimStatus # APPROVED or REJECTED
    rejection_reason: Optional[str] = None

class ClaimOut(BaseModel):
    id: str
    item_id: str
    item_name: Optional[str] = None
    claimant_id: str
    claimant_name: Optional[str] = None
    claimant_email: Optional[str] = None
    verification_answer: str
    status: ClaimStatus
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Return Information
class ReturnInfoCreate(BaseModel):
    claim_id: str
    pickup_location: str
    pickup_date: date
    pickup_time: str
    contact_method: str
    notes: Optional[str] = None

class ReturnInfoUpdate(BaseModel):
    pickup_location: Optional[str] = None
    pickup_date: Optional[date] = None
    pickup_time: Optional[str] = None
    contact_method: Optional[str] = None
    notes: Optional[str] = None

class ReturnInfoOut(BaseModel):
    id: str
    claim_id: str
    pickup_location: str
    pickup_date: date
    pickup_time: str
    contact_method: str
    notes: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

# Notifications
class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    related_item_id: Optional[str] = None
    related_claim_id: Optional[str] = None
    is_read: bool
    created_at: datetime

# Audit Logs & Admin Stats
class AuditLogOut(BaseModel):
    id: str
    school_id: str
    actor_id: str
    actor_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    metadata: Dict[str, Any] = {}
    created_at: datetime

class AdminStatsOut(BaseModel):
    total_found_items: int
    total_lost_reports: int
    pending_claims: int
    returned_items: int
    total_members: int
