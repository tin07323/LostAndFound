import React, { useState } from 'react';
import { Bell, CheckCircle2, Trash2, Clock, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsPage: React.FC = () => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userNotifs = notifications.filter((n) => n.user_id === currentUser.id);
  const filtered = filter === 'unread' ? userNotifs.filter((n) => !n.is_read) : userNotifs;
  const unreadCount = userNotifs.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              การแจ้งเตือนทั้งหมด
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              การอัปเดตสถานะคำขอ ข้อมูลนัดรับ และการประกาศในโรงเรียน
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> ทำเครื่องหมายว่าอ่านทั้งหมด
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            ทั้งหมด ({userNotifs.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            ยังไม่อ่าน ({unreadCount})
          </button>
        </div>

        {/* Notifications list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">ไม่มีการแจ้งเตือนในขณะนี้</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                  !n.is_read
                    ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {!n.is_read ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.created_at).toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-semibold shrink-0">
                    ใหม่
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
