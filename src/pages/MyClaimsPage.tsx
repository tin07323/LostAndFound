import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const MyClaimsPage: React.FC = () => {
  const { currentUser, claims, foundItems } = useApp();

  const userClaims = claims.filter((c) => c.claimant_id === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            คำขอรับสิ่งของของฉัน (My Claims)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามสถานะคำขอยืนยันความเป็นเจ้าของสิ่งของที่คุณได้ส่งไว้
          </p>
        </div>

        {userClaims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">คุณยังไม่เคยส่งคำขอรับสิ่งของใดๆ</p>
            <p className="text-xs text-slate-400 mt-1">
              หากทำของหาย ลองค้นหาในรายการของที่พบ แล้วกดยืนยันความเป็นเจ้าของ
            </p>
            <Link
              to="/found-items"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              ไปยังรายการของที่พบ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userClaims.map((claim) => {
              const item = foundItems.find((i) => i.id === claim.item_id);
              if (!item) return null;

              const isApproved = claim.status === 'APPROVED';
              const isRejected = claim.status === 'REJECTED';

              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-start justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
                      alt={item.item_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={claim.status} size="sm" />
                        <span className="text-[11px] text-slate-400 font-mono">
                          วันที่ขอ: {new Date(claim.created_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{item.item_name}</h3>
                      <p className="text-xs text-slate-500">
                        หมวดหมู่: {item.category_name} • สถานที่พบ: {item.location_found}
                      </p>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 mt-2">
                        <span className="font-semibold text-slate-800">หลักฐานที่ส่ง: </span>
                        {claim.verification_answer}
                      </div>

                      {isRejected && claim.rejection_reason && (
                        <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
                          <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>เหตุผลที่ไม่อนุมัติ: {claim.rejection_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col gap-2 shrink-0 self-center sm:self-auto">
                    <Link
                      to={`/found-items/${item.id}`}
                      className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      ดูรายละเอียดสิ่งของ
                    </Link>

                    {isApproved && (
                      <Link
                        to={`/found-items/${item.id}`}
                        className="w-full text-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> ดูข้อมูลนัดรับของ
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
