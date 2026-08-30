'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { StatusBadge, GradeBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { ResultData } from '@/lib/types';
import { useCase } from '@/context/CaseContext';

export default function ResultsPage() {
  const { activeCase } = useCase();
  const [results, setResults] = useState<ResultData[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [isRecalculatingAll, setIsRecalculatingAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resData, classesData] = await Promise.all([
        api.getResults({
          caseId: activeCase,
          className: selectedClass !== 'ALL' ? selectedClass : undefined,
          overallResult: selectedResult !== 'ALL' ? selectedResult : undefined,
        }),
        api.getClasses(activeCase),
      ]);
      setResults(resData);
      setClasses(classesData);
    } catch (err: any) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCase, selectedClass, selectedResult]);

  const handleRecalculateAll = async () => {
    try {
      setIsRecalculatingAll(true);
      const res = await api.recalculateAll(activeCase);
      setNotice(res.message || 'All results recalculated successfully.');
      await loadData();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert('Error recalculating all: ' + err.message);
    } finally {
      setIsRecalculatingAll(false);
    }
  };

  return (
    <>
      <Header title="Published Results & Academic Ranking" />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
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

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase">Result:</span>
              <select
                value={selectedResult}
                onChange={(e) => setSelectedResult(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="ALL">All Results</option>
                <option value="PASS">Passed Only</option>
                <option value="FAIL">Failed Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculateAll}
              disabled={isRecalculatingAll}
              className="bg-primary hover:bg-on-primary-fixed-variant text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-xs shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              {isRecalculatingAll ? 'Recalculating All...' : `Recalculate ${activeCase} Results`}
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-pass/10 border border-pass/30 rounded-xl text-pass text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{notice}</span>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/70 text-label-caps text-on-surface-variant">
                  <th className="py-3.5 px-4 font-bold">RANK</th>
                  <th className="py-3.5 px-4 font-bold">STUDENT ID</th>
                  <th className="py-3.5 px-4 font-bold">NAME</th>
                  <th className="py-3.5 px-4 font-bold">CLASS</th>
                  <th className="py-3.5 px-4 font-bold text-center">COMPULSORY GP</th>
                  <th className="py-3.5 px-4 font-bold text-center">OPT BONUS</th>
                  <th className="py-3.5 px-4 font-bold text-center">FINAL GPA</th>
                  <th className="py-3.5 px-4 font-bold text-center">GRADE</th>
                  <th className="py-3.5 px-4 font-bold text-center">STATUS</th>
                  <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-md text-xs">
                {results.length > 0 ? (
                  results.map((r: any, idx) => (
                    <tr key={`${r.caseId}_${r.studentId}`} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-on-surface-variant">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {r.studentId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-on-surface">
                        {r.studentName}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {r.className}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        {r.compulsoryGpTotal?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-pass">
                        +{r.optionalBonus?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-sm">
                        {r.finalGpa?.toFixed(2)}
                        {r.hasCompulsoryFailure && (
                          <span className="text-[10px] text-fail block font-normal font-sans">
                            (Raw: {r.uncancelledGpa?.toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <GradeBadge grade={r.letterGrade} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={r.overallResult} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/students/${r.studentId}?caseId=${r.caseId || activeCase}`}
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs rounded transition-colors inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">policy</span>
                            Audit
                          </Link>
                          <Link
                            href={`/print/${r.studentId}?caseId=${r.caseId || activeCase}`}
                            className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded transition-colors"
                            title="Print"
                          >
                            <span className="material-symbols-outlined text-[16px]">print</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-on-surface-variant">
                      {loading ? 'Loading results...' : 'No results found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
