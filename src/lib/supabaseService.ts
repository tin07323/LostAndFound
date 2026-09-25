import { supabase } from './supabase';
import {
  School,
  Profile,
  Category,
  ItemType,
  FoundItem,
  LostReport,
  Claim,
  ReturnInformation,
  Notification,
  AuditLog
} from '../types';

export const isUuid = (val?: string): boolean => {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

export const ensureUuid = (val?: string): string => {
  if (val && isUuid(val)) return val;
  try {
    return crypto.randomUUID();
  } catch {
    return '10000000-1000-4000-8000-' + Date.now().toString(16).padStart(12, '0').slice(-12);
  }
};

// ==========================================
// 1. SCHOOLS
// ==========================================
export async function fetchSchoolsFromSupabase(): Promise<School[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('fetchSchoolsFromSupabase error:', error.message);
      return null;
    }
    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      join_code: s.join_code,
      logo_url: s.logo_url || '',
      primary_color: s.primary_color || '#2563EB',
      banner_url: s.banner_url || '',
      default_pickup_location: s.default_pickup_location || 'ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง',
      meeting_locations: Array.isArray(s.meeting_locations)
        ? s.meeting_locations
        : ['ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง', 'ป้อมเจ้าหน้าที่รักษาความปลอดภัย ประตูหลัก', 'ห้องสมุดกลาง ชั้น 1', 'ห้องพักครูเวรประจำวัน'],
      created_at: s.created_at || new Date().toISOString(),
      updated_at: s.updated_at || new Date().toISOString()
    }));
  } catch (err) {
    console.error('fetchSchoolsFromSupabase exception:', err);
    return null;
  }
}

export async function saveSchoolToSupabase(school: School): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: ensureUuid(school.id),
      name: school.name,
      join_code: school.join_code.trim().toUpperCase(),
      logo_url: school.logo_url || '',
      primary_color: school.primary_color || '#2563EB',
      banner_url: school.banner_url || '',
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('schools').upsert(payload, { onConflict: 'join_code' });
    if (error) {
      console.warn('saveSchoolToSupabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('saveSchoolToSupabase exception:', err);
    return false;
  }
}

// ==========================================
// 2. PROFILES
// ==========================================
export async function fetchProfilesFromSupabase(): Promise<Profile[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.warn('fetchProfilesFromSupabase error:', error.message);
      return null;
    }
    return (data || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      role: p.role,
      status: p.status || 'ACTIVE',
      active_schools: p.active_schools || [],
      created_at: p.created_at || new Date().toISOString(),
      updated_at: p.updated_at || new Date().toISOString()
    }));
  } catch (err) {
    console.error('fetchProfilesFromSupabase exception:', err);
    return null;
  }
}

export async function saveProfileToSupabase(profile: Profile): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: ensureUuid(profile.id),
      email: profile.email.toLowerCase().trim(),
      display_name: profile.display_name,
      avatar_url: profile.avatar_url || '',
      role: profile.role,
      status: profile.status || 'ACTIVE',
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'email' });
    if (error) {
      console.warn('saveProfileToSupabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('saveProfileToSupabase exception:', err);
    return false;
  }
}

// ==========================================
// 3. CATEGORIES & ITEM TYPES
// ==========================================
export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) return null;
    if (!data || data.length === 0) return null;
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      created_at: c.created_at || new Date().toISOString()
    }));
  } catch {
    return null;
  }
}

export async function fetchItemTypesFromSupabase(): Promise<ItemType[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('item_types').select('*').order('name');
    if (error) return null;
    if (!data || data.length === 0) return null;
    return data.map((t: any) => ({
      id: t.id,
      category_id: t.category_id,
      name: t.name,
      created_at: t.created_at || new Date().toISOString()
    }));
  } catch {
    return null;
  }
}

