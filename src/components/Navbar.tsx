import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  School as SchoolIcon,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  Package,
  FileQuestion,
  RotateCcw,
  CheckCircle2,
  Lock,
  Menu,
  X,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import { isSupabaseConfigured } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentSchool,
    schools,
    profiles,
    notifications,
    logout,
    switchSchool,
    markNotificationRead,
    markAllNotificationsRead,
    joinSchool,
    resetAllData
  } = useApp();

  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const userNotifs = currentUser ? notifications.filter((n) => n.user_id === currentUser.id) : [];
  const unreadCount = userNotifs.filter((n) => !n.is_read).length;

  const handleJoinSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = joinSchool(joinCodeInput);
    if (res.success) {
      setJoinMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setShowSchoolModal(false);
        setJoinMsg(null);
        setJoinCodeInput('');
      }, 1200);
    } else {
      setJoinMsg({ type: 'error', text: res.message });
    }
  };

  const navLinks = [
    { to: '/', label: 'หน้าแรก' },
    { to: '/search', label: 'ค้นหาสิ่งของ', icon: Search },
    { to: '/found-items', label: 'ของที่พบ', icon: Package },
    { to: '/lost-reports', label: 'ของหาย', icon: FileQuestion }
  ];

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & School Switcher */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-lg"
                  style={{ backgroundColor: currentSchool.primary_color }}
                >
                  LF
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                      Lost & Found
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      โรงเรียน
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px] sm:max-w-xs">
                    {currentSchool.name}
                  </p>
                </div>
              </Link>

              {/* School badge button */}
              <button
                onClick={() => setShowSchoolModal(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                <SchoolIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-slate-800">{currentSchool.join_code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.icon && <link.icon className="w-4 h-4 text-slate-400" />}
                    {link.label}
                  </Link>
                );
              })}

              {currentUser.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-amber-100 text-amber-900 font-semibold'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  ระบบแอดมิน
                </Link>
              )}
            </nav>

            {/* Action Buttons & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Post buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/create-found"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-sm transition flex items-center gap-1.5"
                  style={{ backgroundColor: currentSchool.primary_color }}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>แจ้งพบของ</span>
                </Link>
                <Link
                  to="/create-lost"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
                >
                  <span>แจ้งของหาย</span>
                </Link>
              </div>

              {/* Database Status Button */}
              <button
                onClick={() => setShowDbModal(true)}
                className={`p-2 rounded-lg transition flex items-center gap-1.5 text-xs font-medium border ${
                  isSupabaseConfigured
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                }`}
                title="คลิกเพื่อตรวจเช็คสถานะฐานข้อมูล Database"
              >
                <Database className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">{isSupabaseConfigured ? 'Supabase' : 'LocalStorage'}</span>
              </button>

              {/* Notifications dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifs(!showNotifs);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                  aria-label="แจ้งเตือน"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">การแจ้งเตือน</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            {unreadCount} ใหม่
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {userNotifs.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          ไม่มีการแจ้งเตือนในขณะนี้
                        </div>
                      ) : (
                        userNotifs.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50 transition cursor-pointer ${
                              !n.is_read ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5">
                                {!n.is_read ? (
                                  <span className="block w-2 h-2 rounded-full bg-blue-600" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.created_at).toLocaleTimeString('th-TH', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 pt-2 border-t border-slate-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifs(false)}
                        className="text-xs text-slate-600 hover:text-blue-600 font-medium"
                      >
                        ดูการแจ้งเตือนทั้งหมด
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifs(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
                    alt={currentUser.display_name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1 max-w-[120px]">
                      {currentUser.display_name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {currentUser.role === 'ADMIN' ? 'อาจารย์/แอดมิน' : 'นักเรียน'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{currentUser.display_name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {currentUser.role === 'ADMIN' ? '👑 อาจารย์/แอดมิน' : '🎒 นักเรียน'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                          {currentUser.status}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        โปรไฟล์ของฉัน
                      </Link>
                      <Link
                        to="/claims"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        คำขอรับสิ่งของ (My Claims)
                      </Link>
                      <Link
                        to="/my-items"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FileQuestion className="w-4 h-4 text-slate-400" />
                        รายการที่ฉันแจ้งไว้
                      </Link>
                      {currentUser.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="px-4 py-2 text-xs text-amber-700 font-medium hover:bg-amber-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          แผงควบคุมผู้ดูแลระบบ
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => setShowSchoolModal(true)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <SchoolIcon className="w-4 h-4 text-slate-400" />
                        เปลี่ยนโรงเรียน / เข้าร่วมด้วยรหัส
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        ออกจากระบบ (Sign Out)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link
                to="/create-found"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-xs font-semibold text-white bg-blue-600"
              >
                + แจ้งพบของ
              </Link>
              <Link
                to="/create-lost"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
              >
                + แจ้งของหาย
              </Link>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowDbModal(true);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>สถานะฐานข้อมูล</span>
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  isSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isSupabaseConfigured ? 'Supabase' : 'LocalStorage'}
              </span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>ออกจากระบบ (Sign Out)</span>
            </button>
          </div>
        )}
      </header>

      {/* School Selection & Join Code Modal */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SchoolIcon className="w-5 h-5 text-blue-600" />
                เลือกโรงเรียน หรือ เข้าร่วมด้วยรหัส
              </h3>
              <button
                onClick={() => setShowSchoolModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Schools */}
            <div className="space-y-2 mb-5">
              <p className="text-xs font-medium text-slate-500">โรงเรียนที่มีในระบบ:</p>
              {schools.map((sc) => {
                const isCurrent = sc.id === currentSchool.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      switchSchool(sc.id);
                      setShowSchoolModal(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sc.primary_color }}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{sc.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">รหัสเข้าร่วม: {sc.join_code}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> กำลังใช้งาน
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Join with code form */}
            <form onSubmit={handleJoinSchool} className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                ป้อนรหัสเข้าร่วมโรงเรียน (School Join Code):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="เช่น TPN-2026 หรือ SIAM-888"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                >
                  เข้าร่วม
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
          </div>
        </div>
      )}

      {/* Database Connection Status Modal */}
      <DatabaseStatusModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </>
  );
};
