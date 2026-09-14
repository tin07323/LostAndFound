import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileQuestion,
  MapPin,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const LostReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, lostReports, updateLostReport } = useApp();

  const report = lostReports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">ไม่พบข้อมูลประกาศของหาย</h2>
        <p className="text-xs text-slate-500 mt-1">ประกาศอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <button
          onClick={() => navigate('/lost-reports')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          กลับสู่รายการของหาย
        </button>
      </div>
    );
  }

  const isReporter = report.reported_by === currentUser.id;
  const isAdmin = currentUser.role === 'ADMIN';

  const handleMarkResolved = () => {
    if (window.confirm('ยืนยันว่าคุณได้รับสิ่งของชิ้นนี้คืนแล้ว หรือต้องการปิดประกาศ?')) {
      updateLostReport(report.id, { status: 'RESOLVED' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/lost-reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่รายการประกาศของหาย
        </Link>

        {/* Detail Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square lg:aspect-auto bg-slate-100 min-h-[320px]">
              <img
                src={report.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
                alt={report.item_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status={report.status} size="lg" />
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-medium">
                {report.category_name} • {report.item_type_name}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-mono">รหัสประกาศ: {report.id}</span>
                  <span>•</span>
                  <span>วันที่หาย: {new Date(report.date_lost).toLocaleDateString('th-TH')}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {report.item_name}
                </h1>

                {/* Attributes */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    สี: <strong className="text-slate-900">{report.color}</strong>
                  </span>
                  {report.brand && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center gap-1">
                      แบรนด์: <strong className="text-slate-900">{report.brand}</strong>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs flex items-center gap-1 border border-amber-100">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    หายที่: {report.last_known_location}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    รายละเอียดและจุดสังเกต:
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {report.description}
                  </p>
                </div>

                {/* Reporter */}
                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <User className="w-4 h-4 text-slate-400" />
                  <div className="text-xs">
                    <span className="text-slate-500">ผู้แจ้งของหาย: </span>
                    <strong className="text-slate-800">{report.reporter_name}</strong>
                    {isReporter && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        ประกาศของคุณ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                {!isReporter ? (
                  <Link
                    to={`/create-found?prefill=${encodeURIComponent(report.item_name)}`}
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ฉันพบสิ่งของชิ้นนี้แล้ว (แจ้งพบของ)
                  </Link>
                ) : (
                  report.status === 'AVAILABLE' && (
                    <button
                      onClick={handleMarkResolved}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      ได้รับสิ่งของคืนแล้ว (ปิดประกาศ)
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
