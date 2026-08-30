'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge, GradeBadge } from '@/components/StatusBadge';
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/LoadingState';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { useCase } from '@/context/CaseContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const { activeCase, refreshCases } = useCase();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats(activeCase);
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard data. Connecting to ResultFlow API...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    refreshCases();
  }, [activeCase]);

  const gradeDistributionData = stats
    ? Object.entries(stats.gradeDistribution).map(([grade, count]) => ({
        grade,
        count
      }))
    : [];

  return (
    <>
      <Header title="Dashboard Overview" />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                P08 Public Fixture · {activeCase === 'ALL' ? 'All 25 Cases' : activeCase}
              </span>
            </div>
            <h1 className="font-headline-lg text-on-surface tracking-tight">Good morning, Exam Controller</h1>
            <p className="font-body-md text-on-surface-variant mt-0.5">
              Review student results, verify checking list exceptions, and publish final marksheets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/import"
              className="bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm py-2 px-4 rounded-lg transition-colors flex items-center gap-2 border border-outline-variant/30 text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Import Marks
            </Link>
            <Link
              href="/checking-lists"
              className="bg-primary hover:bg-on-primary-fixed-variant text-white font-title-sm py-2 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">checklist_rtl</span>
              Review Exceptions ({stats?.needsReview ?? 0})
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-fail/10 border border-fail/30 rounded-xl text-fail flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchStats}
              className="px-3 py-1 bg-fail text-white rounded font-bold hover:bg-fail/90"
            >
              Retry
            </button>
          </div>
        )}

        {/* 5 KPI Metric Cards */}
        {loading && !stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard
              label="TOTAL STUDENTS"
              value={stats?.totalStudents ?? 0}
              icon="groups"
            />
            <MetricCard
              label="PASSED"
              value={stats?.passed ?? 0}
              icon="check_circle"
              valueColor="text-[#10B981]"
              trend={stats ? `${stats.passRate}%` : undefined}
              trendPositive={true}
            />
            <MetricCard
              label="FAILED"
              value={stats?.failed ?? 0}
              icon="cancel"
              valueColor="text-[#F43F5E]"
              trend={stats && stats.totalStudents > 0 ? `${((stats.failed / stats.totalStudents) * 100).toFixed(0)}%` : undefined}
              trendPositive={false}
            />
            <MetricCard
              label="PASS RATE"
              value={`${stats?.passRate ?? 0}%`}
              icon="percent"
              valueColor="text-primary"
            />
            <Link href="/checking-lists">
              <MetricCard
                label="NEEDS REVIEW"
                value={stats?.needsReview ?? 0}
                icon="warning"
                valueColor="text-[#F59E0B]"
                subtext="Flagged cases"
              />
            </Link>
          </div>
        )}

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Class-wise Comparative Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-title-sm text-on-surface font-bold">Class Comparison (Passed vs Failed)</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Enrolled performance for {activeCase}</p>
              </div>
              <span className="text-label-caps text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full font-bold">
                {activeCase}
              </span>
            </div>

            <div className="h-64 w-full">
              {loading && !stats ? (
                <ChartSkeleton />
              ) : stats?.classComparative && stats.classComparative.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.classComparative} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6eeff" />
                    <XAxis dataKey="className" tick={{ fill: '#454652', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#454652', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#c5c5d4' }}
                    />
                    <Legend />
                    <Bar dataKey="passed" name="Passed" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" name="Failed" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-xs">
                  No comparative class data available.
                </div>
              )}
            </div>
          </div>

          {/* Grade Distribution Chart */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-title-sm text-on-surface font-bold">Grade Distribution</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Letter grade breakdown</p>
              </div>
              <span className="text-label-caps text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">
                SCALE 5.00
              </span>
            </div>

            <div className="h-64 w-full">
              {loading && !stats ? (
                <ChartSkeleton />
              ) : gradeDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6eeff" />
                    <XAxis dataKey="grade" tick={{ fill: '#454652', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#454652', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#c5c5d4' }}
                    />
                    <Bar dataKey="count" name="Students" fill="#3f51b5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-xs">
                  No distribution data.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Audit Table matching Stitch UI */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
          <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">history_edu</span>
              </div>
              <div>
                <h2 className="font-title-sm font-bold text-on-surface">Recent Student Calculations ({activeCase})</h2>
                <p className="text-xs text-on-surface-variant">Live audit snapshot of evaluated official fixture results</p>
              </div>
            </div>

            <Link
              href="/students"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Full Student Roster
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading && !stats ? (
              <TableSkeleton rows={5} cols={8} />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/60 text-label-caps text-on-surface-variant">
                    <th className="py-3 px-4 font-bold">STUDENT ID</th>
                    <th className="py-3 px-4 font-bold">NAME</th>
                    <th className="py-3 px-4 font-bold">CLASS</th>
                    <th className="py-3 px-4 font-bold text-center">FINAL GPA</th>
                    <th className="py-3 px-4 font-bold text-center">GRADE</th>
                    <th className="py-3 px-4 font-bold text-center">RESULT</th>
                    <th className="py-3 px-4 font-bold text-center">REVIEW STATUS</th>
                    <th className="py-3 px-4 font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-md">
                  {stats?.recentAudit && stats.recentAudit.length > 0 ? (
                    stats.recentAudit.map((r) => (
                      <tr key={`${r.caseId}_${r.studentId}`} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary text-xs">
                          {r.studentCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-on-surface text-xs">
                          {r.studentName}
                        </td>
                        <td className="py-3 px-4 text-xs text-on-surface-variant">
                          {r.className}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-xs">
                          {r.finalGpa.toFixed(2)}
                          {r.hasCompulsoryFailure && (
                            <span className="text-[10px] text-fail block font-normal">
                              Override (Raw: {r.uncancelledGpa.toFixed(2)})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <GradeBadge grade={r.letterGrade} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={r.overallResult} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.isFlaggedForReview ? (
                            <StatusBadge status="NEEDS_REVIEW" size="sm" />
                          ) : (
                            <span className="text-[11px] text-on-surface-variant font-medium">Verified</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/students/${r.studentId}?caseId=${r.caseId || activeCase}`}
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs rounded transition-colors inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">policy</span>
                            Audit Trace
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-on-surface-variant text-xs">
                        No calculation records found. Run <code className="bg-surface-container px-1 py-0.5 rounded">npm run seed:fixture</code>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
