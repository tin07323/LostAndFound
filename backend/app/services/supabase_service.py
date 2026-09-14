import os
import uuid
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from backend.app.core.config import settings

class SupabaseDataStore:
    """
    Supabase Data Store Manager.
    Uses Supabase Client when configured; otherwise falls back to a high-fidelity
    in-memory database populated with initial seed data matching supabase/seed.sql.
    """
    def __init__(self):
        self.client = None
        self.is_connected = False
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
                self.is_connected = True
            except Exception as e:
                print(f"Supabase client connection notice: {e}")
                self.is_connected = False

        # In-memory store for fallback / local testing
        self.schools: Dict[str, dict] = {}
        self.profiles: Dict[str, dict] = {}
        self.school_members: Dict[str, dict] = {}
        self.categories: Dict[str, dict] = {}
        self.item_types: Dict[str, dict] = {}
        self.found_items: Dict[str, dict] = {}
        self.lost_reports: Dict[str, dict] = {}
        self.claims: Dict[str, dict] = {}
        self.return_information: Dict[str, dict] = {}
        self.notifications: Dict[str, dict] = {}
        self.audit_logs: Dict[str, dict] = {}

        self._load_seed_data()

    def _load_seed_data(self):
        # 1. Categories
        cat_data = [
            ("c1111111-1111-1111-1111-111111111111", "อุปกรณ์อิเล็กทรอนิกส์"),
            ("c2222222-2222-2222-2222-222222222222", "เครื่องเขียน"),
            ("c3333333-3333-3333-3333-333333333333", "กระเป๋า"),
            ("c4444444-4444-4444-4444-444444444444", "เสื้อผ้าและเครื่องแต่งกาย"),
            ("c5555555-5555-5555-5555-555555555555", "ขวดน้ำและกระบอกน้ำ"),
            ("c6666666-6666-6666-6666-666666666666", "เครื่องประดับและนาฬิกา"),
            ("c7777777-7777-7777-7777-777777777777", "อุปกรณ์กีฬา"),
            ("c8888888-8888-8888-8888-888888888888", "หนังสือและเอกสาร"),
            ("c9999999-9999-9999-9999-999999999999", "อื่น ๆ"),
        ]
        for cid, name in cat_data:
            self.categories[cid] = {"id": cid, "name": name, "created_at": datetime.now()}

        # 2. Item types
        types_data = [
            ("t101", "c1111111-1111-1111-1111-111111111111", "โทรศัพท์มือถือ / สมาร์ทโฟน"),
            ("t102", "c1111111-1111-1111-1111-111111111111", "หูฟัง / AirPods"),
            ("t103", "c1111111-1111-1111-1111-111111111111", "สายชาร์จ / อะแดปเตอร์"),
            ("t104", "c1111111-1111-1111-1111-111111111111", "พาวเวอร์แบงค์ (Power Bank)"),
            ("t105", "c1111111-1111-1111-1111-111111111111", "แท็บเล็ต / iPad"),
            ("t106", "c1111111-1111-1111-1111-111111111111", "เครื่องคิดเลขวิทยาศาสตร์"),
            ("t201", "c2222222-2222-2222-2222-222222222222", "ปากกา / ปากกาเจล"),
            ("t202", "c2222222-2222-2222-2222-222222222222", "ดินสอกด / ดินสอไม้"),
            ("t203", "c2222222-2222-2222-2222-222222222222", "ไม้บรรทัด / ชุดเรขาคณิต"),
            ("t301", "c3333333-3333-3333-3333-333333333333", "กระเป๋านักเรียน / เป้สะพายหลัง"),
            ("t302", "c3333333-3333-3333-3333-333333333333", "กระเป๋าดินสอ"),
            ("t303", "c3333333-3333-3333-3333-333333333333", "กระเป๋าสตางค์ / ซองใส่บัตร"),
            ("t401", "c4444444-4444-4444-4444-444444444444", "เสื้อกันหนาว / แจ็คเก็ต"),
            ("t402", "c4444444-4444-4444-4444-444444444444", "เสื้อพละ / เสื้อนักเรียน"),
            ("t501", "c5555555-5555-5555-5555-555555555555", "กระบอกน้ำเก็บอุณหภูมิ"),
            ("t601", "c6666666-6666-6666-6666-666666666666", "นาฬิกาข้อมือ / Smart Watch"),
            ("t701", "c7777777-7777-7777-7777-777777777777", "ลูกบาส / ลูกฟุตบอล"),
            ("t801", "c8888888-8888-8888-8888-888888888888", "สมุดจดการบ้าน / ชีทเรียน"),
            ("t901", "c9999999-9999-9999-9999-999999999999", "พวงกุญแจ / กุญแจ"),
        ]
        for tid, cid, name in types_data:
            self.item_types[tid] = {"id": tid, "category_id": cid, "name": name, "created_at": datetime.now()}

        # 3. Seed Schools
        s1 = "s1111111-aaaa-1111-aaaa-111111111111"
        s2 = "s2222222-bbbb-2222-bbbb-222222222222"
        self.schools[s1] = {
            "id": s1,
            "name": "โรงเรียนสาธิตเตรียมอุดมวิทยาคม",
            "join_code": "TPN-2026",
            "logo_url": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80",
            "primary_color": "#2563EB",
            "banner_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.schools[s2] = {
            "id": s2,
            "name": "โรงเรียนนานาชาติสยามวิทยพัฒน์",
            "join_code": "SIAM-888",
            "logo_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80",
            "primary_color": "#059669",
            "banner_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # 4. Standard Profiles
        # Admin
        u_admin = "u-admin-0001"
        self.profiles[u_admin] = {
            "id": u_admin,
            "email": "admin@tpn.ac.th",
            "display_name": "อาจารย์วิภาดา (แอดมินฝ่ายกิจการนักเรียน)",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
            "role": "ADMIN",
            "status": "ACTIVE",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.school_members["sm-admin-1"] = {
            "id": "sm-admin-1",
            "school_id": s1,
            "user_id": u_admin,
            "role": "ADMIN",
            "status": "ACTIVE",
            "joined_at": datetime.now()
        }

        # Student A (Poster)
        u_student_a = "u-student-a-0002"
        self.profiles[u_student_a] = {
            "id": u_student_a,
            "email": "student.a@tpn.ac.th",
            "display_name": "สมชาย รักการเรียน (ม.5/1)",
            "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80",
            "role": "STUDENT",
            "status": "ACTIVE",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.school_members["sm-student-a"] = {
            "id": "sm-student-a",
            "school_id": s1,
            "user_id": u_student_a,
            "role": "STUDENT",
            "status": "ACTIVE",
            "joined_at": datetime.now()
        }

        # Student B (Claimant)
        u_student_b = "u-student-b-0003"
        self.profiles[u_student_b] = {
            "id": u_student_b,
            "email": "student.b@tpn.ac.th",
            "display_name": "กานดา สดใส (ม.4/3)",
            "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
            "role": "STUDENT",
            "status": "ACTIVE",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.school_members["sm-student-b"] = {
            "id": "sm-student-b",
            "school_id": s1,
            "user_id": u_student_b,
            "role": "STUDENT",
            "status": "ACTIVE",
            "joined_at": datetime.now()
        }

        # Student C (Third-party Student from same school - MUST NOT ACCESS RETURN INFO)
        u_student_c = "u-student-c-0004"
        self.profiles[u_student_c] = {
            "id": u_student_c,
            "email": "student.c@tpn.ac.th",
            "display_name": "ธนวัฒน์ ปรีชา (ม.6/2)",
            "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80",
            "role": "STUDENT",
            "status": "ACTIVE",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.school_members["sm-student-c"] = {
            "id": "sm-student-c",
            "school_id": s1,
            "user_id": u_student_c,
            "role": "STUDENT",
            "status": "ACTIVE",
            "joined_at": datetime.now()
        }

        # Student Other School (School 2)
        u_student_s2 = "u-student-s2-0005"
        self.profiles[u_student_s2] = {
            "id": u_student_s2,
            "email": "student@siam.ac.th",
            "display_name": "อัครพล (สยามวิทยพัฒน์)",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
            "role": "STUDENT",
            "status": "ACTIVE",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.school_members["sm-student-s2"] = {
            "id": "sm-student-s2",
            "school_id": s2,
            "user_id": u_student_s2,
            "role": "STUDENT",
            "status": "ACTIVE",
            "joined_at": datetime.now()
        }

        # 5. Initial Seed Found Items
        f1 = "item-found-001"
        self.found_items[f1] = {
            "id": f1,
            "school_id": s1,
            "posted_by": u_student_a,
            "item_name": "หูฟัง AirPods Pro เคสสีขาวพร้อมสติ๊กเกอร์ไดโนเสาร์",
            "category_id": "c1111111-1111-1111-1111-111111111111",
            "item_type_id": "t102",
            "color": "ขาว",
            "brand": "Apple",
            "description": "พบตกอยู่ที่ม้านั่งหินอ่อนหน้าโรงอาหาร อาคาร 3 ช่วงพักกลางวัน มีเคสซิลิโคนสีขาวติดสติ๊กเกอร์ไดโนเสาร์สีเขียว",
            "photo_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
            "location_found": "โรงอาหาร อาคาร 3 ม้านั่งหินอ่อน",
            "date_found": date.today(),
            "status": "CLAIM_APPROVED",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        f2 = "item-found-002"
        self.found_items[f2] = {
            "id": f2,
            "school_id": s1,
            "posted_by": u_student_a,
            "item_name": "กระติกน้ำสแตนเลส Hydro Flask สีน้ำเงินเข้ม",
            "category_id": "c5555555-5555-5555-5555-555555555555",
            "item_type_id": "t501",
            "color": "น้ำเงิน",
            "brand": "Hydro Flask",
            "description": "ลืมไว้ที่อัฒจันทร์โรงยิมหลังคาโค้ง มีรอยบุบเล็กน้อยที่ก้นขวด",
            "photo_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
            "location_found": "โรงยิม ชั้น 2 อัฒจันทร์",
            "date_found": date.today(),
            "status": "AVAILABLE",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # 6. Seed Claim on f1 by Student B
        c1 = "claim-001"
        self.claims[c1] = {
            "id": c1,
            "item_id": f1,
            "claimant_id": u_student_b,
            "verification_answer": "เคสด้านในมีรอยขีดข่วนสีเทา และชื่อบลูทูธที่เคยตั้งไว้คือ 'Kanda AirPods' มีรูปไดโนเสาร์ติดข้างหลังค่ะ",
            "status": "APPROVED",
            "reviewed_by": u_admin,
            "reviewed_at": datetime.now(),
            "rejection_reason": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # 7. Seed Return Information on c1 (Crucial security record!)
        # Created by Student A (the poster) for Student B
        r1 = "return-001"
        self.return_information[r1] = {
            "id": r1,
            "claim_id": c1,
            "pickup_location": "ห้องฝ่ายกิจการนักเรียน อาคาร 1 ชั้น 2 (ฝากไว้ที่ครูเวร)",
            "pickup_date": date.today(),
            "pickup_time": "15:30 - 16:30 น.",
            "contact_method": "โทรแจ้ง 089-123-4567 หรือทัก LINE: somchai_st",
            "notes": "กรุณานำบัตรนักเรียนมาแสดงยืนยันตัวตนด้วยนะครับ",
            "created_by": u_student_a,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # 8. Seed Lost Reports
        l1 = "report-lost-001"
        self.lost_reports[l1] = {
            "id": l1,
            "school_id": s1,
            "reported_by": u_student_b,
            "item_name": "กระเป๋าดินสอ Sanrio ลาย Kuromi สีม่วง",
            "category_id": "c3333333-3333-3333-3333-333333333333",
            "item_type_id": "t302",
            "color": "ม่วง",
            "brand": "Sanrio",
            "description": "ข้างในมีปากกา Sarasa หลายสี และดินสอกด Kuru Toga สีชมพู หายหลังจากเรียนคาบคณิตศาสตร์ห้อง 421",
            "photo_url": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
            "last_known_location": "ห้องเรียน 421 อาคารเฉลิมพระเกียรติ",
            "date_lost": date.today(),
            "status": "AVAILABLE",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # 9. Seed Notification
        n1 = "notif-001"
        self.notifications[n1] = {
            "id": n1,
            "user_id": u_student_b,
            "type": "CLAIM_APPROVED",
            "title": "การขอรับสิ่งของได้รับการอนุมัติแล้ว!",
            "message": "คำขอรับคืน AirPods Pro เคสสีขาว ได้รับการอนุมัติแล้ว คุณสามารถตรวจสอบข้อมูลการรับของได้ที่เมนูข้อมูลการรับคืน",
            "related_item_id": f1,
            "related_claim_id": c1,
            "is_read": False,
            "created_at": datetime.now()
        }

db = SupabaseDataStore()
