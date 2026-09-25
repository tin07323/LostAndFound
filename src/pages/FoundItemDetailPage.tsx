import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  FileText,
  Phone,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const FoundItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    currentSchool,
    foundItems,
    claims,
    submitClaim,
    getReturnInfoForClaim,
    saveReturnInfo,
    markItemReturned
  } = useApp();

  const item = foundItems.find((i) => i.id === id);

  // Modals & States
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  // Return Info Form Modal (for poster or admin)
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(
    currentSchool?.default_pickup_location || 'ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์ส่วนกลาง'
  );
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">ไม่พบข้อมูลสิ่งของที่ระบุ</h2>
        <p className="text-xs text-slate-500 mt-1">สิ่งของอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <button
          onClick={() => navigate('/found-items')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          กลับสู่รายการของที่พบ
        </button>
      </div>
    );
  }

  // Relations & Security evaluation
  const isPoster = item.posted_by === currentUser.id;
  const isAdmin = currentUser.role === 'ADMIN';

  // Claims for this item
  const itemClaims = claims.filter((c) => c.item_id === item.id);
  const userClaim = itemClaims.find((c) => c.claimant_id === currentUser.id);
  const approvedClaim = itemClaims.find((c) => c.status === 'APPROVED');

  // Check return information access using strict privacy logic
  const returnInfoCheck = approvedClaim ? getReturnInfoForClaim(approvedClaim.id) : null;

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    if (verificationAnswer.trim().length < 10) {
      setClaimError('กรุณาระบุข้อมูลยืนยันความเป็นเจ้าของอย่างละเอียดอย่างน้อย 10 ตัวอักษร');
      return;
    }

    const res = submitClaim(item.id, verificationAnswer);
    if (res.success) {
      setClaimSuccess('ส่งคำขอยืนยันความเป็นเจ้าของเรียบร้อยแล้ว อาจารย์/แอดมินจะตรวจสอบข้อมูลต่อไป');
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimSuccess('');
        setVerificationAnswer('');
      }, 1500);
    } else {
      setClaimError(res.message);
    }
  };

  const handleSaveReturnInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvedClaim) return;
    if (!pickupLocation || !pickupDate || !pickupTime || !contactMethod) {
      alert('กรุณากรอกข้อมูลสถานที่ วันที่ เวลา และช่องทางติดต่อให้ครบถ้วน');
      return;
    }

    saveReturnInfo(approvedClaim.id, {
      pickup_location: pickupLocation,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      contact_method: contactMethod,
      notes: pickupNotes
    });

    setShowReturnModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/found-items"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่รายการของที่พบ
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Column */}
            <div className="relative aspect-square lg:aspect-auto bg-slate-100 min-h-[320px]">
              <img
                src={item.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
                alt={item.item_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status={item.status} size="lg" />
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-medium">
                {item.category_name} • {item.item_type_name}
              </div>
            </div>

            {/* Details Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-mono">รหัสสิ่งของ: {item.id}</span>
                  <span>•</span>
                  <span>วันที่พบ: {new Date(item.date_found).toLocaleDateString('th-TH')}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {item.item_name}
                </h1>

                {/* Attributes Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    สี: <strong className="text-slate-900">{item.color}</strong>
                  </span>
                  {item.brand && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center gap-1">
                      แบรนด์: <strong className="text-slate-900">{item.brand}</strong>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs flex items-center gap-1 border border-blue-100">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {item.location_found}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    รายละเอียดสิ่งของที่พบ:
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {item.description}
                  </p>
                </div>

                {/* Poster info */}
                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <User className="w-4 h-4 text-slate-400" />
                  <div className="text-xs">
                    <span className="text-slate-500">ผู้แจ้งพบ: </span>
                    <strong className="text-slate-800">{item.poster_name}</strong>
                    {isPoster && <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">คุณเป็นผู้โพสต์</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                {/* 1. If Available & Not Poster & No existing claim: Show Claim Button */}
                {!isPoster && (item.status === 'AVAILABLE' || item.status === 'CLAIM_PENDING') && !userClaim && (
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    แจ้งเป็นเจ้าของ (ขอรับของคืน)
                  </button>
                )}

                {/* 2. If already submitted claim */}
                {userClaim && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Clock className="w-4 h-4" /> คุณได้ส่งคำขอรับของนี้แล้ว
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span>สถานะคำขอของคุณ:</span>
                      <StatusBadge status={userClaim.status} size="sm" />
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      ข้อความยืนยัน: "{userClaim.verification_answer}"
                    </p>
                  </div>
                )}

                {/* 3. If Poster or Admin & Claim Approved: Button to Set Return Info */}
                {(isPoster || isAdmin) && (item.status === 'CLAIM_APPROVED' || item.status === 'READY_FOR_PICKUP') && (
                  <button
                    onClick={() => {
                      if (returnInfoCheck?.data) {
                        setPickupLocation(returnInfoCheck.data.pickup_location);
                        setPickupDate(returnInfoCheck.data.pickup_date);
                        setPickupTime(returnInfoCheck.data.pickup_time);
                        setContactMethod(returnInfoCheck.data.contact_method);
                        setPickupNotes(returnInfoCheck.data.notes || '');
                      }
                      setShowReturnModal(true);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {returnInfoCheck?.data ? 'แก้ไขข้อมูลนัดรับสิ่งของ' : 'ระบุสถานที่และเวลานัดรับสิ่งของ'}
                  </button>
                )}

                {/* 4. Admin quick mark returned */}
                {isAdmin && item.status !== 'RETURNED' && (
                  <button
                    onClick={() => {
                      if (window.confirm('ยืนยันว่าการส่งมอบสิ่งของชิ้นนี้เสร็จสิ้นแล้ว?')) {
                        markItemReturned(item.id);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    [แอดมิน] บันทึกว่าส่งมอบคืนแล้ว (Mark Returned)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CRITICAL SECURITY & PRIVACY SECTION: RETURN INFORMATION (Section 15, 16, 57) */}
        {/* ========================================================================= */}
        {approvedClaim && (
          <div className="mt-8">
            {/* Case A: Authorized (Poster, Approved Claimant, Admin) */}
            {returnInfoCheck?.allowed ? (
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-800">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      ข้อมูลนัดหมายส่งคืนสิ่งของ (Return Information)
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/30 text-emerald-300 font-mono">
                        AUTHORIZED ACCESS
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-200/80">
                      คุณได้รับสิทธิ์เข้าถึงเนื่องจากเป็น {isPoster ? 'ผู้พบของ' : isAdmin ? 'แอดมิน' : 'เจ้าของที่ได้รับการอนุมัติ'}
                    </p>
                  </div>
                </div>

                {returnInfoCheck.data ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="space-y-1">
                      <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> สถานที่นัดรับสิ่งของ:
                      </span>
                      <p className="text-sm font-bold text-white">
                        {returnInfoCheck.data.pickup_location}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> วันและเวลานัดรับ:
                      </span>
                      <p className="text-sm font-bold text-white">
                        {new Date(returnInfoCheck.data.pickup_date).toLocaleDateString('th-TH')} เวลา {returnInfoCheck.data.pickup_time}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> ช่องทางติดต่อ:
                      </span>
                      <p className="text-sm font-semibold text-white">
                        {returnInfoCheck.data.contact_method}
                      </p>
                    </div>

                    {returnInfoCheck.data.notes && (
                      <div className="space-y-1">
                        <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> ข้อแนะนำเพิ่มเติม:
                        </span>
                        <p className="text-xs text-slate-300">
                          {returnInfoCheck.data.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10 mt-2">
                    <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-amber-200">
                      คำขอได้รับการอนุมัติแล้ว แต่ผู้พบยังไม่ได้ระบุสถานที่และเวลานัดรับ
                    </p>
                    {isPoster && (
                      <button
                        onClick={() => setShowReturnModal(true)}
                        className="mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
                      >
                        + ระบุสถานที่และเวลานัดรับเดี๋ยวนี้
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Case B: Unauthorized / Third-party Student C (MANDATORY SECURITY PROTECTION) */
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        ข้อมูลการนัดรับสิ่งของถูกปกป้องเพื่อความปลอดภัย (Privacy & Security Shield)
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                        RESTRICTED (403)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      ตามนโยบายคุ้มครองความปลอดภัยของโรงเรียน ข้อมูลสถานที่นัดหมาย เวลานัดรับ และเบอร์โทรศัพท์ติดต่อ
                      จะถูกปิดกั้นไม่ให้บุคคลภายนอกเข้าถึง <strong>(สิทธิ์นี้สงวนไว้เฉพาะผู้พบสิ่งของ และเจ้าของที่ได้รับการอนุมัติเท่านั้น)</strong>
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>สถานะของคุณ: {currentUser.display_name} (ไม่มีสิทธิ์เข้าถึงข้อมูลความลับนี้)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Claim Submission Modal */}
        {showClaimModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  แจ้งยืนยันความเป็นเจ้าของ
                </h3>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} className="mt-4 space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 leading-relaxed">
                  <strong>คำแนะนำในการยืนยันสิทธิ์:</strong> โปรดระบุข้อมูลเฉพาะเจาะจงที่ผู้พบไม่ได้เขียนไว้ในประกาศ เช่น รอยตำหนิพิเศษ, สีของอุปกรณ์ด้านใน, รหัสผ่าน, ข้อความสลัก, หรือของชิ้นเล็กที่อยู่ในกระเป๋า เพื่อให้อาจารย์ตรวจสอบความถูกต้อง
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    หลักฐานหรือข้อมูลยืนยันความเป็นเจ้าของ (Verification Answer):
                  </label>
                  <textarea
                    rows={4}
                    value={verificationAnswer}
                    onChange={(e) => setVerificationAnswer(e.target.value)}
                    placeholder="เช่น เคสด้านในมีรอยขีดข่วนสีดำ, ชื่อบลูทูธตั้งไว้ว่า..., ข้างในกระเป๋ามีปากกาสีน้ำเงิน 3 แท่ง..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    ความยาวอย่างน้อย 10 ตัวอักษร ({verificationAnswer.length}/10)
                  </span>
                </div>

                {claimError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {claimError}
                  </div>
                )}

                {claimSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {claimSuccess}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    ส่งคำขอยืนยันสิทธิ์
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Info Form Modal (Poster / Admin) */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  กำหนดข้อมูลนัดหมายส่งคืนสิ่งของ
                </h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveReturnInfo} className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      สถานที่นัดรับ (แนะนำให้นัดที่จุดปลอดภัยของโรงเรียน):
                    </label>
                    {currentSchool?.default_pickup_location && (
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" /> แนะนำโดยโรงเรียน
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder={currentSchool?.default_pickup_location || "เช่น ห้องฝ่ายกิจการนักเรียน / ประชาสัมพันธ์"}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />

                  {/* Admin configured meeting spots quick chips */}
                  {currentSchool?.meeting_locations && currentSchool.meeting_locations.length > 0 && (
                    <div className="mt-2 pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">
                        คลิกเลือกจุดนัดรับที่โรงเรียนกำหนดไว้:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentSchool.meeting_locations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setPickupLocation(loc)}
                            className={`px-2 py-1 rounded-lg text-[11px] transition border flex items-center gap-1 ${
                              pickupLocation === loc
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{loc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      วันที่นัดรับ:
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ช่วงเวลานัดรับ:
                    </label>
                    <input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="เช่น 15:30 - 16:30 น."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ช่องทางติดต่อ (โทรศัพท์ หรือ LINE ID):
                  </label>
                  <input
                    type="text"
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    placeholder="เช่น โทร 089-123-4567 หรือ LINE: somchai_st"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คำแนะนำหรือเอกสารที่ต้องนำมา (ไม่บังคับ):
                  </label>
                  <textarea
                    rows={2}
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                    placeholder="เช่น กรุณานำบัตรนักเรียนมาแสดงเพื่อยืนยันตัวตน..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                  >
                    บันทึกข้อมูลนัดรับ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
