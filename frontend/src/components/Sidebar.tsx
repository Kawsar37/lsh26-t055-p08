'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Students', href: '/students', icon: 'school' },
  { label: 'Results', href: '/results', icon: 'grading' },
  { label: 'Checking Lists', href: '/checking-lists', icon: 'checklist_rtl' },
  { label: 'Class Summary', href: '/class-summary', icon: 'analytics' },
  { label: 'Rule Tester', href: '/rule-tester', icon: 'science' },
  { label: 'Import Marks', href: '/import', icon: 'upload_file' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col border-r border-outline-variant/30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] no-print">
      {/* Brand Logo Header */}
      <div className="p-md flex items-center gap-base mb-sm">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-white text-[24px]">flowsheet</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-md text-primary tracking-tight font-bold">ResultFlow</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70">GPA Engine v1.0</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-sm space-y-xs overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-sm py-base rounded-lg transition-all group ${
                isActive
                  ? 'bg-surface-container-high text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined mr-sm text-[20px] ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                {item.icon}
              </span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Institution & User footer */}
      <div className="px-sm py-md border-t border-outline-variant/20 mt-auto bg-surface-container-lowest">
        <div className="flex items-center gap-sm p-sm mb-base rounded-lg bg-surface-container-low/50">
          <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-label-caps text-on-surface-variant">INSTITUTION</span>
            <span className="text-body-md font-bold truncate">Academic High School</span>
          </div>
        </div>

        <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-bold text-xs">
            MA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-md font-bold truncate">Mr. Anderson</p>
            <p className="text-label-caps text-on-surface-variant truncate">Exam Controller</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">verified</span>
        </div>
      </div>
    </aside>
  );
}
