import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Profile,
  School,
  Category,
  ItemType,
  FoundItem,
  LostReport,
  Claim,
  ReturnInformation,
  Notification,
  AuditLog
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_PROFILES,
  INITIAL_CATEGORIES,
  INITIAL_ITEM_TYPES,
  INITIAL_FOUND_ITEMS,
  INITIAL_LOST_REPORTS,
  INITIAL_CLAIMS,
  INITIAL_RETURN_INFO,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

interface AppContextType {
  currentUser: Profile;
  currentSchool: School;
  schools: School[];
  profiles: Profile[];
  categories: Category[];
  itemTypes: ItemType[];
  foundItems: FoundItem[];
  lostReports: LostReport[];
  claims: Claim[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  switchUser: (userId: string) => void;
  switchSchool: (schoolId: string) => void;
  joinSchool: (joinCode: string) => { success: boolean; message: string };
  updateSchoolSettings: (schoolId: string, updates: Partial<School>) => void;
  createFoundItem: (data: any) => FoundItem;
  updateFoundItem: (itemId: string, updates: Partial<FoundItem>) => void;
  deleteFoundItem: (itemId: string) => void;
  createLostReport: (data: any) => LostReport;
  updateLostReport: (reportId: string, updates: Partial<LostReport>) => void;
  deleteLostReport: (reportId: string) => void;
  submitClaim: (itemId: string, verificationAnswer: string) => { success: boolean; claim?: Claim; message: string };
  reviewClaim: (claimId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => void;
  saveReturnInfo: (claimId: string, data: any) => ReturnInformation;
  getReturnInfoForClaim: (claimId: string) => { allowed: boolean; data?: ReturnInformation; error?: string };
  markItemReturned: (itemId: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  toggleUserStatus: (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => void;
  addCategory: (name: string) => Category;
  addItemType: (categoryId: string, name: string) => ItemType;
  resetAllData: () => void;
}

const STORAGE_KEY = 'lnf_school_platform_state_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or default to initial
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load local state:', e);
    }
    return null;
  };

  const initialLoaded = loadState();

  const [schools, setSchools] = useState<School[]>(initialLoaded?.schools || INITIAL_SCHOOLS);
  const [profiles, setProfiles] = useState<Profile[]>(initialLoaded?.profiles || INITIAL_PROFILES);
  const [categories, setCategories] = useState<Category[]>(initialLoaded?.categories || INITIAL_CATEGORIES);
  const [itemTypes, setItemTypes] = useState<ItemType[]>(initialLoaded?.itemTypes || INITIAL_ITEM_TYPES);
  const [foundItems, setFoundItems] = useState<FoundItem[]>(initialLoaded?.foundItems || INITIAL_FOUND_ITEMS);
  const [lostReports, setLostReports] = useState<LostReport[]>(initialLoaded?.lostReports || INITIAL_LOST_REPORTS);
  const [claims, setClaims] = useState<Claim[]>(initialLoaded?.claims || INITIAL_CLAIMS);
  const [returnInfoList, setReturnInfoList] = useState<ReturnInformation[]>(initialLoaded?.returnInfoList || INITIAL_RETURN_INFO);
  const [notifications, setNotifications] = useState<Notification[]>(initialLoaded?.notifications || INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialLoaded?.auditLogs || INITIAL_AUDIT_LOGS);

  const [currentUserId, setCurrentUserId] = useState<string>(
    initialLoaded?.currentUserId || 'u-student-a-0002' // Default to Student A
  );
  const [currentSchoolId, setCurrentSchoolId] = useState<string>(
    initialLoaded?.currentSchoolId || 's1111111-aaaa-1111-aaaa-111111111111'
  );

  // Sync state to LocalStorage
  useEffect(() => {
    const stateToSave = {
      schools,
      profiles,
      categories,
      itemTypes,
      foundItems,
      lostReports,
      claims,
      returnInfoList,
      notifications,
      auditLogs,
      currentUserId,
      currentSchoolId
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }, [
    schools,
    profiles,
    categories,
    itemTypes,
    foundItems,
    lostReports,
    claims,
    returnInfoList,
    notifications,
    auditLogs,
    currentUserId,
    currentSchoolId
  ]);

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0];
  const currentSchool = schools.find((s) => s.id === currentSchoolId) || schools[0];

  const switchUser = (userId: string) => {
    const found = profiles.find((p) => p.id === userId);
    if (found) {
      setCurrentUserId(userId);
    }
  };

  const switchSchool = (schoolId: string) => {
    const found = schools.find((s) => s.id === schoolId);
    if (found) {
      setCurrentSchoolId(schoolId);
    }
  };

  const joinSchool = (joinCode: string) => {
    const target = schools.find(
      (s) => s.join_code.trim().toUpperCase() === joinCode.trim().toUpperCase()
    );
    if (!target) {
      return { success: false, message: 'รหัสเข้าร่วมไม่ถูกต้อง กรุณาตรวจสอบรหัสจากอาจารย์หรือทางโรงเรียน' };
    }
    setCurrentSchoolId(target.id);
    return { success: true, message: `ยินดีต้อนรับสู่ ${target.name}` };
  };

  const updateSchoolSettings = (schoolId: string, updates: Partial<School>) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
    );
    // Add audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      school_id: schoolId,
      actor_id: currentUser.id,
      actor_name: currentUser.display_name,
      action: 'UPDATE_SCHOOL_SETTINGS',
      entity_type: 'schools',
      entity_id: schoolId,
      metadata: { updates },
      created_at: new Date().toISOString()
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const createFoundItem = (data: any) => {
    const cat = categories.find((c) => c.id === data.category_id);
    const itype = itemTypes.find((t) => t.id === data.item_type_id);

    const newItem: FoundItem = {
      id: `item-found-${Date.now()}`,
      school_id: currentSchool.id,
      posted_by: currentUser.id,
      poster_name: currentUser.display_name,
      item_name: data.item_name,
      category_id: data.category_id,
      category_name: cat?.name || 'ไม่ระบุ',
      item_type_id: data.item_type_id,
      item_type_name: itype?.name || 'ไม่ระบุ',
      color: data.color,
      brand: data.brand || '',
      description: data.description,
      photo_url: data.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
      location_found: data.location_found,
      date_found: data.date_found || new Date().toISOString().split('T')[0],
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setFoundItems((prev) => [newItem, ...prev]);

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      school_id: currentSchool.id,
      actor_id: currentUser.id,
      actor_name: currentUser.display_name,
      action: 'CREATE_FOUND_ITEM',
      entity_type: 'found_items',
      entity_id: newItem.id,
      metadata: { item_name: newItem.item_name },
      created_at: new Date().toISOString()
    };
    setAuditLogs((prev) => [log, ...prev]);

    return newItem;
  };

