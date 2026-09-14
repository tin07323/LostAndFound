import { Category, ItemType, School, Profile, FoundItem, LostReport, Claim, ReturnInformation, Notification, AuditLog } from '../types';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 's1111111-aaaa-1111-aaaa-111111111111',
    name: 'โรงเรียนสาธิตเตรียมอุดมวิทยาคม',
    join_code: 'TPN-2026',
    logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    primary_color: '#2563EB',
    banner_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's2222222-bbbb-2222-bbbb-222222222222',
    name: 'โรงเรียนนานาชาติสยามวิทยพัฒน์',
    join_code: 'SIAM-888',
    logo_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80',
    primary_color: '#059669',
    banner_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'u-student-a-0002',
    email: 'student.a@tpn.ac.th',
    display_name: 'สมชาย รักการเรียน (ผู้แจ้งพบของ - Student A)',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
    role: 'STUDENT',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-student-b-0003',
    email: 'student.b@tpn.ac.th',
    display_name: 'กานดา สดใส (ผู้ขอรับของที่ได้รับอนุมัติ - Student B)',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    role: 'STUDENT',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-student-c-0004',
    email: 'student.c@tpn.ac.th',
    display_name: 'ธนวัฒน์ ปรีชา (นักเรียนคนอื่น - Student C)',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
    role: 'STUDENT',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-admin-0001',
    email: 'admin@tpn.ac.th',
    display_name: 'อาจารย์วิภาดา (แอดมินฝ่ายกิจการนักเรียน)',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'อุปกรณ์อิเล็กทรอนิกส์', created_at: new Date().toISOString() },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'เครื่องเขียน', created_at: new Date().toISOString() },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'กระเป๋า', created_at: new Date().toISOString() },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'เสื้อผ้าและเครื่องแต่งกาย', created_at: new Date().toISOString() },
  { id: 'c5555555-5555-5555-5555-555555555555', name: 'ขวดน้ำและกระบอกน้ำ', created_at: new Date().toISOString() },
  { id: 'c6666666-6666-6666-6666-666666666666', name: 'เครื่องประดับและนาฬิกา', created_at: new Date().toISOString() },
  { id: 'c7777777-7777-7777-7777-777777777777', name: 'อุปกรณ์กีฬา', created_at: new Date().toISOString() },
  { id: 'c8888888-8888-8888-8888-888888888888', name: 'หนังสือและเอกสาร', created_at: new Date().toISOString() },
  { id: 'c9999999-9999-9999-9999-999999999999', name: 'อื่น ๆ', created_at: new Date().toISOString() }
];

export const INITIAL_ITEM_TYPES: ItemType[] = [
  { id: 't101', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'โทรศัพท์มือถือ / สมาร์ทโฟน', created_at: new Date().toISOString() },
  { id: 't102', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'หูฟัง / AirPods', created_at: new Date().toISOString() },
  { id: 't103', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'สายชาร์จ / อะแดปเตอร์', created_at: new Date().toISOString() },
  { id: 't104', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'พาวเวอร์แบงค์ (Power Bank)', created_at: new Date().toISOString() },
  { id: 't105', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'แท็บเล็ต / iPad', created_at: new Date().toISOString() },
  { id: 't106', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'เครื่องคิดเลขวิทยาศาสตร์', created_at: new Date().toISOString() },
  { id: 't201', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'ปากกา / ปากกาเจล', created_at: new Date().toISOString() },
  { id: 't202', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'ดินสอกด / ดินสอไม้', created_at: new Date().toISOString() },
  { id: 't203', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'ไม้บรรทัด / ชุดเรขาคณิต', created_at: new Date().toISOString() },
  { id: 't301', category_id: 'c3333333-3333-3333-3333-333333333333', name: 'กระเป๋านักเรียน / เป้สะพายหลัง', created_at: new Date().toISOString() },
  { id: 't302', category_id: 'c3333333-3333-3333-3333-333333333333', name: 'กระเป๋าดินสอ', created_at: new Date().toISOString() },
  { id: 't303', category_id: 'c3333333-3333-3333-3333-333333333333', name: 'กระเป๋าสตางค์ / ซองใส่บัตร', created_at: new Date().toISOString() },
  { id: 't401', category_id: 'c4444444-4444-4444-4444-444444444444', name: 'เสื้อกันหนาว / แจ็คเก็ต', created_at: new Date().toISOString() },
  { id: 't402', category_id: 'c4444444-4444-4444-4444-444444444444', name: 'เสื้อพละ / เสื้อนักเรียน', created_at: new Date().toISOString() },
  { id: 't501', category_id: 'c5555555-5555-5555-5555-555555555555', name: 'กระบอกน้ำเก็บอุณหภูมิ', created_at: new Date().toISOString() },
  { id: 't601', category_id: 'c6666666-6666-6666-6666-666666666666', name: 'นาฬิกาข้อมือ / Smart Watch', created_at: new Date().toISOString() },
  { id: 't701', category_id: 'c7777777-7777-7777-7777-777777777777', name: 'ลูกบาส / ลูกฟุตบอล', created_at: new Date().toISOString() },
  { id: 't801', category_id: 'c8888888-8888-8888-8888-888888888888', name: 'สมุดจดการบ้าน / ชีทเรียน', created_at: new Date().toISOString() },
  { id: 't901', category_id: 'c9999999-9999-9999-9999-999999999999', name: 'พวงกุญแจ / กุญแจ', created_at: new Date().toISOString() }
];

