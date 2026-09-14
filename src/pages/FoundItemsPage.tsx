import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, Filter, MapPin, Calendar, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const FoundItemsPage: React.FC = () => {
  const { currentSchool, foundItems, categories } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const schoolItems = foundItems.filter((i) => i.school_id === currentSchool.id);

  const filteredItems = schoolItems.filter((item) => {
    if (selectedCat !== 'ALL' && item.category_id !== selectedCat) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              รายการของที่พบในโรงเรียน (Found Items)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              สิ่งของที่สมาชิกโรงเรียน {currentSchool.name} พบและนำมาแจ้งไว้
            </p>
          </div>
          <Link
            to="/create-found"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            + แจ้งพบของใหม่
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          {/* Status buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'AVAILABLE', label: 'กำลังตามหาเจ้าของ' },
              { id: 'CLAIM_PENDING', label: 'รอตรวจสอบ' },
              { id: 'READY_FOR_PICKUP', label: 'พร้อมนัดรับ' },
              { id: 'RETURNED', label: 'ส่งมอบแล้ว' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  statusFilter === st.id
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">หมวดหมู่:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">ไม่มีรายการของที่พบตรงตามเงื่อนไข</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนตัวกรอง หรือแจ้งพบของใหม่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                to={`/found-items/${item.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.photo_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'}
                    alt={item.item_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                    {item.category_name}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                      {item.item_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.location_found}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date_found).toLocaleDateString('th-TH')}
                      </span>
                      <span className="text-blue-600 font-medium group-hover:underline">
                        ดูรายละเอียด →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
