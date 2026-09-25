import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// If Supabase URL and Anon Key are provided, create the real client
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export interface TableCheckStatus {
  name: string;
  exists: boolean;
  error?: string;
}

export interface DatabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  isChecking: boolean;
  mode: 'supabase' | 'local_storage';
  supabaseUrl?: string;
  hasAnonKey: boolean;
  latencyMs?: number;
  message: string;
  lastChecked?: string;
  tables?: TableCheckStatus[];
  error?: string;
}

export async function testDatabaseConnection(): Promise<DatabaseStatus> {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  if (!url || !key || !supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      isChecking: false,
      mode: 'local_storage',
      hasAnonKey: Boolean(key),
      supabaseUrl: url || undefined,
      message: 'กำลังใช้งานในโหมด LocalStorage (ออฟไลน์) เนื่องจากยังไม่ได้ระบุ VITE_SUPABASE_URL หรือ VITE_SUPABASE_ANON_KEY',
      lastChecked: new Date().toLocaleTimeString('th-TH')
    };
  }

  const start = performance.now();
  try {
    // 1. Ping test table
    const { error: pingError } = await supabase.from('schools').select('id').limit(1);
    const latency = Math.round(performance.now() - start);

    if (pingError) {
      // Check if table missing
      const isMissingTable = pingError.message.includes('relation') || pingError.code === '42P01';
      return {
        isConfigured: true,
        isConnected: false,
        isChecking: false,
        mode: 'supabase',
        supabaseUrl: url,
        hasAnonKey: true,
        latencyMs: latency,
        message: isMissingTable
          ? 'เชื่อมต่อกับเซิร์ฟเวอร์ Supabase ได้แล้ว แต่ยังไม่พบตารางในฐานข้อมูล (ต้องรันไฟล์ supabase/schema.sql ใน Supabase SQL Editor)'
          : `เชื่อมต่อกับ Supabase ไม่สำเร็จ: ${pingError.message} (Code: ${pingError.code})`,
        error: pingError.message,
        lastChecked: new Date().toLocaleTimeString('th-TH')
      };
    }

    // 2. Check key tables existence
    const tablesToCheck = ['schools', 'profiles', 'found_items', 'lost_reports', 'categories', 'claims'];
    const tableStatuses: TableCheckStatus[] = [];

    for (const t of tablesToCheck) {
      try {
        const { error } = await supabase.from(t).select('id', { head: true, count: 'exact' });
        tableStatuses.push({
          name: t,
          exists: !error,
          error: error?.message
        });
      } catch (err: any) {
        tableStatuses.push({
          name: t,
          exists: false,
          error: err?.message
        });
      }
    }

    return {
      isConfigured: true,
      isConnected: true,
      isChecking: false,
      mode: 'supabase',
      supabaseUrl: url,
      hasAnonKey: true,
      latencyMs: latency,
      message: 'เชื่อมต่อกับ Supabase Database สำเร็จสมบูรณ์ ข้อมูลพร้อมใช้งาน',
      tables: tableStatuses,
      lastChecked: new Date().toLocaleTimeString('th-TH')
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      isChecking: false,
      mode: 'supabase',
      supabaseUrl: url,
      hasAnonKey: true,
      message: `ไม่สามารถเชื่อมต่อไปยัง Supabase ได้: ${err?.message || 'Network / CORS Error'}`,
      error: err?.message,
      lastChecked: new Date().toLocaleTimeString('th-TH')
    };
  }
}
