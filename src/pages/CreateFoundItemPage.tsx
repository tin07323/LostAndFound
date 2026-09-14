import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CreateFoundItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSchool, categories, itemTypes, createFoundItem } = useApp();

  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [itemTypeId, setItemTypeId] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available item types based on category
  const availableTypes = itemTypes.filter((t) => t.category_id === categoryId);

  // Preset sample photo suggestions for testing convenience
  const photoPresets = [
    { label: 'หูฟัง AirPods', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80' },
    { label: 'กระบอกน้ำ', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' },
    { label: 'กระเป๋าเป้', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
    { label: 'เสื้อกันหนาว', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' },
    { label: 'เครื่องคิดเลข', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80' },
    { label: 'นาฬิกา', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!itemName.trim() || !categoryId || !itemTypeId || !color.trim() || !description.trim() || !locationFound.trim()) {
      setFormError('กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย (*) ให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    try {
      const newItem = createFoundItem({
        item_name: itemName.trim(),
        category_id: categoryId,
        item_type_id: itemTypeId,
        color: color.trim(),
        brand: brand.trim(),
        description: description.trim(),
        photo_url: photoUrl || photoPresets[0].url,
        location_found: locationFound.trim(),
        date_found: dateFound
      });

      navigate(`/found-items/${newItem.id}`);
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/found-items"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: currentSchool.primary_color }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">แจ้งพบสิ่งของ (Found Item)</h1>
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
                ชื่อสิ่งของที่พบ <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="เช่น หูฟัง AirPods Pro เคสสีขาว, กระติกน้ำ Hydro Flask สีน้ำเงิน..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="เช่น ขาว, ดำ, กรมท่า, แดง..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="เช่น Apple, Nike, Casio, Uniqlo..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Location found and Date found */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สถานที่พบ <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={locationFound}
                    onChange={(e) => setLocationFound(e.target.value)}
                    placeholder="เช่น โรงอาหาร อาคาร 3, สนามบาส 1, ห้องเรียน 421..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  วันที่พบ <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={dateFound}
                    onChange={(e) => setDateFound(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รายละเอียดเพิ่มเติม <span className="text-rose-500">*</span>:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุลักษณะทั่วไปที่พบ โดยไม่ต้องระบุรหัสผ่านหรือความลับเฉพาะเจาะจง เพื่อให้เจ้าของจริงยืนยันในขั้นตอนขอรับของ..."
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Photo URL or preset picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รูปถ่ายสิ่งของ (Photo URL หรือเลือกภาพตัวอย่าง):
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="ใส่ URL รูปภาพ หรือคลิกเลือกรูปภาพตัวอย่างด้านล่าง..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        ? 'bg-blue-600 text-white border-blue-600 font-medium'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview image */}
            {photoUrl && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div className="text-xs text-slate-600">
                  <p className="font-bold text-slate-800">ตัวอย่างรูปภาพ</p>
                  <p className="text-[11px] text-slate-400">รูปภาพนี้จะปรากฏในหน้ารายการของที่พบ</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/found-items')}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกแจ้งพบของ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