// ==========================================
// 4. FOUND ITEMS
// ==========================================
export async function fetchFoundItemsFromSupabase(): Promise<FoundItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('found_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('fetchFoundItemsFromSupabase error:', error.message);
      return null;
    }
    return (data || []).map((item: any) => ({
      id: item.id,
      school_id: item.school_id,
      posted_by: item.posted_by,
      item_name: item.item_name,
      category_id: item.category_id,
      item_type_id: item.item_type_id,
      color: item.color,
      brand: item.brand || '',
      description: item.description,
      photo_url: item.photo_url || '',
      location_found: item.location_found,
      date_found: item.date_found,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (err) {
    console.error('fetchFoundItemsFromSupabase exception:', err);
    return null;
  }
}

export async function saveFoundItemToSupabase(item: FoundItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: ensureUuid(item.id),
      school_id: ensureUuid(item.school_id),
      posted_by: ensureUuid(item.posted_by),
      item_name: item.item_name,
      category_id: ensureUuid(item.category_id),
      item_type_id: ensureUuid(item.item_type_id),
      color: item.color,
      brand: item.brand || null,
      description: item.description,
      photo_url: item.photo_url || null,
      location_found: item.location_found,
      date_found: item.date_found || new Date().toISOString().split('T')[0],
      status: item.status,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('found_items').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('saveFoundItemToSupabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('saveFoundItemToSupabase exception:', err);
    return false;
  }
}

export async function deleteFoundItemFromSupabase(itemId: string): Promise<boolean> {
  if (!supabase || !isUuid(itemId)) return false;
  try {
    const { error } = await supabase.from('found_items').delete().eq('id', itemId);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 5. LOST REPORTS
// ==========================================
export async function fetchLostReportsFromSupabase(): Promise<LostReport[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('lost_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('fetchLostReportsFromSupabase error:', error.message);
      return null;
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      school_id: r.school_id,
      reported_by: r.reported_by,
      item_name: r.item_name,
      category_id: r.category_id,
      item_type_id: r.item_type_id,
      color: r.color,
      brand: r.brand || '',
      description: r.description,
      photo_url: r.photo_url || '',
      last_known_location: r.last_known_location,
      date_lost: r.date_lost,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));
  } catch (err) {
    console.error('fetchLostReportsFromSupabase exception:', err);
    return null;
  }
}

export async function saveLostReportToSupabase(report: LostReport): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: ensureUuid(report.id),
      school_id: ensureUuid(report.school_id),
      reported_by: ensureUuid(report.reported_by),
      item_name: report.item_name,
      category_id: ensureUuid(report.category_id),
      item_type_id: ensureUuid(report.item_type_id),
      color: report.color,
      brand: report.brand || null,
      description: report.description,
      photo_url: report.photo_url || null,
      last_known_location: report.last_known_location,
      date_lost: report.date_lost || new Date().toISOString().split('T')[0],
      status: report.status,
      created_at: report.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('lost_reports').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('saveLostReportToSupabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('saveLostReportToSupabase exception:', err);
    return false;
  }
}

export async function deleteLostReportFromSupabase(reportId: string): Promise<boolean> {
  if (!supabase || !isUuid(reportId)) return false;
  try {
    const { error } = await supabase.from('lost_reports').delete().eq('id', reportId);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 6. CLAIMS
// ==========================================
export async function fetchClaimsFromSupabase(): Promise<Claim[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('claims').select('*').order('created_at', { ascending: false });
    if (error) return null;
    return (data || []).map((c: any) => ({
      id: c.id,
      item_id: c.item_id,
      claimant_id: c.claimant_id,
      verification_answer: c.verification_answer,
      status: c.status,
      reviewed_by: c.reviewed_by,
      reviewed_at: c.reviewed_at,
      rejection_reason: c.rejection_reason,
      created_at: c.created_at,
      updated_at: c.updated_at
    }));
  } catch {
    return null;
  }
}

export async function saveClaimToSupabase(claim: Claim): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: ensureUuid(claim.id),
      item_id: ensureUuid(claim.item_id),
      claimant_id: ensureUuid(claim.claimant_id),
      verification_answer: claim.verification_answer,
      status: claim.status,
      reviewed_by: claim.reviewed_by && isUuid(claim.reviewed_by) ? claim.reviewed_by : null,
      reviewed_at: claim.reviewed_at || null,
      rejection_reason: claim.rejection_reason || null,
      created_at: claim.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('claims').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 7. RETURN INFORMATION
// ==========================================
export async function fetchReturnInfoFromSupabase(): Promise<ReturnInformation[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('return_information').select('*');
    if (error) return null;
    return (data || []).map((r: any) => ({
      id: r.id,
      claim_id: r.claim_id,
      pickup_location: r.pickup_location,
      pickup_date: r.pickup_date,
      pickup_time: r.pickup_time,
      contact_method: r.contact_method,
      notes: r.notes || '',
      created_by: r.created_by,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));
  } catch {
    return null;
  }
}

export async function saveReturnInfoToSupabase(info: ReturnInformation): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: ensureUuid(info.id),
      claim_id: ensureUuid(info.claim_id),
      pickup_location: info.pickup_location,
      pickup_date: info.pickup_date,
      pickup_time: info.pickup_time,
      contact_method: info.contact_method,
      notes: info.notes || null,
      created_by: ensureUuid(info.created_by),
      created_at: info.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('return_information').upsert(payload, { onConflict: 'claim_id' });
    return !error;
  } catch {
    return false;
  }
}
