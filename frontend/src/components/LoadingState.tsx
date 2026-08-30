'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export function LoadingSpinner({
  message = 'Loading data...',
  subtext = 'Connecting to ResultFlow GPA Engine',
  className = 'py-12'
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer subtle pulsing glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75"></div>
        {/* Rotating gradient ring */}
        <div className="w-10 h-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"></div>
        {/* Inner icon */}
        <span className="material-symbols-outlined text-primary text-[18px] absolute">
          calculate
        </span>
      </div>

      <div className="space-y-0.5">
        <p className="text-xs font-bold text-on-surface tracking-wide">{message}</p>
        {subtext && <p className="text-[11px] text-on-surface-variant/80">{subtext}</p>}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-outline-variant/10">
          <div className="w-10 h-4 bg-surface-container-high rounded"></div>
          <div className="w-16 h-4 bg-primary/15 rounded"></div>
          <div className="flex-1 h-4 bg-surface-container-high rounded max-w-xs"></div>
          <div className="w-16 h-4 bg-surface-container-high rounded"></div>
          <div className="w-14 h-4 bg-surface-container-high rounded"></div>
          <div className="w-12 h-6 bg-surface-container-high rounded-full"></div>
          <div className="w-16 h-6 bg-primary/10 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-sm space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-20 h-3 bg-surface-container-high rounded"></div>
        <div className="w-8 h-8 rounded-xl bg-surface-container-high"></div>
      </div>
      <div className="w-16 h-7 bg-surface-container-high rounded"></div>
      <div className="w-24 h-2.5 bg-surface-container rounded"></div>
    </div>
  );
}

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`w-full ${height} flex flex-col items-center justify-center space-y-3 bg-surface-container-low/40 rounded-xl animate-pulse p-6`}>
      <div className="flex items-end gap-3 h-36 w-full max-w-sm justify-around">
        <div className="w-8 bg-surface-container-high rounded-t h-20"></div>
        <div className="w-8 bg-surface-container-highest rounded-t h-32"></div>
        <div className="w-8 bg-surface-container-high rounded-t h-16"></div>
        <div className="w-8 bg-surface-container-highest rounded-t h-28"></div>
        <div className="w-8 bg-surface-container-high rounded-t h-24"></div>
      </div>
      <div className="w-32 h-3 bg-surface-container-high rounded"></div>
    </div>
  );
}

export function AuditTraceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high"></div>
          <div className="space-y-2">
            <div className="w-48 h-6 bg-surface-container-high rounded"></div>
            <div className="w-32 h-4 bg-surface-container rounded"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-14 bg-surface-container-high rounded-xl"></div>
          <div className="w-20 h-14 bg-surface-container-high rounded-xl"></div>
        </div>
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 space-y-2">
            <div className="w-24 h-3 bg-surface-container-high rounded"></div>
            <div className="w-16 h-6 bg-surface-container rounded"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4">
        <TableSkeleton rows={7} cols={8} />
      </div>
    </div>
  );
}
