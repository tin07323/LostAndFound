import React, { useState } from 'react';
import { User, School, ShieldCheck, Mail, Calendar, Key, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentSchool, schools, foundItems, lostReports, claims, joinSchool } = useApp();
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const myFoundCount = foundItems.filter((i) => i.posted_by === currentUser.id).length;
  const myLostCount = lostReports.filter((r) => r.reported_by === currentUser.id).length;
  const myClaimsCount = claims.filter((c) => c.claimant_id === currentUser.id).length;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = joinSchool(joinCode.trim());
    if (res.success) {
      setJoinMsg({ type: 'success', text: res.message });
      setJoinCode('');
    } else {
      setJoinMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
              alt={currentUser.display_name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-100 shadow-sm"
            />
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-900">{currentUser.display_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.role === 'ADMIN' ? '👑 อาจารย์ / ผู้ดูแลระบบ' : '🎒 นักเรียน'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentUser.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {currentUser.email}
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" />
                สังกัดปัจจุบัน: <strong className="text-slate-800">{currentSchool.name}</strong>
              </p>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-xl font-bold text-slate-900">{myFoundCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">ของที่แจ้งพบ</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-xl font-bold text-slate-900">{myLostCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">ประกาศของหาย</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-xl font-bold text-slate-900">{myClaimsCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">คำขอยืนยันสิทธิ์</p>
            </div>
          </div>
        </div>

        {/* Multi-School Membership */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
            <School className="w-5 h-5 text-blue-600" />
            การเข้าร่วมสังกัดโรงเรียน (Multi-School Membership)
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            บัญชีของคุณสามารถเป็นสมาชิกได้หลายโรงเรียน ข้อมูลและรายการสิ่งของจะถูกแยกเป็นอิสระต่อกัน (Tenant Isolation)
          </p>

          <form onSubmit={handleJoin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เข้าร่วมโรงเรียนใหม่ด้วยรหัส (School Join Code):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="เช่น TPN-2026 หรือ SIAM-888"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                เข้าร่วมโรงเรียน
              </button>
            </div>
            {joinMsg && (
              <p
                className={`text-xs mt-2 font-medium ${
                  joinMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {joinMsg.text}
              </p>
            )}
          </form>

          {/* List of user's schools */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700">โรงเรียนที่คุณสังกัดอยู่:</h4>
            {currentUser.active_schools.map((schoolId) => {
              const sc = schools.find((s) => s.id === schoolId);
              if (!sc) return null;
              const isCurrent = sc.id === currentSchool.id;
              return (
                <div
                  key={sc.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    isCurrent ? 'bg-blue-50/40 border-blue-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: sc.primary_color }}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{sc.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Join Code: {sc.join_code}</p>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> กำลังเปิดใช้งาน
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">สังกัดแล้ว</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
