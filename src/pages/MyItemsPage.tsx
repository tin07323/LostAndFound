import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, FileQuestion, ArrowRight, Calendar, MapPin, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const MyItemsPage: React.FC = () => {
  const { currentUser, foundItems, lostReports } = useApp();
  const [tab, setTab] = useState<'found' | 'lost'>('found');

  const myFoundItems = foundItems.filter((i) => i.posted_by === currentUser.id);
  const myLostReports = lostReports.filter((r) => r.reported_by === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            รายการที่ฉันแจ้งไว้ (My Posted Items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการรายการของที่พบและประกาศของหายที่คุณสร้างขึ้น
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('found')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              tab === 'found'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            ของที่ฉันแจ้งพบ ({myFoundItems.length})
          </button>
          <button
            onClick={() => setTab('lost')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              tab === 'lost'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            ประกาศของหายของฉัน ({myLostReports.length})
          </button>
        </div>

        {/* Found Tab Content */}
        {tab === 'found' && (
          <div>
            {myFoundItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">คุณยังไม่เคยแจ้งพบสิ่งของ</p>
                <Link
                  to="/create-found"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                >
                  + แจ้งพบของใหม่
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myFoundItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start justify-between"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
                        alt={item.item_name}
                        className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            วันที่พบ: {new Date(item.date_found).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{item.item_name}</h3>
                        <p className="text-xs text-slate-500">
                          หมวด: {item.category_name} • สถานที่: {item.location_found}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex sm:flex-col gap-2 shrink-0">
                      <Link
                        to={`/found-items/${item.id}`}
                        className="w-full text-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        จัดการ / ดูหน้ารายละเอียด
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lost Tab Content */}
        {tab === 'lost' && (
          <div>
            {myLostReports.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">คุณยังไม่มีประกาศของหาย</p>
                <Link
                  to="/create-lost"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
                >
                  + แจ้งของหายใหม่
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myLostReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start justify-between"
                  >
                    <div className="flex gap-4">
                      <img
                        src={report.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
                        alt={report.item_name}
                        className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={report.status} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            วันที่หาย: {new Date(report.date_lost).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{report.item_name}</h3>
                        <p className="text-xs text-slate-500">
                          หมวด: {report.category_name} • คาดว่าหายที่: {report.last_known_location}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-1">{report.description}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex sm:flex-col gap-2 shrink-0">
                      <Link
                        to={`/lost-reports/${report.id}`}
                        className="w-full text-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        ดูหน้ารายละเอียด
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
