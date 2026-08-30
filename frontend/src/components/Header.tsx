'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useCase } from '@/context/CaseContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSearch?: (term: string) => void;
}

export function Header({ title, subtitle, onSearch }: HeaderProps) {
  const pathname = usePathname();
  const { activeCase, setActiveCase, availableCases } = useCase();

  const getPageName = () => {
    if (title) return title;
    if (pathname === '/') return 'Dashboard Overview';
    if (pathname.startsWith('/students/')) return 'Student Result & Audit';
    if (pathname.startsWith('/students')) return 'Student Management';
    if (pathname.startsWith('/results')) return 'Published Results';
    if (pathname.startsWith('/checking-lists')) return 'Verification & Checking Lists';
    if (pathname.startsWith('/class-summary')) return 'Class Performance Summary';
    if (pathname.startsWith('/import')) return 'Import Marks (CSV Engine)';
    if (pathname.startsWith('/print/')) return 'Official Marksheet Preview';
    return 'ResultFlow';
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 border-b border-outline-variant/20 px-md flex items-center justify-between no-print">
      <div className="flex flex-col">
        <nav className="flex items-center gap-xs text-label-caps text-on-surface-variant mb-[2px]">
          <span>P08 Public Fixture</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary font-bold">{activeCase === 'ALL' ? 'All Public Cases' : activeCase}</span>
        </nav>
        <div className="text-title-sm font-bold text-on-surface">{getPageName()}</div>
      </div>

      <div className="flex items-center gap-4">
        {/* Dataset / Case Selector Dropdown */}
        <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[18px]">dataset</span>
          <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider">
            Dataset:
          </label>
          <select
            value={activeCase}
            onChange={(e) => setActiveCase(e.target.value)}
            className="bg-transparent text-xs font-bold text-primary outline-none cursor-pointer"
          >
            {availableCases.length > 0 ? (
              <>
                {availableCases.map((c) => (
                  <option key={c.caseId} value={c.caseId}>
                    {c.caseId} ({c.totalStudents} students)
                  </option>
                ))}
                <option value="ALL">All Cases Aggregated</option>
              </>
            ) : (
              <>
                <option value="PUB-01">PUB-01 (Public Fixture)</option>
                <option value="PUB-02">PUB-02</option>
                <option value="PUB-03">PUB-03</option>
                <option value="ALL">All Public Cases</option>
              </>
            )}
          </select>
        </div>

        {onSearch && (
          <div className="relative flex items-center hidden md:flex">
            <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[20px]">search</span>
            <input
              className="pl-10 pr-sm py-1.5 bg-surface-container rounded-lg border border-transparent focus:border-primary focus:bg-white text-body-md w-56 outline-none transition-all text-xs"
              placeholder="Search Student ID/Name..."
              type="text"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-sm">
          <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
              MA
            </div>
            <div className="flex flex-col hidden lg:flex">
              <span className="text-body-md font-semibold text-on-surface leading-tight text-xs">Mr. Anderson</span>
              <span className="text-[10px] text-on-surface-variant">Exam Controller</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