export const INITIAL_FOUND_ITEMS: FoundItem[] = [
  {
    id: 'item-found-001',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    posted_by: 'u-student-a-0002',
    poster_name: 'สมชาย รักการเรียน (ม.5/1)',
    item_name: 'หูฟัง AirPods Pro เคสสีขาวพร้อมสติ๊กเกอร์ไดโนเสาร์',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    category_name: 'อุปกรณ์อิเล็กทรอนิกส์',
    item_type_id: 't102',
    item_type_name: 'หูฟัง / AirPods',
    color: 'ขาว',
    brand: 'Apple',
    description: 'พบตกอยู่ที่ม้านั่งหินอ่อนหน้าโรงอาหาร อาคาร 3 ช่วงพักกลางวัน มีเคสซิลิโคนสีขาวติดสติ๊กเกอร์ไดโนเสาร์สีเขียวด้านหลัง',
    photo_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
    location_found: 'โรงอาหาร อาคาร 3 ม้านั่งหินอ่อน',
    date_found: '2026-09-12',
    status: 'READY_FOR_PICKUP',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'item-found-002',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    posted_by: 'u-student-a-0002',
    poster_name: 'สมชาย รักการเรียน (ม.5/1)',
    item_name: 'กระติกน้ำสแตนเลส Hydro Flask สีน้ำเงินเข้ม',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    category_name: 'ขวดน้ำและกระบอกน้ำ',
    item_type_id: 't501',
    item_type_name: 'กระบอกน้ำเก็บอุณหภูมิ',
    color: 'น้ำเงิน',
    brand: 'Hydro Flask',
    description: 'ลืมไว้ที่อัฒจันทร์โรงยิมหลังคาโค้ง มีรอยบุบเล็กน้อยที่ก้นขวด ขนาด 24 oz',
    photo_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    location_found: 'โรงยิม ชั้น 2 อัฒจันทร์',
    date_found: '2026-09-13',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'item-found-003',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    posted_by: 'u-student-c-0004',
    poster_name: 'ธนวัฒน์ ปรีชา (ม.6/2)',
    item_name: 'เสื้อกันหนาวฮู้ดแขนยาว สีเทา Uniqlo',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    category_name: 'เสื้อผ้าและเครื่องแต่งกาย',
    item_type_id: 't401',
    item_type_name: 'เสื้อกันหนาว / แจ็คเก็ต',
    color: 'เทา',
    brand: 'Uniqlo',
    description: 'แขวนลืมไว้ที่เก้าอี้ห้องสมุด โซนอ่านหนังสือชั้น 2 ไซส์ L',
    photo_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    location_found: 'ห้องสมุดกลาง ชั้น 2',
    date_found: '2026-09-13',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'item-found-004',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    posted_by: 'u-admin-0001',
    poster_name: 'อาจารย์วิภาดา (ฝ่ายกิจการนักเรียน)',
    item_name: 'เครื่องคิดเลขวิทยาศาสตร์ Casio fx-991EX',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    category_name: 'อุปกรณ์อิเล็กทรอนิกส์',
    item_type_id: 't106',
    item_type_name: 'เครื่องคิดเลขวิทยาศาสตร์',
    color: 'ดำ',
    brand: 'Casio',
    description: 'มีผู้เก็บได้ที่ห้องสอบ 314 ฝาหลังมีสติ๊กเกอร์เขียนชื่อย่อ ค.พ.',
    photo_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    location_found: 'อาคารเรียน 3 ห้องสอบ 314',
    date_found: '2026-09-11',
    status: 'RETURNED',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_LOST_REPORTS: LostReport[] = [
  {
    id: 'report-lost-001',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    reported_by: 'u-student-b-0003',
    reporter_name: 'กานดา สดใส (ม.4/3)',
    item_name: 'กระเป๋าดินสอ Sanrio ลาย Kuromi สีม่วง',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    category_name: 'กระเป๋า',
    item_type_id: 't302',
    item_type_name: 'กระเป๋าดินสอ',
    color: 'ม่วง',
    brand: 'Sanrio',
    description: 'ข้างในมีปากกา Sarasa หลายสี และดินสอกด Kuru Toga สีชมพู หายหลังจากเรียนคาบคณิตศาสตร์ห้อง 421',
    photo_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
    last_known_location: 'ห้องเรียน 421 อาคารเฉลิมพระเกียรติ',
    date_lost: '2026-09-12',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'report-lost-002',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    reported_by: 'u-student-c-0004',
    reporter_name: 'ธนวัฒน์ ปรีชา (ม.6/2)',
    item_name: 'นาฬิกา Smartwatch Garmin Forerunner สีดำ',
    category_id: 'c6666666-6666-6666-6666-666666666666',
    category_name: 'เครื่องประดับและนาฬิกา',
    item_type_id: 't601',
    item_type_name: 'นาฬิกาข้อมือ / Smart Watch',
    color: 'ดำ',
    brand: 'Garmin',
    description: 'ถอดวางไว้ข้างสนามฟุตบอลช่วงซ้อมกีฬาตอนเย็น สายยางซิลิโคนสีดำ มีรอยขีดข่วนเล็กน้อยที่ขอบหน้าปัด',
    photo_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    last_known_location: 'ข้างสนามฟุตบอลหน้าเสาธง',
    date_lost: '2026-09-13',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'claim-001',
    item_id: 'item-found-001',
    item_name: 'หูฟัง AirPods Pro เคสสีขาวพร้อมสติ๊กเกอร์ไดโนเสาร์',
    claimant_id: 'u-student-b-0003',
    claimant_name: 'กานดา สดใส (ม.4/3)',
    claimant_email: 'student.b@tpn.ac.th',
    verification_answer: 'เคสด้านในมีรอยขีดข่วนสีเทา และชื่อบลูทูธที่เคยตั้งไว้คือ "Kanda AirPods" มีรูปไดโนเสาร์ติดข้างหลังค่ะ สามารถเปิดบลูทูธทดสอบจับคู่ได้เลยค่ะ',
    status: 'APPROVED',
    reviewed_by: 'u-admin-0001',
    reviewed_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

export const INITIAL_RETURN_INFO: ReturnInformation[] = [
  {
    id: 'return-001',
    claim_id: 'claim-001',
    pickup_location: 'ห้องฝ่ายกิจการนักเรียน อาคาร 1 ชั้น 2 (โต๊ะอาจารย์เวร)',
    pickup_date: '2026-09-14',
    pickup_time: '15:30 - 16:30 น.',
    contact_method: 'โทรแจ้ง 089-123-4567 หรือ LINE ID: somchai_st',
    notes: 'กรุณานำบัตรนักเรียนตัวจริงมาแสดงเพื่อยืนยันตัวตนต่อหน้าอาจารย์เวรด้วยนะครับ',
    created_by: 'u-student-a-0002',
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 16).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    user_id: 'u-student-b-0003',
    type: 'RETURN_INFO_READY',
    title: 'มีข้อมูลนัดรับสิ่งของแล้ว!',
    message: 'ผู้พบสิ่งของ AirPods Pro ได้ระบุสถานที่และเวลานัดรับเรียบร้อยแล้ว: ห้องฝ่ายกิจการนักเรียน อาคาร 1 ชั้น 2 (15:30 - 16:30 น.)',
    related_item_id: 'item-found-001',
    related_claim_id: 'claim-001',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: 'notif-002',
    user_id: 'u-student-a-0002',
    type: 'CLAIM_APPROVED',
    title: 'คำขอรับสิ่งของได้รับการอนุมัติ',
    message: 'คำขอรับคืนสำหรับ AirPods Pro เคสสีขาว ได้รับการอนุมัติแล้ว คุณสามารถตรวจสอบหรืออัปเดตเวลานัดรับของได้ตลอดเวลา',
    related_item_id: 'item-found-001',
    related_claim_id: 'claim-001',
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    actor_id: 'u-admin-0001',
    actor_name: 'อาจารย์วิภาดา (แอดมินฝ่ายกิจการนักเรียน)',
    action: 'CLAIM_APPROVED',
    entity_type: 'claims',
    entity_id: 'claim-001',
    metadata: { item_name: 'หูฟัง AirPods Pro', claimant: 'กานดา สดใส' },
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'log-002',
    school_id: 's1111111-aaaa-1111-aaaa-111111111111',
    actor_id: 'u-admin-0001',
    actor_name: 'อาจารย์วิภาดา (แอดมินฝ่ายกิจการนักเรียน)',
    action: 'MARK_ITEM_RETURNED',
    entity_type: 'found_items',
    entity_id: 'item-found-004',
    metadata: { item_name: 'เครื่องคิดเลขวิทยาศาสตร์ Casio fx-991EX' },
    created_at: new Date(Date.now() - 3600000 * 40).toISOString()
  }
];
