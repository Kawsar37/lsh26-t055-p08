'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNav } from '@/context/NavContext';

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
  const { isMobileSidebarOpen, closeMobileSidebar } = useNav();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Main Sidebar (Drawer on mobile, fixed on desktop) */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col border-r border-outline-variant/30 shadow-[4px_0_24px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out no-print ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header with Mobile Close Button */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-outline-variant/15 lg:border-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-[24px]">flowsheet</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-primary tracking-tight font-bold">ResultFlow</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70">GPA Engine v1.0</span>
            </div>
          </div>

          {/* Close button for mobile screens */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined mr-3 text-[20px] ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                  {item.icon}
                </span>
                <span className="font-body-md text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Institution & User footer */}
        <div className="p-4 border-t border-outline-variant/20 mt-auto bg-surface-container-lowest space-y-2.5">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low/60">
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">INSTITUTION</span>
              <span className="text-xs font-bold truncate text-on-surface">Academic High School</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-surface-container-low rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-bold text-xs">
              MA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-on-surface">Mr. Anderson</p>
              <p className="text-[10px] text-on-surface-variant truncate">Exam Controller</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">verified</span>
          </div>
        </div>
      </aside>
    </>
  );
}