  const updateFoundItem = (itemId: string, updates: Partial<FoundItem>) => {
    setFoundItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, ...updates, updated_at: new Date().toISOString() } : it))
    );
  };

  const deleteFoundItem = (itemId: string) => {
    setFoundItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const createLostReport = (data: any) => {
    const cat = categories.find((c) => c.id === data.category_id);
    const itype = itemTypes.find((t) => t.id === data.item_type_id);

    const newReport: LostReport = {
      id: `report-lost-${Date.now()}`,
      school_id: currentSchool.id,
      reported_by: currentUser.id,
      reporter_name: currentUser.display_name,
      item_name: data.item_name,
      category_id: data.category_id,
      category_name: cat?.name || 'ไม่ระบุ',
      item_type_id: data.item_type_id,
      item_type_name: itype?.name || 'ไม่ระบุ',
      color: data.color,
      brand: data.brand || '',
      description: data.description,
      photo_url: data.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
      last_known_location: data.last_known_location,
      date_lost: data.date_lost || new Date().toISOString().split('T')[0],
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setLostReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  const updateLostReport = (reportId: string, updates: Partial<LostReport>) => {
    setLostReports((prev) =>
      prev.map((rep) => (rep.id === reportId ? { ...rep, ...updates, updated_at: new Date().toISOString() } : rep))
    );
  };

  const deleteLostReport = (reportId: string) => {
    setLostReports((prev) => prev.filter((rep) => rep.id !== reportId));
  };

  const submitClaim = (itemId: string, verificationAnswer: string) => {
    const item = foundItems.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: 'ไม่พบสิ่งของที่ต้องการขอรับ' };
    }
    if (item.posted_by === currentUser.id) {
      return { success: false, message: 'คุณไม่สามารถส่งคำขอรับสิ่งของที่คุณเป็นผู้โพสต์เองได้' };
    }

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      item_id: itemId,
      item_name: item.item_name,
      claimant_id: currentUser.id,
      claimant_name: currentUser.display_name,
      claimant_email: currentUser.email,
      verification_answer: verificationAnswer,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setClaims((prev) => [newClaim, ...prev]);

    // Update item status
    updateFoundItem(itemId, { status: 'CLAIM_PENDING' });

    // Notification to Poster
    const notifPoster: Notification = {
      id: `notif-${Date.now()}-1`,
      user_id: item.posted_by,
      type: 'NEW_CLAIM',
      title: 'มีผู้ส่งคำขอรับสิ่งของที่คุณพบ!',
      message: `มีผู้ส่งคำขอยืนยันความเป็นเจ้าของสิ่งของ '${item.item_name}' แอดมินกำลังตรวจสอบความถูกต้อง`,
      related_item_id: item.id,
      related_claim_id: newClaim.id,
      is_read: false,
      created_at: new Date().toISOString()
    };

    // Notification to Claimant
    const notifClaimant: Notification = {
      id: `notif-${Date.now()}-2`,
      user_id: currentUser.id,
      type: 'CLAIM_SUBMITTED',
      title: 'ส่งคำขอรับสิ่งของเรียบร้อยแล้ว',
      message: `คำขอยืนยันความเป็นเจ้าของ '${item.item_name}' ถูกส่งแล้ว กรุณารอการตรวจสอบจากอาจารย์/แอดมิน`,
      related_item_id: item.id,
      related_claim_id: newClaim.id,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications((prev) => [notifPoster, notifClaimant, ...prev]);

    return { success: true, claim: newClaim, message: 'ส่งคำขอยืนยันความเป็นเจ้าของเรียบร้อยแล้ว!' };
  };

  const reviewClaim = (claimId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) return;

    const item = foundItems.find((i) => i.id === claim.item_id);

    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status,
              rejection_reason: rejectionReason,
              reviewed_by: currentUser.id,
              reviewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : c
      )
    );

    if (item) {
      if (status === 'APPROVED') {
        updateFoundItem(item.id, { status: 'CLAIM_APPROVED' });

        // Notification to Claimant
        const notifC: Notification = {
          id: `notif-${Date.now()}-c`,
          user_id: claim.claimant_id,
          type: 'CLAIM_APPROVED',
          title: 'คำขอยืนยันสิทธิ์ได้รับการอนุมัติแล้ว!',
          message: `คำขอรับสิ่งของ '${item.item_name}' ผ่านการตรวจสอบแล้ว ผู้พบจะนัดหมายสถานที่และเวลารับคืนในระบบ`,
          related_item_id: item.id,
          related_claim_id: claim.id,
          is_read: false,
          created_at: new Date().toISOString()
        };

        // Notification to Poster to schedule return
        const notifP: Notification = {
          id: `notif-${Date.now()}-p`,
          user_id: item.posted_by,
          type: 'POSTER_RETURN_REQUIRED',
          title: 'มีคำขอรับของได้รับการอนุมัติ: กรุณานัดรับคืน',
          message: `คำขอรับของ '${item.item_name}' ได้รับการอนุมัติแล้ว กรุณาระบุสถานที่และเวลานัดรับเพื่อให้ผู้เป็นเจ้าของมารับสิ่งของ`,
          related_item_id: item.id,
          related_claim_id: claim.id,
          is_read: false,
          created_at: new Date().toISOString()
        };

        setNotifications((prev) => [notifC, notifP, ...prev]);
      } else {
        // Rejected
        updateFoundItem(item.id, { status: 'AVAILABLE' });

        const notifR: Notification = {
          id: `notif-${Date.now()}-r`,
          user_id: claim.claimant_id,
          type: 'CLAIM_REJECTED',
          title: 'คำขอรับสิ่งของไม่ผ่านการอนุมัติ',
          message: `คำขอรับสิ่งของ '${item.item_name}' ไม่ผ่านการอนุมัติ: ${rejectionReason || 'ข้อมูลยืนยันความเป็นเจ้าของไม่สอดคล้องกับสิ่งของ'}`,
          related_item_id: item.id,
          related_claim_id: claim.id,
          is_read: false,
          created_at: new Date().toISOString()
        };
        setNotifications((prev) => [notifR, ...prev]);
      }

      // Audit Log
      const log: AuditLog = {
        id: `log-${Date.now()}`,
        school_id: item.school_id,
        actor_id: currentUser.id,
        actor_name: currentUser.display_name,
        action: `CLAIM_${status}`,
        entity_type: 'claims',
        entity_id: claim.id,
        metadata: { item_name: item.item_name, reason: rejectionReason },
        created_at: new Date().toISOString()
      };
      setAuditLogs((prev) => [log, ...prev]);
    }
  };

  const saveReturnInfo = (claimId: string, data: any) => {
    const claim = claims.find((c) => c.id === claimId);
    const item = claim ? foundItems.find((i) => i.id === claim.item_id) : undefined;

    const existingIndex = returnInfoList.findIndex((r) => r.claim_id === claimId);
    let record: ReturnInformation;

    if (existingIndex >= 0) {
      record = {
        ...returnInfoList[existingIndex],
        ...data,
        updated_at: new Date().toISOString()
      };
      const updated = [...returnInfoList];
      updated[existingIndex] = record;
      setReturnInfoList(updated);
    } else {
      record = {
        id: `return-${Date.now()}`,
        claim_id: claimId,
        pickup_location: data.pickup_location,
        pickup_date: data.pickup_date,
        pickup_time: data.pickup_time,
        contact_method: data.contact_method,
        notes: data.notes,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setReturnInfoList((prev) => [record, ...prev]);
    }

    if (item) {
      updateFoundItem(item.id, { status: 'READY_FOR_PICKUP' });

      // Notify claimant that return info is ready!
      if (claim) {
        const notif: Notification = {
          id: `notif-${Date.now()}-ret`,
          user_id: claim.claimant_id,
          type: 'RETURN_INFO_READY',
          title: 'มีข้อมูลนัดรับสิ่งของแล้ว!',
          message: `ผู้พบสิ่งของ '${item.item_name}' ได้ระบุสถานที่และเวลานัดรับแล้ว: ${data.pickup_location} (${data.pickup_time})`,
          related_item_id: item.id,
          related_claim_id: claim.id,
          is_read: false,
          created_at: new Date().toISOString()
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }

    return record;
  };

  const getReturnInfoForClaim = (claimId: string): { allowed: boolean; data?: ReturnInformation; error?: string } => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) {
      return { allowed: false, error: 'ไม่พบคำขอรับสิ่งของนี้' };
    }

    const item = foundItems.find((i) => i.id === claim.item_id);
    if (!item) {
      return { allowed: false, error: 'ไม่พบสิ่งของที่เชื่อมโยง' };
    }

    // STRICT SECURITY ACCESS VERIFICATION
    const isPoster = item.posted_by === currentUser.id;
    const isApprovedClaimant = claim.claimant_id === currentUser.id && claim.status === 'APPROVED';
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isPoster && !isApprovedClaimant && !isAdmin) {
      return {
        allowed: false,
        error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลการนัดรับสิ่งของนี้ (Privacy & Security Protection: ข้อมูลนี้เข้าถึงได้เฉพาะผู้พบ, ผู้ได้รับอนุมัติ และแอดมินเท่านั้น)'
      };
    }

    const returnRec = returnInfoList.find((r) => r.claim_id === claimId);
    if (!returnRec) {
      return {
        allowed: true,
        data: undefined,
        error: 'ยังไม่มีข้อมูลการนัดรับสิ่งของ ผู้พบยังไม่ได้ระบุ'
      };
    }

    return { allowed: true, data: returnRec };
  };

  const markItemReturned = (itemId: string) => {
    updateFoundItem(itemId, { status: 'RETURNED' });
    const item = foundItems.find((i) => i.id === itemId);

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      school_id: currentSchool.id,
      actor_id: currentUser.id,
      actor_name: currentUser.display_name,
      action: 'MARK_ITEM_RETURNED',
      entity_type: 'found_items',
      entity_id: itemId,
      metadata: { item_name: item?.item_name },
      created_at: new Date().toISOString()
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.user_id === currentUser.id ? { ...n, is_read: true } : n))
    );
  };

  const toggleUserStatus = (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, status: newStatus } : p))
    );
    const target = profiles.find((p) => p.id === userId);
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      school_id: currentSchool.id,
      actor_id: currentUser.id,
      actor_name: currentUser.display_name,
      action: `USER_STATUS_${newStatus}`,
      entity_type: 'profiles',
      entity_id: userId,
      metadata: { user_name: target?.display_name, new_status: newStatus },
      created_at: new Date().toISOString()
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const addCategory = (name: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      created_at: new Date().toISOString()
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const addItemType = (categoryId: string, name: string) => {
    const newType: ItemType = {
      id: `type-${Date.now()}`,
      category_id: categoryId,
      name,
      created_at: new Date().toISOString()
    };
    setItemTypes((prev) => [...prev, newType]);
    return newType;
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSchools(INITIAL_SCHOOLS);
    setProfiles(INITIAL_PROFILES);
    setCategories(INITIAL_CATEGORIES);
    setItemTypes(INITIAL_ITEM_TYPES);
    setFoundItems(INITIAL_FOUND_ITEMS);
    setLostReports(INITIAL_LOST_REPORTS);
    setClaims(INITIAL_CLAIMS);
    setReturnInfoList(INITIAL_RETURN_INFO);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId('u-student-a-0002');
    setCurrentSchoolId('s1111111-aaaa-1111-aaaa-111111111111');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentSchool,
        schools,
        profiles,
        categories,
        itemTypes,
        foundItems,
        lostReports,
        claims,
        notifications,
        auditLogs,
        switchUser,
        switchSchool,
        joinSchool,
        updateSchoolSettings,
        createFoundItem,
        updateFoundItem,
        deleteFoundItem,
        createLostReport,
        updateLostReport,
        deleteLostReport,
        submitClaim,
        reviewClaim,
        saveReturnInfo,
        getReturnInfoForClaim,
        markItemReturned,
        markNotificationRead,
        markAllNotificationsRead,
        toggleUserStatus,
        addCategory,
        addItemType,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
