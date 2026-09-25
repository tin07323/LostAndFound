import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Server,
  Layers,
  ExternalLink,
  Shield,
  Clock,
  Terminal,
  FileCode2,
  HelpCircle,
  X,
  Copy,
  Check
} from 'lucide-react';
import {
  testDatabaseConnection,
  DatabaseStatus,
  supabaseUrl,
  supabaseAnonKey
} from '../lib/supabase';
import schemaSql from '../../supabase/schema.sql?raw';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'status' | 'verification' | 'troubleshoot'>('status');

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const res = await testDatabaseConnection();
      setStatus(res);
    } catch (e: any) {
      setStatus({
        isConfigured: false,
        isConnected: false,
        isChecking: false,
        mode: 'local_storage',
        hasAnonKey: false,
        message: e?.message || 'เกิดข้อผิดพลาดในการตรวจสอบ',
        lastChecked: new Date().toLocaleTimeString('th-TH')
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskedKey = supabaseAnonKey
    ? `${supabaseAnonKey.slice(0, 12)}...${supabaseAnonKey.slice(-6)}`
    : 'ไม่ได้ระบุ';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">สถานะการเชื่อมต่อฐานข้อมูล (Database Status)</h3>
              <p className="text-xs text-slate-300">
                ตรวจสอบการเชื่อมต่อระหว่างระบบ Lost & Found กับฐานข้อมูล Supabase / Local Storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveGuideTab('status')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
              activeGuideTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            ผลการตรวจสอบระบบ
          </button>
          <button
            onClick={() => setActiveGuideTab('verification')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
              activeGuideTab === 'verification'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            4 วิธีเช็คว่าต่อฐานข้อมูลจริงไหม
          </button>
          <button
            onClick={() => setActiveGuideTab('troubleshoot')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
              activeGuideTab === 'troubleshoot'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            วิธีตั้งค่า Supabase
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {activeGuideTab === 'status' && (
            <>
              {/* Primary Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  status?.isConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : status?.isConfigured
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {status?.isConnected ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : status?.isConfigured ? (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base">
                        {status?.isConnected
                          ? 'เชื่อมต่อกับฐานข้อมูล Supabase สำเร็จ (Online)'
                          : status?.isConfigured
                          ? 'พบข้อมูลเชื่อมต่อ Supabase แต่ยังไม่สามารถเข้าถึงตารางได้'
                          : 'กำลังทำงานในโหมด Offline / LocalStorage'}
                      </h4>
                      {status?.latencyMs !== undefined && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-medium">
                          {status.latencyMs} ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm mt-1 opacity-90">
                      {status?.message || 'กำลังโหลดผลการตรวจสอบ...'}
                    </p>
                    {status?.lastChecked && (
                      <p className="text-[11px] mt-1.5 opacity-70 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> ตรวจสอบล่าสุดเมื่อ: {status.lastChecked}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={runCheck}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{isLoading ? 'กำลังตรวจ...' : 'ตรวจใหม่'}</span>
                </button>
              </div>

              {/* Environment Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">โหมดการจัดเก็บข้อมูล (Storage Mode)</div>
                  <div className="mt-1 font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
                    {status?.isConnected ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Supabase Cloud Database (PostgreSQL)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                        <span>Browser LocalStorage (ข้อมูลจำลองในเครื่อง)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">ความเร็วการตอบสนอง (Response Latency)</div>
                  <div className="mt-1 font-semibold text-slate-800 text-sm">
                    {status?.latencyMs !== undefined ? `${status.latencyMs} มิลลิวินาที (ms)` : 'ไม่ได้ต่อ Supabase'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Supabase Project URL (VITE_SUPABASE_URL)</span>
                    {supabaseUrl && (
                      <button
                        onClick={() => copyToClipboard(supabaseUrl, 'url')}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]"
                      >
                        {copiedKey === 'url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'url' ? 'คัดลอกแล้ว' : 'คัดลอก'}
                      </button>
                    )}
                  </div>
                  <div className="font-mono text-xs bg-white p-2 rounded-lg border border-slate-200 text-slate-800 truncate">
                    {supabaseUrl || 'ยังไม่ได้ระบุ (ตรวจไม่พบ VITE_SUPABASE_URL ใน .env)'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY)</span>
                    <span className="text-[11px] text-slate-400">สำหรับเชื่อมต่อฝั่ง Frontend</span>
                  </div>
                  <div className="font-mono text-xs bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-between">
                    <span>{maskedKey}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-sans font-semibold ${
                        supabaseAnonKey ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {supabaseAnonKey ? 'พบแล้ว (Configured)' : 'ไม่พบ (Missing)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Schema Check */}
              {status?.tables && status.tables.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" /> ตรวจสอบตารางใน Supabase (Tables Check)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      พบ {status.tables.filter((t) => t.exists).length} จาก {status.tables.length} ตาราง
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {status.tables.map((tbl) => (
                      <div key={tbl.name} className="px-4 py-2 flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-slate-700">{tbl.name}</span>
                        {tbl.exists ? (
                          <span className="inline-flex items-center text-emerald-600 font-medium gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมใช้งาน (Ready)
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-600 font-medium gap-1" title={tbl.error}>
                            <XCircle className="w-3.5 h-3.5" /> ไม่พบตาราง (ยังไม่ได้รัน SQL)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeGuideTab === 'verification' && (
            <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  วิธีตรวจเช็คว่า Database เชื่อมต่อกับเว็บนี้จริงหรือยัง:
                </h4>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  เนื่องจากแอปนี้ถูกออกแบบให้มีระบบสำรอง (Fallback) หากยังไม่ได้ต่อ Supabase ระบบจะบันทึกใน LocalStorage ชั่วคราว คุณสามารถตรวจว่าเชื่อมต่อ Supabase จริงได้ตาม 4 วิธีนี้:
                </p>
              </div>

              {/* Method 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>ดูจากแถบสถานะด้านบน (Top Bar Status)</span>
                </div>
                <p className="text-slate-600 pl-8 text-xs leading-relaxed">
                  สังเกตที่มุมขวาบนของแถบทดสอบ จะมีปุ่มแสดงสถานะ เช่น{' '}
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold font-mono text-[11px]">
                    🟢 DB: Supabase Online
                  </span>{' '}
                  หรือ{' '}
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold font-mono text-[11px]">
                    🟡 DB: LocalStorage
                  </span>{' '}
                  หากเป็นสีเขียวแปลว่าเว็บกำลังยิงข้อมูลเข้า Supabase จริง
                </p>
              </div>

              {/* Method 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>ดูในหน้าเว็บ Supabase Dashboard (Table Editor)</span>
                </div>
                <div className="pl-8 space-y-1.5 text-xs text-slate-600">
                  <p>1. เปิดเบราว์เซอร์ไปที่ <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a></p>
                  <p>2. เข้าไปที่โปรเจกต์ของคุณ แล้วคลิกเมนู <strong>Table Editor</strong> ทางซ้ายมือ</p>
                  <p>3. คลิกดูตาราง <code>found_items</code> หรือ <code>lost_reports</code></p>
                  <p>4. ลองกลับมาที่เว็บนี้ แล้วกด <strong>"แจ้งพบของ"</strong> หรือสร้างของใหม่ 1 ชิ้น จากนั้นกด Refresh ใน Supabase ดูว่ามีแถวใหม่ (Row) เพิ่มขึ้นมาหรือไม่</p>
                </div>
              </div>

              {/* Method 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>ตรวจดูด้วย Network Tab ใน Browser Developer Tools (F12)</span>
                </div>
                <div className="pl-8 space-y-1.5 text-xs text-slate-600">
                  <p>1. กดปุ่ม <strong>F12</strong> (หรือคลิกขวาแล้วเลือก <em>Inspect / ตรวจสอบ</em>)</p>
                  <p>2. ไปที่แท็บ <strong>Network (เครือข่าย)</strong></p>
                  <p>3. ในช่องค้นหา (Filter) พิมพ์คำว่า <code>supabase</code> หรือ <code>rest/v1</code></p>
                  <p>4. หากเชื่อมต่อสำเร็จ คุณจะเห็น Request สถานะ <span className="text-emerald-600 font-bold">200 OK</span> วิ่งไปยัง URL ของ Supabase พร้อม Header <code>apikey</code></p>
                </div>
              </div>

              {/* Method 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>ตรวจสอบไฟล์คอนฟิก .env ในโปรเจกต์</span>
                </div>
                <div className="pl-8 space-y-1.5 text-xs text-slate-600">
                  <p>เปิดไฟล์ <code>.env</code> หรือ <code>.env.local</code> ตรวจดูว่ามี 2 บรรทัดนี้ถูกต้อง:</p>
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeGuideTab === 'troubleshoot' && (
            <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-blue-600" />
                  ขั้นตอนการเชื่อมต่อฐานข้อมูล Supabase ตั้งแต่ต้น:
                </h4>

                <ol className="list-decimal list-inside space-y-3 text-xs text-slate-600 pl-1 leading-relaxed">
                  <li>
                    <strong>สร้างตารางใน Supabase:</strong>
                    <p className="mt-1 pl-4 text-slate-500">
                      เปิด Supabase Dashboard -&gt; ไปที่เมนู <strong>SQL Editor</strong> -&gt; กด <strong>New query</strong> แล้วนำโค้ด SQL จากไฟล์ <code>supabase/schema.sql</code> ไปวางและกดปุ่ม <strong>Run</strong>
                    </p>
                    <div className="mt-2 pl-4">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(schemaSql, 'schema_sql')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        {copiedKey === 'schema_sql' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>คัดลอก SQL สร้างตารางเรียบร้อยแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คลิกเพื่อคัดลอก SQL สร้างตาราง (Copy Schema SQL)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </li>

                  <li>
                    <strong>นำข้อมูลเริ่มต้นเข้า (Seed Data):</strong>
                    <p className="mt-1 pl-4 text-slate-500">
                      เปิดไฟล์ <code>supabase/seed.sql</code> คัดลอกไปวางใน Supabase SQL Editor แล้วกด <strong>Run</strong> เพื่อให้มีข้อมูลโรงเรียนและหมวดหมู่เริ่มต้น
                    </p>
                  </li>

                  <li>
                    <strong>คัดลอก API Keys:</strong>
                    <p className="mt-1 pl-4 text-slate-500">
                      ใน Supabase Dashboard ไปที่ <strong>Project Settings -&gt; API</strong> จากนั้นคัดลอก:
                      <br />• <code>Project URL</code> มาใส่ใน <code>VITE_SUPABASE_URL</code>
                      <br />• <code>anon public key</code> มาใส่ใน <code>VITE_SUPABASE_ANON_KEY</code>
                    </p>
                  </li>

                  <li>
                    <strong>รีสตาร์ทเซิร์ฟเวอร์:</strong>
                    <p className="mt-1 pl-4 text-slate-500">
                      หากรันใน VS Code ให้กด <code>Ctrl + C</code> ใน Terminal แล้วพิมพ์ <code>npm run dev</code> ใหม่เพื่อให้ Vite โหลดตัวแปร .env
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Lost & Found Platform • Multi-School System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
