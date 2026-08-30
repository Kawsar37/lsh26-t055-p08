'use client';

import React from 'react';
import { ResultData, StudentItem } from '@/lib/types';
import { GradeBadge, StatusBadge } from './StatusBadge';

interface ResultVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem;
  result: ResultData;
  marks?: any[];
  caseId: string;
}

export function ResultVerificationModal({
  isOpen,
  onClose,
  student,
  result,
  marks = [],
  caseId
}: ResultVerificationModalProps) {
  if (!isOpen) return null;

  const subjects = result?.subjects || [];
  const compulsorySubjects = subjects.filter((s) => s.isCompulsory);
  const optionalSubject = subjects.find((s) => !s.isCompulsory);

  const compulsoryFailures = result?.compulsoryFailures || [];
  const hasCompulsoryFailure = result?.hasCompulsoryFailure || false;
  const isPass = result?.overallResult === 'PASS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title-md font-bold text-on-surface">Result Verification</h2>
                <span className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {caseId}
                </span>
                <span className="text-[11px] font-mono font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  {student.studentId}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Step-by-step verification of this student's result · {student.name} (Roll #{student.rollNumber}, {student.className})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 flex-1 text-on-surface">
          {/* Chronological Step 1: Subject Evaluation */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-title-sm font-bold text-on-surface uppercase tracking-wide">
                Subject Evaluation & Mark Grading
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant pl-8">
              Verification of marks obtained against official National Scale 5.00 thresholds.
            </p>

            <div className="pl-8 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjects.map((sub) => {
                  const isAB = sub.markStatus === 'AB' || sub.status === 'ABSENT';
                  const isPractical = sub.isPractical;

                  return (
                    <div
                      key={sub.subjectCode}
                      className={`p-4 rounded-xl border transition-all ${
                        sub.isFailed
                          ? 'bg-fail/5 border-fail/30'
                          : 'bg-surface-container-low/40 border-outline-variant/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-primary">
                            {sub.subjectCode}
                          </span>
                          <span className="text-xs font-semibold text-on-surface">
                            {sub.subjectName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            {sub.isCompulsory ? 'Compulsory' : 'Optional (4th)'}
                          </span>
                          <GradeBadge grade={sub.letterGrade} />
                        </div>
                      </div>

                      {/* Marks details */}
                      {isAB ? (
                        <div className="text-xs space-y-1 bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/15">
                          <div className="flex justify-between font-mono">
                            <span className="text-on-surface-variant">Status:</span>
                            <span className="font-bold text-fail">ABSENT (AB)</span>
                          </div>
                          <div className="text-[11px] text-on-surface-variant">
                            {sub.isCompulsory
                              ? 'Rule: Absent in compulsory subject → overall result F (Grade Point: 0.0)'
                              : 'Rule: Absent in optional subject → Grade Point: 0.0, Optional Bonus: 0.0'}
                          </div>
                        </div>
                      ) : isPractical ? (
                        <div className="text-xs space-y-1.5 bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/15 font-mono">
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant font-sans">Theory Mark:</span>
                            <span className={sub.theory !== undefined && sub.theory < 25 ? 'font-bold text-fail' : 'font-semibold'}>
                              {sub.theory} / 75 {sub.theory !== undefined && (sub.theory >= 25 ? '(>= 25 PASS)' : '(FAIL < 25)')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant font-sans">Practical Mark:</span>
                            <span className={sub.practical !== undefined && sub.practical < 8 ? 'font-bold text-fail' : 'font-semibold'}>
                              {sub.practical} / 25 {sub.practical !== undefined && (sub.practical >= 8 ? '(>= 8 PASS)' : '(FAIL < 8)')}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-outline-variant/20 pt-1 font-sans">
                            <span className="font-semibold text-on-surface">Total Mark:</span>
                            <span className="font-bold font-mono text-on-surface">
                              {sub.totalMark} / 100 → GP {sub.gradePoint.toFixed(1)}
                            </span>
                          </div>
                          {sub.isPracticalFail && (
                            <div className="text-[11px] font-sans text-fail mt-1 bg-fail/10 p-1.5 rounded">
                              The practical component is below the required pass mark of 8. Therefore this subject receives Grade Point 0.0.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs space-y-1 bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/15">
                          <div className="flex justify-between font-mono">
                            <span className="text-on-surface-variant font-sans">Mark Obtained:</span>
                            <span className="font-bold text-on-surface">{sub.totalMark} / 100</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-on-surface-variant font-sans">Applied Grade Rule:</span>
                            <span className="font-semibold text-primary">
                              {Number(sub.totalMark) >= 80 ? '80–100 → 5.0 (A+)' :
                               Number(sub.totalMark) >= 70 ? '70–79 → 4.0 (A)' :
                               Number(sub.totalMark) >= 60 ? '60–69 → 3.5 (A-)' :
                               Number(sub.totalMark) >= 50 ? '50–59 → 3.0 (B)' :
                               Number(sub.totalMark) >= 40 ? '40–49 → 2.0 (C)' :
                               Number(sub.totalMark) >= 33 ? '33–39 → 1.0 (D)' : '0–32 → 0.0 (F)'}
                            </span>
                          </div>
                          <div className="flex justify-between font-mono border-t border-outline-variant/20 pt-1">
                            <span className="font-sans font-semibold">Grade Point:</span>
                            <span className="font-extrabold text-on-surface">{sub.gradePoint.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Chronological Step 2: Subject Grade Points */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-title-sm font-bold text-on-surface uppercase tracking-wide">
                Compulsory Grade Point Summation
              </h3>
            </div>
            <div className="pl-8">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-on-surface-variant">Formula:</span>
                  <p className="font-mono text-sm font-bold text-on-surface mt-0.5">
                    {compulsorySubjects.map((s) => `${s.subjectCode}(${s.gradePoint.toFixed(1)})`).join(' + ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-on-surface-variant">Compulsory GP Total:</span>
                  <p className="font-mono text-xl font-extrabold text-primary">
                    {result?.compulsoryGpTotal?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chronological Step 3: Optional Contribution */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-title-sm font-bold text-on-surface uppercase tracking-wide">
                Optional (4th) Subject Bonus Contribution
              </h3>
            </div>
            <div className="pl-8">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-on-surface">
                      {optionalSubject?.subjectName || 'Optional Subject'} ({optionalSubject?.subjectCode || student.optionalSubjectCode})
                    </span>
                    <span className="font-mono text-xs font-semibold bg-surface-container px-2 py-0.5 rounded">
                      Earned GP: {result?.optionalGradePoint?.toFixed(1) ?? '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">Calculated Bonus:</span>
                    <span className="font-mono text-lg font-extrabold text-pass">
                      +{result?.optionalBonus?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/15 text-xs font-mono">
                  <div className="text-on-surface-variant font-sans mb-1">
                    Rule: Bonus = max(0, Optional Grade Point - 2.0)
                  </div>
                  <div className="text-on-surface font-bold">
                    max(0, {result?.optionalGradePoint?.toFixed(1) ?? '0.0'} - 2.0) = {result?.optionalBonus?.toFixed(2) ?? '0.00'}
                  </div>
                  {result?.optionalGradePoint !== undefined && result.optionalGradePoint <= 2.0 && (
                    <div className="text-[11px] font-sans text-on-surface-variant mt-1">
                      (Optional GP is &le; 2.0, so 0.0 bonus points are added to the total).
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Chronological Step 4: Uncancelled GPA */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-title-sm font-bold text-on-surface uppercase tracking-wide">
                Uncancelled GPA Calculation
              </h3>
            </div>
            <div className="pl-8">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-on-surface-variant">Standard 6-Compulsory Divisor Formula:</span>
                  <p className="font-mono text-sm font-bold text-on-surface mt-0.5">
                    ({result?.compulsoryGpTotal?.toFixed(2) || '0.00'} + {result?.optionalBonus?.toFixed(2) || '0.00'}) / 6
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-on-surface-variant">Uncancelled Raw GPA:</span>
                  <p className="font-mono text-xl font-extrabold text-on-surface">
                    {result?.uncancelledGpa?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chronological Step 5: Compulsory Failure Check */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h3 className="font-title-sm font-bold text-on-surface uppercase tracking-wide">
                Compulsory Subject Failure & Override Check
              </h3>
            </div>
            <div className="pl-8">
              {hasCompulsoryFailure ? (
                <div className="p-4 bg-fail/10 border border-fail/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-fail font-bold text-xs">
                    <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                    <span>Compulsory Failure Override Triggered</span>
                  </div>
                  <p className="text-xs text-on-surface">
                    Student failed in compulsory subject(s):{' '}
                    <strong className="text-fail">{compulsoryFailures.join(', ')}</strong>.
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    National Grading Rule: A failure (F / AB) in any compulsory subject overrides the uncancelled raw GPA ({result?.uncancelledGpa?.toFixed(2)}) to <strong className="text-fail">0.00 (Grade F)</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-pass/10 border border-pass/30 rounded-xl flex items-center gap-2 text-pass text-xs">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span className="font-bold">Passed All Compulsory Subjects (0 Failures Detected)</span>
                </div>
              )}
            </div>
          </section>

          {/* Chronological Step 6 & 7: Final GPA & Letter Grade Summary */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                6 & 7
              </span>
              <h3 className="font-title-sm font-bold text-on-surface uppercase tracking-wide">
                Verification Complete: Final GPA & Academic Outcome
              </h3>
            </div>
            <div className="pl-8">
              <div className={`p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-6 ${
                isPass
                  ? 'bg-pass/5 border-pass/30'
                  : 'bg-fail/5 border-fail/30'
              }`}>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Verified Standing
                  </span>
                  <div className="flex items-center gap-3">
                    <h4 className="font-headline-md font-extrabold text-on-surface">
                      {isPass ? 'PASS' : 'FAIL'}
                    </h4>
                    <GradeBadge grade={result?.letterGrade || 'F'} size="lg" />
                    <StatusBadge status={result?.overallResult || 'FAIL'} />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {hasCompulsoryFailure
                      ? `Final GPA: 0.00 (Overridden from uncancelled GPA ${result?.uncancelledGpa?.toFixed(2)} due to compulsory failure)`
                      : `Final GPA: ${result?.finalGpa?.toFixed(2)} (Calculated from scale 5.00 deterministic engine)`}
                  </p>
                </div>

                <div className="flex items-center gap-6 border-l border-outline-variant/20 pl-6">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                      FINAL GPA
                    </span>
                    <span className="font-mono text-3xl font-extrabold text-primary">
                      {result?.finalGpa?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                      GRADE
                    </span>
                    <span className="font-mono text-3xl font-extrabold text-on-surface">
                      {result?.letterGrade || 'F'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-pass">check_circle</span>
            <span>Deterministic GPA engine verified against P08 rules</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-lg text-xs transition-colors"
            >
              Close Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
