export type UserRole = 'STUDENT' | 'ADMIN';
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export type FoundItemStatus =
  | 'AVAILABLE'
  | 'CLAIM_PENDING'
  | 'CLAIM_APPROVED'
  | 'RETURN_INFO_PENDING'
  | 'READY_FOR_PICKUP'
  | 'RETURNED';

export type LostReportStatus = 'AVAILABLE' | 'RESOLVED' | 'CANCELLED';

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: UserRole;
  status: MemberStatus;
  active_schools?: string[];
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  join_code: string;
  logo_url?: string;
  primary_color: string;
  banner_url?: string;
  default_pickup_location?: string;
  meeting_locations?: string[];
  created_at: string;
  updated_at: string;
}

export interface SchoolMember {
  id: string;
  school_id: string;
  user_id: string;
  role: UserRole;
  status: MemberStatus;
  joined_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface ItemType {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
}

export interface FoundItem {
  id: string;
  school_id: string;
  posted_by: string;
  poster_name?: string;
  item_name: string;
  category_id: string;
  category_name?: string;
  item_type_id: string;
  item_type_name?: string;
  color: string;
  brand?: string;
  description: string;
  photo_url?: string;
  location_found: string;
  date_found: string;
  status: FoundItemStatus;
  created_at: string;
  updated_at: string;
}

export interface LostReport {
  id: string;
  school_id: string;
  reported_by: string;
  reporter_name?: string;
  item_name: string;
  category_id: string;
  category_name?: string;
  item_type_id: string;
  item_type_name?: string;
  color: string;
  brand?: string;
  description: string;
  photo_url?: string;
  last_known_location: string;
  date_lost: string;
  status: LostReportStatus;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  item_name?: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  verification_answer: string;
  status: ClaimStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ReturnInformation {
  id: string;
  claim_id: string;
  pickup_location: string;
  pickup_date: string;
  pickup_time: string;
  contact_method: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_item_id?: string;
  related_claim_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  school_id: string;
  actor_id: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}
