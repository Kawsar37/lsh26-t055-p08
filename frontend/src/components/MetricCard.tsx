'use client';

import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendPositive?: boolean;
  valueColor?: string;
  subtext?: string;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
  valueColor = 'text-on-surface',
  subtext,
  onClick
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/15 flex flex-col relative overflow-hidden group transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''
      }`}
    >
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-surface-container-highest/40 rounded-full transition-transform group-hover:scale-150 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        </div>
        <span className="font-label-caps text-on-surface-variant tracking-wider">{label}</span>
      </div>

      <div className="flex items-end justify-between relative z-10 mt-1">
        <span className={`font-display-gpa ${valueColor}`}>{value}</span>
        {trend && (
          <div
            className={`flex items-center gap-1 mb-2 px-2 py-0.5 rounded text-label-caps font-bold ${
              trendPositive
                ? 'bg-pass/10 text-pass'
                : 'bg-fail/10 text-fail'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trendPositive ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {trend}
          </div>
        )}
        {subtext && !trend && (
          <span className="text-body-md text-on-surface-variant mb-2">{subtext}</span>
        )}
      </div>
    </div>
  );
}
