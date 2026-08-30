'use client';

import React, { useState } from 'react';
import { CalculatedSubjectResult, TraceStep } from '@/lib/types';

interface CalculationTraceViewProps {
  subjects: CalculatedSubjectResult[];
  overallTrace: TraceStep[];
  compulsoryFailures: string[];
  uncancelledGpa: number;
  finalGpa: number;
  letterGrade: string;
}

export function CalculationTraceView({
  subjects,
  overallTrace,
  compulsoryFailures,
  uncancelledGpa,
  finalGpa,
  letterGrade,
}: CalculationTraceViewProps) {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | 'ALL'>('ALL');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">policy</span>
          </div>
          <div>
            <h3 className="font-title-sm text-on-surface flex items-center gap-2">
              Auditable Calculation Trace
              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded font-mono font-bold">
                P08-v1 Deterministic
              </span>
            </h3>
            <p className="text-body-md text-on-surface-variant text-xs">
              Complete step-by-step verification trail showing concrete marks and applied rule citations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary font-semibold hover:bg-surface-container px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExpanded ? 'unfold_less' : 'unfold_more'}
            </span>
            {isExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Compulsory Failure Override Alert */}
          {compulsoryFailures.length > 0 && (
            <div className="p-4 bg-fail/10 border-l-4 border-fail rounded-r-xl">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-fail text-[24px]">gavel</span>
                <div>
                  <h4 className="font-title-sm text-fail font-bold">
                    Compulsory Failure Override Active (Rule R-13)
                  </h4>
                  <p className="text-body-md text-on-surface mt-1">
                    Student failed in compulsory subject(s):{' '}
                    <span className="font-bold text-fail underline">
                      {compulsoryFailures.join(', ')}
                    </span>
                    . Although the mathematically uncancelled GPA is{' '}
                    <span className="font-bold font-mono">{uncancelledGpa.toFixed(2)}</span>,
                    the competition rule mandates an override to{' '}
                    <span className="font-bold font-mono text-fail">Final GPA: 0.00 (F)</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subject Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSubjectCode('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedSubjectCode === 'ALL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All Subjects ({subjects.length})
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.subjectCode}
                onClick={() => setSelectedSubjectCode(sub.subjectCode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedSubjectCode === sub.subjectCode
                    ? 'bg-primary text-white shadow-sm'
                    : sub.isFailed || sub.isAbsent
                    ? 'bg-fail/10 text-fail border border-fail/30 hover:bg-fail/20'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{sub.subjectName}</span>
                <span className={`text-[10px] px-1 rounded font-bold ${
                  selectedSubjectCode === sub.subjectCode ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface'
                }`}>
                  GP {sub.gradePoint.toFixed(1)}
                </span>
              </button>
            ))}
          </div>

          {/* Subject Rule Steps Grid */}
          <div className="space-y-4">
            {subjects
              .filter((sub) => selectedSubjectCode === 'ALL' || sub.subjectCode === selectedSubjectCode)
              .map((sub) => (
                <div
                  key={sub.subjectCode}
                  className={`p-4 rounded-xl border transition-all ${
                    sub.isFailed || sub.isAbsent
                      ? 'border-fail/30 bg-fail/5'
                      : 'border-outline-variant/20 bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-title-sm font-bold text-on-surface">
                        {sub.subjectName}
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        Code: {sub.subjectCode}
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">
                        {sub.isCompulsory ? '(Compulsory)' : '(4th Optional Subject)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-on-surface-variant font-medium">
                        {sub.isPractical
                          ? `Th: ${sub.theory}/75, Pr: ${sub.practical}/25`
                          : `Mark: ${sub.totalMark}/100`}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          sub.isFailed || sub.isAbsent
                            ? 'bg-fail text-white'
                            : 'bg-[#10B981] text-white'
                        }`}
                      >
                        GP {sub.gradePoint.toFixed(1)} ({sub.letterGrade})
                      </span>
                    </div>
                  </div>

                  {/* Trace Steps Timeline */}
                  <div className="space-y-2 pl-2">
                    {sub.traceSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            step.passed
                              ? 'bg-pass/15 text-pass'
                              : 'bg-fail/15 text-fail'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {step.passed ? 'check' : 'close'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface">{step.label}:</span>
                            <span className="font-mono font-bold text-primary">{String(step.value)}</span>
                          </div>
                          <p className="text-on-surface-variant font-mono text-[11px] mt-0.5">
                            {step.rule}
                          </p>
                          {step.detail && (
                            <p className="text-on-surface-variant/80 text-[11px] italic mt-0.5">
                              {step.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Master GPA Calculation Trace Steps */}
          <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/30">
            <h4 className="font-title-sm text-primary font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">calculate</span>
              Overall GPA & Result Aggregation Trace
            </h4>

            <div className="space-y-3 pl-2">
              {overallTrace.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      step.passed
                        ? 'bg-pass/20 text-pass'
                        : 'bg-fail/20 text-fail'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {step.passed ? 'done_all' : 'error'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{step.label}:</span>
                      <span className="font-mono font-bold text-primary text-xs">{String(step.value)}</span>
                    </div>
                    <p className="text-on-surface-variant font-mono text-[11px] mt-0.5">{step.rule}</p>
                    {step.detail && (
                      <p className="text-on-surface-variant/80 text-[11px] mt-0.5">{step.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
