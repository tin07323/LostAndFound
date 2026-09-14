import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  FileQuestion,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const HomePage: React.FC = () => {
  const { currentSchool, foundItems, lostReports, categories } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Items for current school only (Multi-school isolation)
  const schoolFoundItems = foundItems.filter((i) => i.school_id === currentSchool.id);
  const schoolLostReports = lostReports.filter((r) => r.school_id === currentSchool.id);

  const availableFoundCount = schoolFoundItems.filter((i) => i.status === 'AVAILABLE').length;
  const returnedCount = schoolFoundItems.filter((i) => i.status === 'RETURNED').length;
  const activeLostCount = schoolLostReports.filter((r) => r.status === 'AVAILABLE').length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        {/* Decorative school color accent gradient */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% -20%, ${currentSchool.primary_color}, transparent 70%)`
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* School Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-6">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentSchool.primary_color }}
              />
              <span>{currentSchool.name}</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-slate-500">Code: {currentSchool.join_code}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              ศูนย์กลางจัดการของหาย & ส่งคืนสิ่งของ
              <span
                className="block mt-2 text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${currentSchool.primary_color}, #0284c7)`
                }}
              >
                เพื่อสังคมโรงเรียนที่ซื่อสัตย์และปลอดภัย
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              ทำของหายในโรงเรียน หรือเก็บของได้? ค้นหา ตรวจสอบสิทธิ์ และนัดรับคืนได้อย่างเป็นระบบ
              ด้วยการปกป้องข้อมูลส่วนบุคคลตามมาตรฐานความปลอดภัยสูงสุด
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อสิ่งของ เช่น หูฟัง, กระเป๋า, เครื่องคิดเลข, เสื้อกันหนาว..."
                  className="w-full px-3 py-2.5 text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-sm flex items-center gap-1.5 shrink-0"
                  style={{ backgroundColor: currentSchool.primary_color }}
                >
                  ค้นหา
                </button>
              </div>
            </form>

            {/* Category Quick Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400 mr-1">หมวดยอดนิยม:</span>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/search?category=${cat.id}`)}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{schoolFoundItems.length}</p>
              <p className="text-xs text-slate-500 mt-1">ของที่พบทั้งหมด</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{availableFoundCount}</p>
              <p className="text-xs text-slate-500 mt-1">กำลังตามหาเจ้าของ</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{returnedCount}</p>
              <p className="text-xs text-slate-500 mt-1">ส่งคืนสำเร็จแล้ว</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">{activeLostCount}</p>
              <p className="text-xs text-slate-500 mt-1">ประกาศของหาย</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Found Items Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              ของที่พบล่าสุดในโรงเรียน
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              สิ่งของที่มีผู้นำมาแจ้งพบ หากเป็นของท่านสามารถกดแจ้งเป็นเจ้าของได้ทันที
            </p>
          </div>
          <Link
            to="/found-items"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ดูทั้งหมด ({schoolFoundItems.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {schoolFoundItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">ยังไม่มีรายการของที่พบในโรงเรียนนี้</p>
            <Link
              to="/create-found"
              className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
            >
              + แจ้งพบของเป็นคนแรก
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {schoolFoundItems.slice(0, 4).map((item) => (
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
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              กระบวนการทำงานที่โปร่งใสและปลอดภัย 3 ขั้นตอน
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              ป้องกันการแอบอ้างสิทธิ์ พร้อมระบบปกป้องข้อมูลจุดนัดรับเพื่อความปลอดภัยสูงสุดของนักเรียน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center mb-4 text-base">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">โพสต์แจ้งพบ หรือแจ้งของหาย</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ระบุลักษณะสิ่งของ หมวดหมู่ สี แบรนด์ และสถานที่พบ/หายอย่างชัดเจน
                เพื่อให้ระบบช่วยค้นหาได้อย่างแม่นยำ
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center mb-4 text-base">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">ยืนยันสิทธิ์ & ตรวจสอบโดยอาจารย์</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ผู้ขอรับของต้องระบุรายละเอียดเชิงลึก เช่น รอยตำหนิ หมายเลข หรือรหัส เพื่อให้อาจารย์ฝ่ายกิจการนักเรียนตรวจสอบก่อนอนุมัติ
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mb-4 text-base">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">นัดรับคืนอย่างปลอดภัย</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                เมื่ออนุมัติแล้วเท่านั้น ข้อมูลสถานที่และเวลานัดรับจะเปิดเผยแก่เจ้าของจริง
                บุคคลภายนอกไม่สามารถเข้าถึงข้อมูลได้ (RLS Security)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Banner */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> มาตรฐานความปลอดภัยระดับองค์กร (Zero Leakage)
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              ข้อมูลจุดนัดรับและช่องทางติดต่อ ถูกปกป้องด้วยสิทธิ์การเข้าถึงอย่างเคร่งครัด
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ตามหลักการความปลอดภัยของสถานศึกษา ข้อมูลการนัดรับสิ่งของ (Return Information) จะไม่ถูกเปิดเผยต่อสาธารณะ
              เฉพาะผู้พบของ เจ้าของที่ผ่านการอนุมัติ และแอดมินฝ่ายกิจการนักเรียนเท่านั้นที่เข้าถึงได้
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/create-found"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition text-center"
            >
              + แจ้งพบของ
            </Link>
            <Link
              to="/create-lost"
              className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition text-center"
            >
              + แจ้งของหาย
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
