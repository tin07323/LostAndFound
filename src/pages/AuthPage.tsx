import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  School as SchoolIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { DatabaseStatusModal } from '../components/DatabaseStatusModal';

export const AuthPage: React.FC = () => {
  const { currentSchool, schools, profiles, login, signup } = useApp();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('STUDENT');
  const [signUpSchoolCode, setSignUpSchoolCode] = useState(
    schools.find((s) => s.join_code === 'TPN-2026')?.join_code ||
      currentSchool.join_code ||
      'TPN-2026'
  );

  // Auto-sync school code if schools list updates from Supabase
  React.useEffect(() => {
    if (!signUpSchoolCode || signUpSchoolCode === 'SCHOOL-2026') {
      const preferred = schools.find((s) => s.join_code === 'TPN-2026')?.join_code || currentSchool.join_code;
      if (preferred) setSignUpSchoolCode(preferred);
    }
  }, [schools, currentSchool]);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!signInEmail.trim()) {
      setFeedback({ type: 'error', text: 'กรุณากรอกอีเมลของคุณ' });
      return;
    }

    setLoading(true);
    try {
      const res = await login(signInEmail.trim(), signInPassword);
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!signUpName.trim()) {
      setFeedback({ type: 'error', text: 'กรุณากรอกชื่อ-นามสกุลของคุณ' });
      return;
    }
    if (!signUpEmail.trim()) {
      setFeedback({ type: 'error', text: 'กรุณากรอกอีเมลโรงเรียนของคุณ' });
      return;
    }
    if (!signUpSchoolCode.trim()) {
      setFeedback({ type: 'error', text: 'กรุณากรอกรหัสประจำโรงเรียน (School Code)' });
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        role: signUpRole,
        schoolCode: signUpSchoolCode.trim()
      });
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: currentSchool.primary_color }}
      />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-15 bg-blue-600 pointer-events-none" />

      {/* Header with School Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/10 font-bold text-2xl border border-white/20 transform hover:scale-105 transition duration-300"
            style={{ backgroundColor: currentSchool.primary_color }}
          >
            LF
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          ระบบของหายและส่งคืนสิ่งของ
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-400">
          Lost & Found School Platform
        </p>

        {/* Current School Badge */}
        <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 shadow-sm backdrop-blur-md">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: currentSchool.primary_color }}
          />
          <span className="font-semibold text-white">{currentSchool.name}</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-blue-400">Code: {currentSchool.join_code}</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-800/90">
          {/* Tabs: Sign In vs Sign Up */}
          <div className="flex rounded-2xl bg-slate-800/70 p-1 mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setFeedback(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition duration-200 ${
                tab === 'signin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setFeedback(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition duration-200 ${
                tab === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สมัครสมาชิกใหม่ (Sign Up)
            </button>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`mb-5 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm ${
                feedback.type === 'error'
                  ? 'bg-rose-950/70 border border-rose-800/80 text-rose-300'
                  : 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-300'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{feedback.text}</span>
            </div>
          )}

          {/* 1. Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  อีเมลโรงเรียน หรือ รหัสนักเรียน
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="เช่น student.a@school.ac.th หรือ admin@school.ac.th"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รหัสผ่าน
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>จดจำการเข้าสู่ระบบในเครื่องนี้</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <p className="text-xs text-slate-400">
                  ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setFeedback(null);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                  >
                    สมัครสมาชิกใหม่ที่นี่
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 2. Sign Up Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ชื่อ - นามสกุล
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="เช่น ภัทรดนัย สมบูรณ์"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  อีเมลโรงเรียน (หรืออีเมลประจำตัว)
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="เช่น 29923@school.ac.th หรือ student@school.ac.th"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รหัสผ่าน
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  บทบาทผู้ใช้งานในโรงเรียน
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('STUDENT')}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-2 ${
                      signUpRole === 'STUDENT'
                        ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🎒 นักเรียน</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-2 ${
                      signUpRole === 'ADMIN'
                        ? 'bg-amber-600/30 border-amber-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>👑 ครู / ผู้ดูแลระบบ</span>
                  </button>
                </div>
              </div>

              {/* School Join Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    รหัสประจำโรงเรียน (School Code)
                  </label>
                  {signUpRole === 'ADMIN' && (
                    <span className="text-[11px] text-amber-400 font-medium">
                      พิมพ์รหัสใหม่เพื่อสร้างโรงเรียนได้
                    </span>
                  )}
                </div>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <SchoolIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpSchoolCode}
                    onChange={(e) => setSignUpSchoolCode(e.target.value.toUpperCase())}
                    placeholder="เช่น TPN-2026 หรือ SCHOOL-2026"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Quick Select available schools */}
                {schools.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      คลิกเพื่อเลือกโรงเรียนที่มีในระบบ:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {schools.map((s) => (
                        <button
                          key={s.id || s.join_code}
                          type="button"
                          onClick={() => setSignUpSchoolCode(s.join_code)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                            signUpSchoolCode === s.join_code
                              ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {s.join_code} {s.name && !s.name.includes(s.join_code) ? `(${s.name.slice(0, 18)})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  {signUpRole === 'STUDENT'
                    ? '💡 สำหรับนักเรียน: ใส่รหัส TPN-2026 เพื่อเข้าร่วมโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า'
                    : '💡 สำหรับแอดมิน: ใส่รหัส TPN-2026 เพื่อเข้าดูแลโรงเรียน หรือใส่รหัสใหม่เพื่อสร้างโรงเรียนใหม่'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>สร้างบัญชีและเริ่มต้นใช้งาน</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy & Security reassurance */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ระบบแยกข้อมูลโรงเรียนและเข้ารหัสความปลอดภัยตามมาตรฐาน RLS</span>
          </div>
        </div>

        {/* Database Status Button in Footer */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowDbModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-300 transition"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>สถานะระบบฐานข้อมูล:</span>
            <span
              className={`font-semibold ${
                isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase (Online)' : 'LocalStorage'}
            </span>
          </button>
        </div>
      </div>

      {showDbModal && <DatabaseStatusModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />}
    </div>
  );
};
