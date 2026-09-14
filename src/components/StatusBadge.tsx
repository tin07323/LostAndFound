import React from 'react';
import { FoundItemStatus, LostReportStatus, ClaimStatus } from '../types';

interface StatusBadgeProps {
  status: FoundItemStatus | LostReportStatus | ClaimStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'ตามหาเจ้าของ',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'CLAIM_PENDING':
      case 'PENDING':
        return {
          label: 'รอตรวจสอบคำขอ',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'CLAIM_APPROVED':
      case 'APPROVED':
        return {
          label: 'อนุมัติคำขอแล้ว',
          className: 'bg-sky-50 text-sky-700 border-sky-200'
        };
      case 'RETURN_INFO_PENDING':
        return {
          label: 'รอนัดหมายรับคืน',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'READY_FOR_PICKUP':
        return {
          label: 'พร้อมนัดรับคืน',
          className: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-300'
        };
      case 'RETURNED':
      case 'RESOLVED':
        return {
          label: 'ส่งมอบคืนสำเร็จ',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          label: 'ไม่ผ่านการอนุมัติ',
          className: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'SUSPENDED':
        return {
          label: 'ระงับการใช้งาน',
          className: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'ACTIVE':
        return {
          label: 'ปกติ',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      default:
        return {
          label: status,
          className: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.className} ${sizeClasses} whitespace-nowrap`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
};
