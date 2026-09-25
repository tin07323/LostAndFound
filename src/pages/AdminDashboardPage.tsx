import React, { useState } from 'react';
import {
  ShieldCheck,
  Package,
  FileQuestion,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Palette,
  Layers,
  Activity,
  AlertTriangle,
  RotateCcw,
  Search,
  Check,
  Plus,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { ClaimStatus } from '../types';
import { DatabaseStatusModal } from '../components/DatabaseStatusModal';
import { isSupabaseConfigured } from '../lib/supabase';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    currentSchool,
    foundItems,
    lostReports,
    claims,
    profiles,
    categories,
    itemTypes,
    auditLogs,
    updateSchoolSettings,
    approveClaim,
    rejectClaim,
    markItemReturned,
    updateUserStatus,
    addCategory,
    addItemType
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'claims' | 'returns' | 'theme' | 'users' | 'master' | 'audit'
  >('claims');

  // Filter school items
  const schoolFoundItems = foundItems.filter((i) => i.school_id === currentSchool.id);
  const schoolLostReports = lostReports.filter((r) => r.school_id === currentSchool.id);
  const schoolClaims = claims.filter((c) => {
    const item = foundItems.find((i) => i.id === c.item_id);
    return item?.school_id === currentSchool.id;
  });

  const pendingClaims = schoolClaims.filter((c) => c.status === 'PENDING');
  const approvedClaims = schoolClaims.filter((c) => c.status === 'APPROVED');
  const returnedItems = schoolFoundItems.filter((i) => i.status === 'RETURNED');

  // Rejection modal
  const [rejectModalClaimId, setRejectModalClaimId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // School theme form state
  const [schoolName, setSchoolName] = useState(currentSchool.name);
  const [schoolColor, setSchoolColor] = useState(currentSchool.primary_color);
  const [themeSuccess, setThemeSuccess] = useState(false);

  // Master data form states
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Package');
  const [selectedCatForType, setSelectedCatForType] = useState(categories[0]?.id || '');
  const [newTypeName, setNewTypeName] = useState('');
  const [showDbModal, setShowDbModal] = useState(false);

  // Protect Admin Route
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border border-rose-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">ไม่มีสิทธิ์เข้าถึงหน้านี้ (403 Forbidden)</h2>
          <p className="text-xs text-slate-500 mt-2">
            หน้านี้สงวนไว้สำหรับผู้ดูแลระบบหรืออาจารย์ฝ่ายกิจการนักเรียนเท่านั้น
          </p>
          <p className="text-xs text-slate-400 mt-1">
            (คุณสามารถสลับไปยังบัญชี Admin ได้จากแถบด้านบนสุด)
          </p>
        </div>
      </div>
    );
  }

  const handleApprove = (claimId: string) => {
    if (window.confirm('ยืนยันอนุมัติคำขอรับสิ่งของชิ้นนี้? ระบบจะแจ้งเตือนผู้ขอรับและผู้พบทันที')) {
      approveClaim(claimId);
    }
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalClaimId || !rejectReason.trim()) return;
    rejectClaim(rejectModalClaimId, rejectReason.trim());
    setRejectModalClaimId(null);
    setRejectReason('');
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolSettings({
      name: schoolName.trim(),
      primary_color: schoolColor
    });
    setThemeSuccess(true);
    setTimeout(() => setThemeSuccess(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatIcon);
    setNewCatName('');
  };

  const handleAddItemType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !selectedCatForType) return;
    addItemType(newTypeName.trim(), selectedCatForType);
    setNewTypeName('');
  };

  const colorPalettes = [
    { name: 'น้ำเงินกรมท่า', color: '#1e3a8a' },
    { name: 'น้ำเงินรอยัล', color: '#2563eb' },
    { name: 'เขียวมรกต', color: '#059669' },
    { name: 'ม่วงเข้ม', color: '#7c3aed' },
    { name: 'แดงเลือดหมู', color: '#b91c1c' },
    { name: 'ส้มอิฐ', color: '#ea580c' },
    { name: 'ทองอำพัน', color: '#d97706' },
    { name: 'เทาเข้มหรูหรา', color: '#334155' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">
                แผงควบคุมผู้ดูแลระบบ (Admin Console)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ฝ่ายกิจการนักเรียน / งานปกครอง • {currentSchool.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDbModal(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-sm'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>ตรวจสถานะ Database</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></span>
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              รอตรวจสอบ: {pendingClaims.length} รายการ
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-6">
          {[
            { id: 'claims', label: `ตรวจสอบคำขอ (${pendingClaims.length})`, icon: CheckCircle2 },
            { id: 'returns', label: 'การนัดรับ & ส่งมอบ', icon: Clock },
            { id: 'overview', label: 'ภาพรวมสถิติ', icon: Activity },
            { id: 'theme', label: 'ตั้งค่า & ธีมโรงเรียน', icon: Palette },
            { id: 'users', label: 'จัดการผู้ใช้งาน', icon: Users },
            { id: 'master', label: 'หมวดหมู่ & ประเภทสิ่งของ', icon: Layers },
            { id: 'audit', label: 'Audit Logs', icon: Settings }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CLAIMS REVIEW (HIGHEST PRIORITY ADMIN TASK) */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                คำขอยืนยันความเป็นเจ้าของที่รอการตรวจสอบ ({pendingClaims.length})
              </h2>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">ไม่มีคำขอค้างตรวจสอบในขณะนี้</p>
                <p className="text-xs text-slate-400 mt-1">ทุกคำขอได้รับการพิจารณาเรียบร้อยแล้ว</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map((claim) => {
                  const item = foundItems.find((i) => i.id === claim.item_id);
                  if (!item) return null;

                  return (
                    <div
                      key={claim.id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row gap-6 items-start justify-between"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
                          alt={item.item_name}
                          className="w-24 h-24 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={claim.status} size="sm" />
                            <span className="text-[11px] text-slate-400 font-mono">
                              Claim ID: {claim.id}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{item.item_name}</h3>
                          <p className="text-xs text-slate-500">
                            ผู้ขอรับ: <strong className="text-slate-800">{claim.claimant_name}</strong> •
                            ผู้แจ้งพบ: <strong className="text-slate-800">{item.poster_name}</strong>
                          </p>
                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-slate-800 mt-2">
                            <span className="font-bold text-amber-900">หลักฐานยืนยันที่ส่งมา: </span>
                            "{claim.verification_answer}"
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2 w-full lg:w-48 shrink-0">
                        <button
                          onClick={() => handleApprove(claim.id)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> อนุมัติคำขอ
                        </button>
                        <button
                          onClick={() => setRejectModalClaimId(claim.id)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> ไม่อนุมัติ
                        </button>
                        <a
                          href={`/found-items/${item.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 text-center text-xs text-slate-500 hover:underline"
                        >
                          ดูหน้าสิ่งของ ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Approved Claims list for reference */}
            <div className="pt-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3">
                คำขอที่อนุมัติแล้วในโรงเรียน ({approvedClaims.length})
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {approvedClaims.map((c) => {
                  const item = foundItems.find((i) => i.id === c.item_id);
                  return (
                    <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item?.item_name || 'สิ่งของ'}</p>
                        <p className="text-[11px] text-slate-500">
                          เจ้าของ: {c.claimant_name} • วันที่อนุมัติ: {c.updated_at ? new Date(c.updated_at).toLocaleDateString('th-TH') : '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="CLAIM_APPROVED" size="sm" />
                        <a
                          href={`/found-items/${item?.id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          ดูรายละเอียด
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RETURN MANAGEMENT */}
        {activeTab === 'returns' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              การติดตามนัดรับ & ส่งมอบสิ่งของคืน
            </h2>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-4">สิ่งของ</th>
                    <th className="p-4">ผู้พบ</th>
                    <th className="p-4">เจ้าของที่อนุมัติ</th>
                    <th className="p-4">สถานะสิ่งของ</th>
                    <th className="p-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolFoundItems
                    .filter(
                      (i) =>
                        i.status === 'CLAIM_APPROVED' ||
                        i.status === 'READY_FOR_PICKUP' ||
                        i.status === 'RETURNED'
                    )
                    .map((item) => {
                      const approvedC = claims.find(
                        (c) => c.item_id === item.id && c.status === 'APPROVED'
                      );
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-900">{item.item_name}</td>
                          <td className="p-4 text-slate-600">{item.poster_name}</td>
                          <td className="p-4 text-slate-600">{approvedC?.claimant_name || '-'}</td>
                          <td className="p-4">
                            <StatusBadge status={item.status} size="sm" />
                          </td>
                          <td className="p-4 text-right">
                            {item.status !== 'RETURNED' ? (
                              <button
                                onClick={() => {
                                  if (window.confirm(`ยืนยันการส่งมอบ ${item.item_name} คืนเจ้าของเรียบร้อย?`)) {
                                    markItemReturned(item.id);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                              >
                                บันทึกส่งมอบแล้ว
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-semibold">
                                ✓ ส่งมอบเสร็จสิ้น
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">ของที่พบทั้งหมด</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{schoolFoundItems.length}</p>
                <p className="text-[11px] text-emerald-600 mt-1">รายการสะสมในระบบ</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">ส่งคืนเจ้าของสำเร็จ</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{returnedItems.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  อัตราความสำเร็จ {schoolFoundItems.length > 0 ? Math.round((returnedItems.length / schoolFoundItems.length) * 100) : 0}%
                </p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">คำขอรอตรวจสอบ</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingClaims.length}</p>
                <p className="text-[11px] text-amber-700 mt-1">ต้องใช้อาจารย์อนุมัติ</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">ประกาศของหาย</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">{schoolLostReports.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">โพสต์จากนักเรียน</p>
              </div>
            </div>

            {/* School Profile Info Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">ข้อมูลสังกัดโรงเรียนปัจจุบัน</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">ชื่อโรงเรียน:</span>
                  <span className="font-bold text-slate-900">{currentSchool.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">รหัสเข้าร่วม (Join Code):</span>
                  <span className="font-mono font-bold text-blue-600">{currentSchool.join_code}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">สีประจำโรงเรียน:</span>
                    <span className="font-mono font-bold">{currentSchool.primary_color}</span>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border shadow-sm"
                    style={{ backgroundColor: currentSchool.primary_color }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCHOOL THEME & CUSTOMIZATION */}
        {activeTab === 'theme' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Palette className="w-5 h-5 text-blue-600" />
              ปรับแต่งอัตลักษณ์ & ธีมของโรงเรียน (School Customizer)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              ปรับเปลี่ยนชื่อโรงเรียน สีประจำสถาบัน และรหัสเข้าร่วม
            </p>

            <form onSubmit={handleSaveTheme} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อสถานศึกษา:
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สีประจำโรงเรียน (Primary Brand Color):
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="color"
                    value={schoolColor}
                    onChange={(e) => setSchoolColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={schoolColor}
                    onChange={(e) => setSchoolColor(e.target.value)}
                    className="px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 uppercase"
                  />
                </div>

                {/* Color Palettes */}
                <div className="flex flex-wrap gap-2">
                  {colorPalettes.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setSchoolColor(p.color)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs flex items-center gap-1.5 hover:bg-slate-50 transition"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {themeSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4" /> บันทึกการตั้งค่าธีมโรงเรียนเรียบร้อยแล้ว!
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              จัดการสมาชิก & บัญชีผู้ใช้งาน ({profiles.length})
            </h2>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-4">ผู้ใช้งาน</th>
                    <th className="p-4">อีเมล</th>
                    <th className="p-4">บทบาท (Role)</th>
                    <th className="p-4">สถานะบัญชี</th>
                    <th className="p-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profiles.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                            <span className="font-bold text-slate-900">{u.display_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {u.role === 'ADMIN' ? '👑 แอดมิน' : '🎒 นักเรียน'}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={u.status} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => {
                                const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                                updateUserStatus(u.id, newStatus);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                                u.status === 'ACTIVE'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'ระงับการใช้งาน' : 'ยกเลิกระงับ'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: MASTER DATA (CATEGORIES & ITEM TYPES) */}
        {activeTab === 'master' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                หมวดหมู่สิ่งของ (Categories)
              </h3>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="ชื่อหมวดหมู่ใหม่ เช่น อุปกรณ์กีฬา..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่ม
                </button>
              </form>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {categories.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {itemTypes.filter((t) => t.category_id === c.id).length} ประเภทย่อย
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Types */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                ประเภทสิ่งของย่อย (Item Types)
              </h3>
              <form onSubmit={handleAddItemType} className="space-y-2 mb-4">
                <select
                  value={selectedCatForType}
                  onChange={(e) => setSelectedCatForType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="เช่น ลูกฟุตบอล, รองเท้าแตะ..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่ม
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {itemTypes
                  .filter((t) => !selectedCatForType || t.category_id === selectedCatForType)
                  .map((t) => {
                    const parentCat = categories.find((c) => c.id === t.category_id);
                    return (
                      <div key={t.id} className="py-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{t.name}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {parentCat?.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              บันทึกกิจกรรมความปลอดภัย (Security & Audit Trail)
            </h2>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 p-8 text-center">ยังไม่มีบันทึกกิจกรรม</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between text-xs gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 font-bold">
                            {log.action}
                          </span>
                          <span className="text-slate-800 font-medium">
                            เป้าหมาย: {log.entity_type} ({log.entity_id})
                          </span>
                        </div>
                        {log.details && (
                          <pre className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg max-w-xl overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(log.created_at).toLocaleString('th-TH')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Modal */}
        {rejectModalClaimId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                ระบุเหตุผลที่ไม่อนุมัติคำขอ
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                เหตุผลนี้จะถูกส่งไปยังผู้ขอรับเพื่อความโปร่งใส
              </p>

              <form onSubmit={handleRejectConfirm} className="space-y-4">
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="เช่น หลักฐานรอยตำหนิไม่ตรงกับสิ่งของจริง, ไม่สามารถระบุรหัสผ่านได้..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalClaimId(null);
                      setRejectReason('');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                  >
                    ยืนยันการปฏิเสธ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Database Connection Status Modal */}
      <DatabaseStatusModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </div>
  );
};
