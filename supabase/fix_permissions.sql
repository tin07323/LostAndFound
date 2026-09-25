-- =====================================================================
-- LOST & FOUND SCHOOL PLATFORM - FIX PERMISSIONS & SEED TPN-2026
-- คัดลอกโค้ดทั้งหมดนี้ไปวางใน Supabase -> เมนู SQL Editor (ไอคอน >_) -> กด Run
-- =====================================================================

-- 1. ปลดล็อค RLS เพื่อให้เว็บแอป Lost & Found บันทึกข้อมูลโรงเรียน, สมาชิก, ของหาย ลง Supabase ได้ 100%
ALTER TABLE IF EXISTS public.schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.item_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.found_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lost_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.return_information DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;

-- 2. ปรับปรุงตาราง profiles ให้รองรับการสมัครสมาชิกผ่านเว็บแอปโดยตรง
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. เพิ่มคอลัมน์การรับของคืนในตาราง schools หากยังไม่มี
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS default_pickup_location TEXT DEFAULT 'ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง';
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS meeting_locations JSONB DEFAULT '["ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง", "ป้อมเจ้าหน้าที่รักษาความปลอดภัย ประตูหลัก", "ห้องสมุดกลาง ชั้น 1", "ห้องพักครูเวรประจำวัน"]'::jsonb;

-- 4. มอบสิทธิ์การอ่านเขียนเต็มรูปแบบให้แก่ผู้ใช้ anon และ authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 5. บันทึกโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า (รหัส TPN-2026) ลงในฐานข้อมูล Supabase ทันที
INSERT INTO public.schools (id, name, join_code, primary_color, default_pickup_location)
VALUES (
    'a1111111-0000-0000-0000-000000000001',
    'โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า (TPN-2026)',
    'TPN-2026',
    '#2563EB',
    'ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง'
)
ON CONFLICT (join_code) DO UPDATE SET
    name = EXCLUDED.name,
    primary_color = EXCLUDED.primary_color,
    default_pickup_location = EXCLUDED.default_pickup_location;

-- 6. เพิ่มหมวดหมู่มาตรฐาน (Categories)
INSERT INTO public.categories (id, name) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'อุปกรณ์อิเล็กทรอนิกส์'),
    ('c2222222-2222-2222-2222-222222222222', 'เครื่องเขียน'),
    ('c3333333-3333-3333-3333-333333333333', 'กระเป๋า'),
    ('c4444444-4444-4444-4444-444444444444', 'เสื้อผ้าและเครื่องแต่งกาย'),
    ('c5555555-5555-5555-5555-555555555555', 'ขวดน้ำและกระบอกน้ำ'),
    ('c6666666-6666-6666-6666-666666666666', 'เครื่องประดับและนาฬิกา'),
    ('c7777777-7777-7777-7777-777777777777', 'อุปกรณ์กีฬา'),
    ('c8888888-8888-8888-8888-888888888888', 'หนังสือและเอกสาร'),
    ('c9999999-9999-9999-9999-999999999999', 'อื่น ๆ')
ON CONFLICT (id) DO NOTHING;

-- 7. เพิ่มประเภทสิ่งของย่อย (Item Types)
INSERT INTO public.item_types (id, category_id, name) VALUES
    ('d1111111-0000-0000-0000-000000000101', 'c1111111-1111-1111-1111-111111111111', 'โทรศัพท์มือถือ / สมาร์ทโฟน'),
    ('d1111111-0000-0000-0000-000000000102', 'c1111111-1111-1111-1111-111111111111', 'หูฟัง / AirPods'),
    ('d1111111-0000-0000-0000-000000000103', 'c1111111-1111-1111-1111-111111111111', 'สายชาร์จ / อะแดปเตอร์'),
    ('d1111111-0000-0000-0000-000000000104', 'c1111111-1111-1111-1111-111111111111', 'พาวเวอร์แบงค์ (Power Bank)'),
    ('d1111111-0000-0000-0000-000000000105', 'c1111111-1111-1111-1111-111111111111', 'แท็บเล็ต / iPad'),
    ('d1111111-0000-0000-0000-000000000106', 'c1111111-1111-1111-1111-111111111111', 'เครื่องคิดเลขวิทยาศาสตร์'),
    ('d2222222-0000-0000-0000-000000000201', 'c2222222-2222-2222-2222-222222222222', 'ปากกา / ปากกาเจล'),
    ('d2222222-0000-0000-0000-000000000202', 'c2222222-2222-2222-2222-222222222222', 'ดินสอกด / ดินสอไม้'),
    ('d2222222-0000-0000-0000-000000000203', 'c2222222-2222-2222-2222-222222222222', 'ไม้บรรทัด / ชุดเรขาคณิต'),
    ('d3333333-0000-0000-0000-000000000301', 'c3333333-3333-3333-3333-333333333333', 'กระเป๋านักเรียน / เป้สะพายหลัง'),
    ('d3333333-0000-0000-0000-000000000302', 'c3333333-3333-3333-3333-333333333333', 'กระเป๋าดินสอ'),
    ('d3333333-0000-0000-0000-000000000303', 'c3333333-3333-3333-3333-333333333333', 'กระเป๋าสตางค์ / ซองใส่บัตร'),
    ('d4444444-0000-0000-0000-000000000401', 'c4444444-4444-4444-4444-444444444444', 'เสื้อกันหนาว / แจ็คเก็ต'),
    ('d4444444-0000-0000-0000-000000000402', 'c4444444-4444-4444-4444-444444444444', 'เสื้อพละ / เสื้อนักเรียน'),
    ('d5555555-0000-0000-0000-000000000501', 'c5555555-5555-5555-5555-555555555555', 'กระบอกน้ำเก็บอุณหภูมิ'),
    ('d6666666-0000-0000-0000-000000000601', 'c6666666-6666-6666-6666-666666666666', 'นาฬิกาข้อมือ / Smart Watch'),
    ('d7777777-0000-0000-0000-000000000701', 'c7777777-7777-7777-7777-777777777777', 'ลูกบาส / ลูกฟุตบอล'),
    ('d8888888-0000-0000-0000-000000000801', 'c8888888-8888-8888-8888-888888888888', 'สมุดจดการบ้าน / ชีทเรียน'),
    ('d9999999-0000-0000-0000-000000000901', 'c9999999-9999-9999-9999-999999999999', 'พวงกุญแจ / กุญแจ')
ON CONFLICT (id) DO NOTHING;
