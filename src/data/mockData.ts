import { Category, ItemType, School, Profile, FoundItem, LostReport, Claim, ReturnInformation, Notification, AuditLog } from '../types';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'a1111111-0000-0000-0000-000000000001',
    name: 'โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า (TPN-2026)',
    join_code: 'TPN-2026',
    logo_url: '',
    primary_color: '#2563EB',
    banner_url: '',
    default_pickup_location: 'ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง',
    meeting_locations: [
      'ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง',
      'ป้อมเจ้าหน้าที่รักษาความปลอดภัย ประตูหลัก',
      'ห้องสมุดกลาง ชั้น 1',
      'ห้องพักครูเวรประจำวัน'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PROFILES: Profile[] = [];

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

export const INITIAL_FOUND_ITEMS: FoundItem[] = [];

export const INITIAL_LOST_REPORTS: LostReport[] = [];

export const INITIAL_CLAIMS: Claim[] = [];

export const INITIAL_RETURN_INFO: ReturnInformation[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
