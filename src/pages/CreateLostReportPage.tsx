import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FileQuestion,
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CreateLostReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentSchool, categories, itemTypes, createLostReport } = useApp();

  const prefillName = searchParams.get('prefill') || '';

  const [itemName, setItemName] = useState(prefillName);
  const [categoryId, setCategoryId] = useState('');
  const [itemTypeId, setItemTypeId] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [lastKnownLocation, setLastKnownLocation] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTypes = itemTypes.filter((t) => t.category_id === categoryId);

  const photoPresets = [
    { label: 'กระเป๋าสตางค์', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80' },
    { label: 'เคสแว่นตา', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80' },
    { label: 'ร่มพับ', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=80' },
    { label: 'พวงกุญแจ', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!itemName.trim() || !categoryId || !itemTypeId || !color.trim() || !description.trim() || !lastKnownLocation.trim()) {
      setFormError('กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย (*) ให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReport = createLostReport({
        item_name: itemName.trim(),
        category_id: categoryId,
        item_type_id: itemTypeId,
        color: color.trim(),
        brand: brand.trim(),
        description: description.trim(),
        photo_url: photoUrl || photoPresets[0].url,
        last_known_location: lastKnownLocation.trim(),
        date_lost: dateLost
      });

      navigate(`/lost-reports/${newReport.id}`);
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/lost-reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-amber-600 shadow-sm">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ประกาศตามหาของหาย (Lost Report)</h1>
              <p className="text-xs text-slate-500">โรงเรียน: {currentSchool.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            {/* Item Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อสิ่งของที่หาย <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="เช่น กระเป๋าสตางค์สีน้ำตาล, เคสแว่นตา Ray-Ban..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Category and Item Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  หมวดหมู่ <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setItemTypeId('');
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ประเภทสิ่งของ <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={itemTypeId}
                  onChange={(e) => setItemTypeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={!categoryId}
                  required
                >
                  <option value="">-- เลือกประเภทสิ่งของ --</option>
                  {availableTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color and Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สีของสิ่งของ <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="เช่น ดำ, น้ำตาล, ฟ้า, แดง..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ยี่ห้อ / แบรนด์ (ถ้ามี):
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="เช่น Porter, Coach, Muji..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Last known location and Date lost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สถานที่ที่คาดว่าทำหาย <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={lastKnownLocation}
                    onChange={(e) => setLastKnownLocation(e.target.value)}
                    placeholder="เช่น ห้องสมุด ชั้น 2 โต๊ะริมหน้าต่าง..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  วันที่ทำหาย <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={dateLost}
                    onChange={(e) => setDateLost(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รายละเอียดและจุดสังเกต <span className="text-rose-500">*</span>:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุตำหนิ หรือสิ่งของที่อยู่ข้างใน เพื่อให้ผู้ที่เก็บได้ช่วยสังเกต..."
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รูปถ่ายสิ่งของ (ถ้ามี):
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="URL รูปภาพสิ่งของ (ถ้ามี)..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-400 mr-1 flex items-center">
                  <Sparkles className="w-3 h-3 mr-0.5 text-amber-500" /> รูปภาพตัวอย่าง:
                </span>
                {photoPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPhotoUrl(preset.url)}
                    className={`px-2 py-1 rounded-lg text-[11px] border transition ${
                      photoUrl === preset.url
                        ? 'bg-amber-600 text-white border-amber-600 font-medium'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/lost-reports')}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'โพสต์ประกาศของหาย'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
