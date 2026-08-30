'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'PASS' | 'FAIL' | 'ABSENT' | 'NEEDS_REVIEW' | 'REVIEW' | string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const norm = String(status).toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'PASS':
        return 'bg-pass/10 text-[#059669] border-pass/20';
      case 'FAIL':
        return 'bg-fail/10 text-fail border-fail/20';
      case 'ABSENT':
      case 'AB':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'NEEDS_REVIEW':
      case 'REVIEW':
      case 'FLAGGED':
        return 'bg-review/15 text-[#D97706] border-review/30';
      default:
        return 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30';
    }
  };

  const getLabel = () => {
    switch (norm) {
      case 'PASS':
        return 'PASS';
      case 'FAIL':
        return 'FAIL';
      case 'ABSENT':
      case 'AB':
        return 'ABSENT';
      case 'NEEDS_REVIEW':
      case 'REVIEW':
        return 'NEEDS REVIEW';
      default:
        return norm;
    }
  };

  const sizeStyle =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs font-bold'
      : 'px-2.5 py-1 text-label-caps';

  return (
    <span
      className={`inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full border ${getStyle()} ${sizeStyle}`}
    >
      {getLabel()}
    </span>
  );
}

export function GradeBadge({ grade }: { grade: string }) {
  const getStyle = () => {
    switch (grade) {
      case 'A+':
        return 'bg-[#10B981]/15 text-[#059669] border-[#10B981]/30';
      case 'A':
        return 'bg-[#3B82F6]/15 text-[#2563EB] border-[#3B82F6]/30';
      case 'A-':
        return 'bg-[#6366F1]/15 text-[#4F46E5] border-[#6366F1]/30';
      case 'B':
        return 'bg-[#8B5CF6]/15 text-[#7C3AED] border-[#8B5CF6]/30';
      case 'C':
        return 'bg-[#F59E0B]/15 text-[#D97706] border-[#F59E0B]/30';
      case 'D':
        return 'bg-[#FB923C]/15 text-[#EA580C] border-[#FB923C]/30';
      case 'F':
      default:
        return 'bg-[#F43F5E]/15 text-[#E11D48] border-[#F43F5E]/30';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center font-extrabold px-2.5 py-0.5 rounded text-xs border ${getStyle()}`}>
      {grade}
    </span>
  );
}
