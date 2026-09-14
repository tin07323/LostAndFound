import React from 'react';
import { ShieldCheck, Heart, School, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { currentSchool } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: currentSchool.primary_color }}
              >
                LF
              </div>
              <span className="text-white font-bold text-sm">
                Lost & Found — {currentSchool.name}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              ระบบศูนย์กลางแจ้งของหายและส่งคืนสิ่งของสำหรับโรงเรียน
              ส่งเสริมความซื่อสัตย์ ความมีน้ำใจ และความโปร่งใสในสถานศึกษา
              พร้อมระบบปกป้องข้อมูลส่วนบุคคล (PDPA) และสิทธิ์การเข้าถึงข้อมูลการนัดรับคืนที่ปลอดภัย
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Row Level Security (RLS)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-sky-400">
                <Lock className="w-3.5 h-3.5" /> Multi-school Isolation
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs mb-3">เมนูด่วน</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/search" className="hover:text-white transition">ค้นหาสิ่งของทั้งหมด</a></li>
              <li><a href="/found-items" className="hover:text-white transition">รายการของที่พบ</a></li>
              <li><a href="/lost-reports" className="hover:text-white transition">ประกาศของหาย</a></li>
              <li><a href="/create-found" className="hover:text-white transition">แจ้งพบของใหม่</a></li>
              <li><a href="/create-lost" className="hover:text-white transition">แจ้งของหายใหม่</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs mb-3">ฝ่ายกิจการนักเรียน</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              หากพบสิ่งของมีค่าสูง เช่น เครื่องประดับ เงินสด หรือเอกสารสำคัญ
              กรุณานำส่งที่ห้องฝ่ายกิจการนักเรียน อาคาร 1 ชั้น 2 ในวันและเวลาราชการ
            </p>
            <p className="text-xs text-slate-500 mt-2">
              โทร: 02-XXX-XXXX ต่อ 102
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {currentSchool.name}. สงวนลิขสิทธิ์ทุกประการ</p>
          <p className="flex items-center gap-1">
            สร้างด้วย <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> เพื่อสังคมโรงเรียนน่าอยู่
          </p>
        </div>
      </div>
    </footer>
  );
};
