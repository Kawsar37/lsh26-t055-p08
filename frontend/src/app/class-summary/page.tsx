'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { MetricCardSkeleton, ChartSkeleton } from '@/components/LoadingState';
import { api } from '@/lib/api';
import { ClassSummaryData } from '@/lib/types';
import { useCase } from '@/context/CaseContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function ClassSummaryPage() {
  const { activeCase } = useCase();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [summary, setSummary] = useState<ClassSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getClasses(activeCase).then((res) => {
      setClasses(res);
      setSelectedClassId('ALL');
    });
  }, [activeCase]);

  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);
    api.getClassSummary(selectedClassId, activeCase)
      .then((data) => setSummary(data))
      .catch((err) => console.error('Error fetching class summary:', err))
      .finally(() => setLoading(false));
  }, [selectedClassId, activeCase]);

  const gradeData = summary
    ? Object.entries(summary.gradeDistribution).map(([grade, count]) => ({
        grade,
        count
      }))
    : [];

  const passFailData = summary
    ? [
        { name: 'Passed', value: summary.passed, color: '#10B981' },
        { name: 'Failed', value: summary.failed, color: '#F43F5E' }
      ]
    : [];

  return (
    <>
      <Header title="Class Performance Summary & Analytics" />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
        {/* Top Filter Bar */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                Fixture Case: {activeCase}
              </span>
            </div>
            <h1 className="font-headline-md font-bold text-on-surface">Class Performance Analytics</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Comprehensive academic summary, subject bottlenecks, and grade distributions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Select Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-3.5 py-2 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="ALL">All Classes Combined</option>
              {classes.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        {loading && !summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard
              label="TOTAL STUDENTS"
              value={summary?.totalStudents ?? 0}
              icon="groups"
            />
            <MetricCard
              label="PASS RATE"
              value={`${summary?.passRate ?? 0}%`}
              icon="percent"
              valueColor="text-[#10B981]"
            />
            <MetricCard
              label="AVERAGE GPA"
              value={summary?.averageGpa?.toFixed(2) ?? '0.00'}
              icon="speed"
              valueColor="text-primary"
            />
            <MetricCard
              label="FAILED STUDENTS"
              value={summary?.failed ?? 0}
              icon="cancel"
              valueColor="text-[#F43F5E]"
            />
            <MetricCard
              label="NEEDS REVIEW"
              value={summary?.needsReview ?? 0}
              icon="warning"
              valueColor="text-[#F59E0B]"
            />
          </div>
        )}

        {/* Charts & Subject Bottleneck Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grade Distribution */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-title-sm font-bold text-on-surface">Letter Grade Distribution</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Students achieved per letter grade tier</p>
              </div>
              <span className="text-label-caps text-primary bg-primary/10 px-3 py-1 rounded-full font-bold">
                {summary?.className || 'Class'}
              </span>
            </div>

            <div className="h-64 w-full">
              {loading && !summary ? (
                <ChartSkeleton />
              ) : gradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6eeff" />
                    <XAxis dataKey="grade" tick={{ fill: '#454652', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#454652', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#c5c5d4' }}
                    />
                    <Bar dataKey="count" name="Students" fill="#3f51b5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
                  No grade data.
                </div>
              )}
            </div>
          </div>

          {/* Pass vs Fail Ratio */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-title-sm font-bold text-on-surface">Pass vs Fail Outcome</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Academic standing proportion</p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {passFailData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-on-surface-variant">No outcome data</div>
              )}
            </div>
          </div>
        </div>

        {/* Most Failed Subjects Ranking */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
          <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-fail/15 flex items-center justify-center text-fail">
                <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
              </div>
              <div>
                <h2 className="font-title-sm font-bold text-on-surface">Subject Bottlenecks (Most Failed Subjects)</h2>
                <p className="text-xs text-on-surface-variant">Ranked by count of students failing or absent in the subject</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {summary?.subjectFailures && summary.subjectFailures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.subjectFailures.map((sub, idx) => (
                  <div
                    key={sub.subjectCode}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs text-on-surface">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">{sub.subjectName}</h4>
                        <span className="text-[10px] text-on-surface-variant font-mono">Code: {sub.subjectCode}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-base font-extrabold text-fail">{sub.failCount}</span>
                      <span className="text-[10px] text-on-surface-variant block font-medium">students failed</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-pass font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Outstanding performance! Zero subject failures recorded for this selection.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
