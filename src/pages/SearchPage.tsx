import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Package,
  FileQuestion,
  MapPin,
  Calendar,
  RotateCcw,
  Tag,
  Palette,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const SearchPage: React.FC = () => {
  const { currentSchool, foundItems, lostReports, categories, itemTypes } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'found' or 'lost'
  const [activeTab, setActiveTab] = useState<'found' | 'lost'>(
    (searchParams.get('tab') as 'found' | 'lost') || 'found'
  );

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedItemType, setSelectedItemType] = useState(searchParams.get('type') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  // Filter item types for selected category
  const availableItemTypes = useMemo(() => {
    if (!selectedCategory) return itemTypes;
    return itemTypes.filter((t) => t.category_id === selectedCategory);
  }, [selectedCategory, itemTypes]);

  // Common colors in Thai school context
  const commonColors = ['ขาว', 'ดำ', 'น้ำเงิน', 'แดง', 'เขียว', 'เหลือง', 'ชมพู', 'ม่วง', 'เทา', 'น้ำตาล'];

  // Filter items
  const filteredResults = useMemo(() => {
    const list = activeTab === 'found' ? foundItems : lostReports;
    return list.filter((item) => {
      // School tenant isolation
      if (item.school_id !== currentSchool.id) return false;

      // Keyword filter
      if (keyword.trim()) {
        const kw = keyword.toLowerCase().trim();
        const textToSearch = `${item.item_name} ${item.description} ${item.color} ${item.brand || ''} ${
          'location_found' in item ? item.location_found : item.last_known_location
        }`.toLowerCase();
        if (!textToSearch.includes(kw)) return false;
      }

      // Category filter
      if (selectedCategory && item.category_id !== selectedCategory) return false;

      // Item type filter
      if (selectedItemType && item.item_type_id !== selectedItemType) return false;

      // Color filter
      if (selectedColor && item.color.toLowerCase() !== selectedColor.toLowerCase()) return false;

      // Status filter
      if (selectedStatus && item.status !== selectedStatus) return false;

      // Location filter
      if (selectedLocation) {
        const loc = 'location_found' in item ? item.location_found : item.last_known_location;
        if (!loc.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
      }

      return true;
    });
  }, [
    activeTab,
    foundItems,
    lostReports,
    currentSchool.id,
    keyword,
    selectedCategory,
    selectedItemType,
    selectedColor,
    selectedStatus,
    selectedLocation
  ]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setSelectedItemType('');
    setSelectedColor('');
    setSelectedStatus('');
    setSelectedLocation('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            ค้นหาสิ่งของขั้นสูง
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ค้นหาแบบละเอียดด้วยการกรองหลายเงื่อนไขพร้อมกัน ใน {currentSchool.name}
          </p>
        </div>

        {/* Tab switch: Found vs Lost */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('found')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'found'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            รายการของที่พบ (Found Items)
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'lost'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            ประกาศของหาย (Lost Reports)
          </button>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> ตัวกรองละเอียด
            </span>
            {(keyword || selectedCategory || selectedItemType || selectedColor || selectedStatus || selectedLocation) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>

          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Keyword Input */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                คำค้นหา (ชื่อสิ่งของ, แบรนด์, รายละเอียด):
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="เช่น AirPods, Hydro Flask, ปากกา, กระเป๋า..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                หมวดหมู่สิ่งของ:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedItemType('');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">ทั้งหมดทุกหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Item Type Select */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                ประเภทสิ่งของ:
              </label>
              <select
                value={selectedItemType}
                onChange={(e) => setSelectedItemType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={availableItemTypes.length === 0}
              >
                <option value="">ทั้งหมดทุกประเภท</option>
                {availableItemTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                สถานะสิ่งของ:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">ทั้งหมดทุกสถานะ</option>
                <option value="AVAILABLE">กำลังตามหาเจ้าของ</option>
                <option value="CLAIM_PENDING">รอตรวจสอบคำขอ</option>
                <option value="CLAIM_APPROVED">อนุมัติคำขอแล้ว</option>
                <option value="READY_FOR_PICKUP">พร้อมนัดรับคืน</option>
                <option value="RETURNED">ส่งมอบคืนสำเร็จ</option>
              </select>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                สถานที่ (ระบุคำค้น):
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="เช่น โรงอาหาร, อาคาร 3, โรงยิม..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Color Quick Pills */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                สีของสิ่งของ:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedColor('')}
                  className={`px-2 py-1 rounded-lg text-[11px] border transition ${
                    !selectedColor
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ทุกสี
                </button>
                {commonColors.map((clr) => {
                  const isSelected = selectedColor.toLowerCase() === clr.toLowerCase();
                  return (
                    <button
                      key={clr}
                      onClick={() => setSelectedColor(isSelected ? '' : clr)}
                      className={`px-2 py-1 rounded-lg text-[11px] border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-medium'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                      {clr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-600">
            พบ <span className="font-bold text-slate-900">{filteredResults.length}</span> รายการ
            {activeTab === 'found' ? ' ของที่พบ' : ' ประกาศของหาย'}
          </p>
        </div>

        {/* Results Grid */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">ไม่พบสิ่งของที่ตรงกับเงื่อนไขการค้นหา</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              ลองปรับลดตัวกรอง หรือค้นหาด้วยคำที่กว้างขึ้น เช่น ชื่อหมวดหมู่ หรือชื่อสี
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
            >
              ล้างเงื่อนไขทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredResults.map((item) => {
              const isFound = 'location_found' in item;
              const detailUrl = isFound ? `/found-items/${item.id}` : `/lost-reports/${item.id}`;
              const itemDate = isFound ? item.date_found : item.date_lost;
              const locationText = isFound ? item.location_found : item.last_known_location;

              return (
                <Link
                  key={item.id}
                  to={detailUrl}
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
                        <span>{locationText}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(itemDate).toLocaleDateString('th-TH')}
                        </span>
                        <span className="text-blue-600 font-medium group-hover:underline">
                          ดูรายละเอียด →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
