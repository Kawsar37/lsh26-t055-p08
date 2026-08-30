'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { StatusBadge, GradeBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingState';
import { api } from '@/lib/api';
import { CheckingListItem } from '@/lib/types';
import { useCase } from '@/context/CaseContext';

type CheckingTab = 'OPTIONAL' | 'PRACTICAL' | 'ABSENT';

export default function CheckingListsPage() {
  const { activeCase } = useCase();
  const [activeTab, setActiveTab] = useState<CheckingTab>('OPTIONAL');
  const [items, setItems] = useState<CheckingListItem[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ optional: 0, practical: 0, absent: 0 });

  const loadData = async () => {
    try {
      setLoading(true);
      const className = selectedClass !== 'ALL' ? selectedClass : undefined;

      const [optRes, pracRes, absRes, classesRes] = await Promise.all([
        api.getOptionalCheckingList(activeCase, className),
        api.getPracticalCheckingList(activeCase, className),
        api.getAbsentCheckingList(activeCase, className),
        api.getClasses(activeCase),
      ]);

      setCounts({
        optional: optRes.length || 0,
        practical: pracRes.length || 0,
        absent: absRes.length || 0,
      });

      if (activeTab === 'OPTIONAL') setItems(optRes);
      else if (activeTab === 'PRACTICAL') setItems(pracRes);
      else if (activeTab === 'ABSENT') setItems(absRes);

      setClasses(classesRes);
    } catch (err: any) {
      console.error('Error fetching checking lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCase, activeTab, selectedClass]);

  return (
    <>
      <Header title="Result Verification & Checking Lists" />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-review/20 flex items-center justify-center text-[#D97706]">
              <span className="material-symbols-outlined text-[28px]">checklist_rtl</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-md font-bold text-on-surface">Audit & Verification Lists</h1>
                <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {activeCase}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Automated exception detection for students requiring verification according to competition rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Filter Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Independent Tabs matching Stitch UI */}
        <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-2">
          <button
            onClick={() => setActiveTab('OPTIONAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'OPTIONAL'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">help_outline</span>
            <span>Optional Checking (GP &le; 2.0 / AB)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === 'OPTIONAL' ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface'
            }`}>
              {counts.optional}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PRACTICAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'PRACTICAL'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">science</span>
            <span>Practical Fail (Pr &lt; 8)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === 'PRACTICAL' ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface'
            }`}>
              {counts.practical}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ABSENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ABSENT'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_off</span>
            <span>Absent Verification (AB in Any Subject)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === 'ABSENT' ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface'
            }`}>
              {counts.absent}
            </span>
          </button>
        </div>

        {/* Tab Description Alert */}
        <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          {activeTab === 'OPTIONAL' && (
            <span>
              <strong>Rule R-13 Criteria:</strong> Lists every student whose 4th optional subject grade point is <strong>&le; 2.0</strong> or marked <strong>AB</strong>. Does not fail the student overall if compulsory subjects passed.
            </span>
          )}
          {activeTab === 'PRACTICAL' && (
            <span>
              <strong>Rule R-11 Criteria:</strong> Lists every student where the practical component score is <strong>&lt; 8/25</strong> in any practical subject (compulsory or optional).
            </span>
          )}
          {activeTab === 'ABSENT' && (
            <span>
              <strong>Rule R-12 Criteria:</strong> Lists every student marked <strong>AB</strong> in any enrolled subject (compulsory absence results in overall F, optional absence yields 0 bonus).
            </span>
          )}
        </div>

        {/* Checking List Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="py-6">
              <TableSkeleton rows={6} cols={9} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/70 text-label-caps text-on-surface-variant">
                    <th className="py-3.5 px-4 font-bold">STUDENT ID</th>
                    <th className="py-3.5 px-4 font-bold">NAME</th>
                    <th className="py-3.5 px-4 font-bold">CLASS</th>
                    <th className="py-3.5 px-4 font-bold">SUBJECT</th>
                    <th className="py-3.5 px-4 font-bold text-center">RECORDED VALUE</th>
                    <th className="py-3.5 px-4 font-bold text-center">FINAL GPA</th>
                    <th className="py-3.5 px-4 font-bold text-center">RESULT</th>
                    <th className="py-3.5 px-4 font-bold">FLAG REASON</th>
                    <th className="py-3.5 px-4 font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-md text-xs">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <tr key={`${item.caseId}_${item.studentId}_${item.subjectCode}_${idx}`} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {item.studentCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-on-surface">
                          {item.studentName}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant">
                          {item.className}
                        </td>
                        <td className="py-3 px-4 font-medium text-on-surface">
                          {item.subjectName} ({item.subjectCode})
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-on-surface">
                          {item.problematicValue}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {item.finalGpa.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={item.overallResult} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-[11px] max-w-xs">
                          <span className="font-semibold text-review bg-review/10 px-2 py-0.5 rounded">
                            {item.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/students/${item.studentId}?caseId=${item.caseId || activeCase}`}
                            className="px-2.5 py-1 bg-primary text-white hover:bg-on-primary-fixed-variant font-bold text-xs rounded transition-colors inline-flex items-center gap-1 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[14px]">policy</span>
                            Open Trace
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-on-surface-variant">
                        No students found on this verification list for {activeCase}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
