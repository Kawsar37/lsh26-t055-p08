'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { StatusBadge, GradeBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingState';
import { api } from '@/lib/api';
import { StudentItem } from '@/lib/types';
import { useCase } from '@/context/CaseContext';

export default function StudentsPage() {
  const { activeCase } = useCase();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        api.getStudents({
          caseId: activeCase,
          className: selectedClass !== 'ALL' ? selectedClass : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          search: searchTerm || undefined,
        }),
        api.getClasses(activeCase),
      ]);
      setStudents(studentsRes);
      setClasses(classesRes);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCase, selectedClass, selectedStatus, searchTerm]);

  return (
    <>
      <Header title="Student Management & Results Roster" onSearch={(t) => setSearchTerm(t)} />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase">Class:</span>
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

            {/* Academic Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="PASS">Passed Only</option>
                <option value="FAIL">Failed Only</option>
                <option value="ABSENT">Absent Only</option>
                <option value="NEEDS_REVIEW">Needs Review Flag</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-on-surface-variant font-semibold">
              Showing <span className="font-bold text-on-surface">{students.length}</span> students ({activeCase})
            </span>
            <button
              onClick={loadData}
              className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-fail/10 border border-fail/30 rounded-xl text-fail flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="px-3 py-1 bg-fail text-white rounded font-bold">
              Retry
            </button>
          </div>
        )}

        {/* Students Data Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
          {loading && students.length === 0 ? (
            <div className="py-6">
              <TableSkeleton rows={8} cols={10} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/70 text-label-caps text-on-surface-variant">
                    <th className="py-3.5 px-4 font-bold">ROLL</th>
                    <th className="py-3.5 px-4 font-bold">STUDENT ID</th>
                    <th className="py-3.5 px-4 font-bold">NAME</th>
                    <th className="py-3.5 px-4 font-bold">CLASS</th>
                    <th className="py-3.5 px-4 font-bold">OPTIONAL (4TH)</th>
                    <th className="py-3.5 px-4 font-bold text-center">FINAL GPA</th>
                    <th className="py-3.5 px-4 font-bold text-center">GRADE</th>
                    <th className="py-3.5 px-4 font-bold text-center">RESULT</th>
                    <th className="py-3.5 px-4 font-bold text-center">REVIEW</th>
                    <th className="py-3.5 px-4 font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-md">
                  {students.length > 0 ? (
                    students.map((st) => {
                      const result = st.result;
                      return (
                        <tr key={`${st.caseId}_${st.studentId}`} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">
                            #{st.rollNumber}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-primary text-xs">
                            {st.studentId}
                          </td>
                          <td className="py-3 px-4 font-semibold text-on-surface text-xs">
                            {st.name}
                          </td>
                          <td className="py-3 px-4 text-xs text-on-surface-variant">
                            {st.className}
                          </td>
                          <td className="py-3 px-4 text-xs text-on-surface-variant font-medium">
                            <span className="bg-surface-container px-2 py-0.5 rounded font-mono font-bold text-on-surface">
                              {st.optionalSubjectCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-xs">
                            {result ? (
                              <div>
                                <span>{result.finalGpa.toFixed(2)}</span>
                                {result.hasCompulsoryFailure && (
                                  <span className="text-[10px] text-fail block font-normal">
                                    Raw: {result.uncancelledGpa.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-on-surface-variant font-normal">--</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {result ? (
                              <GradeBadge grade={result.letterGrade} />
                            ) : (
                              <span className="text-on-surface-variant text-xs">--</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {result ? (
                              <StatusBadge status={result.overallResult} size="sm" />
                            ) : (
                              <span className="text-on-surface-variant text-xs">--</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {result?.checkingFlags?.isFlaggedForReview ? (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-review/15 px-2 py-0.5 rounded-full"
                                title={result.checkingFlags.reviewReasons?.join(', ')}
                              >
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                Review
                              </span>
                            ) : (
                              <span className="text-[11px] text-pass font-semibold flex items-center justify-center gap-0.5">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Clear
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/students/${st.studentId}?caseId=${st.caseId || activeCase}`}
                                className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs rounded transition-colors inline-flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">policy</span>
                                Audit Trace
                              </Link>
                              <Link
                                href={`/print/${st.studentId}?caseId=${st.caseId || activeCase}`}
                                className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded transition-colors"
                                title="Print Marksheet"
                              >
                                <span className="material-symbols-outlined text-[16px]">print</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-on-surface-variant text-xs">
                        No students found matching your filters.
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
