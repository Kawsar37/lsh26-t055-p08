'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { StatusBadge, GradeBadge } from '@/components/StatusBadge';
import { CalculationTraceView } from '@/components/CalculationTraceView';
import { EditMarksModal } from '@/components/EditMarksModal';
import { ResultVerificationModal } from '@/components/ResultVerificationModal';
import { AuditTraceSkeleton } from '@/components/LoadingState';
import { api } from '@/lib/api';
import { ResultData, StudentItem } from '@/lib/types';
import { useCase } from '@/context/CaseContext';

export default function StudentAuditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { activeCase } = useCase();
  const studentIdParam = params?.id as string;
  const currentCase = searchParams.get('caseId') || activeCase || 'PUB-01';

  const [student, setStudent] = useState<StudentItem | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [caseMeta, setCaseMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadStudentData = async () => {
    if (!studentIdParam) return;
    try {
      setLoading(true);
      const data = await api.getStudentDetail(studentIdParam, currentCase);
      setStudent(data.student);
      setResult(data.result);
      setMarks(data.marks || []);
      setCaseMeta(data.caseMeta);
      setError(null);
    } catch (err: any) {
      console.error('Error loading student audit data:', err);
      setError(err.message || 'Failed to load student result audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentIdParam, currentCase]);

  const handleRecalculate = async () => {
    if (!student) return;
    try {
      setIsRecalculating(true);
      const res = await api.recalculateResult(student.studentId, student.caseId || currentCase);
      setResult(res);
      setSuccessMsg('Result successfully recalculated by Result Engine.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to recalculate result');
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <>
      <Header title="Student Result Audit & Rule Trace" />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/students"
              className="text-xs font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Students List
            </Link>
            <span className="text-on-surface-variant/40">•</span>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {currentCase}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-1.5 border border-outline-variant/30 text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Marks
            </button>

            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="bg-primary hover:bg-on-primary-fixed-variant text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Verify Result
            </button>

            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="bg-surface-container hover:bg-surface-container-high text-primary font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-1.5 border border-outline-variant/30 text-xs shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              {isRecalculating ? 'Recalculating...' : 'Recalculate'}
            </button>

            {student && (
              <Link
                href={`/print/${student.studentId}?caseId=${student.caseId || currentCase}`}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-1.5 border border-outline-variant/30 text-xs shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Marksheet
              </Link>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && !student && (
          <AuditTraceSkeleton />
        )}

        {/* Notifications */}
        {successMsg && (
          <div className="p-3 bg-pass/10 border border-pass/30 rounded-xl text-pass text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-fail/10 border border-fail/30 rounded-xl text-fail text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Student Profile Card matching Stitch UI */}
        {student && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-container text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shrink-0">
                {student.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-headline-md font-bold text-on-surface">{student.name}</h1>
                  <span className="font-mono text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                    {student.studentId}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-surface-container text-on-surface-variant px-2 py-0.5 rounded border border-outline-variant/30">
                    Fixture Dataset: {student.caseId}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-on-surface-variant mt-1.5 font-medium">
                  <span>Class: <strong className="text-on-surface">{student.className}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span>Roll: <strong className="text-on-surface">#{student.rollNumber}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span>Optional 4th Subject: <strong className="text-on-surface font-mono">{student.optionalSubjectCode}</strong></span>
                </div>
              </div>
            </div>

            {/* GPA Summary Highlights */}
            {result && (
              <div className="flex items-center justify-around sm:justify-start gap-2 sm:gap-4 bg-surface-container-low p-3 sm:p-4 rounded-xl border border-outline-variant/20 w-full md:w-auto">
                <div className="flex flex-col text-center px-3 border-r border-outline-variant/20">
                  <span className="text-label-caps text-on-surface-variant font-bold">FINAL GPA</span>
                  <span className={`font-display-gpa text-3xl font-extrabold ${result.overallResult === 'PASS' ? 'text-primary' : 'text-fail'}`}>
                    {result.finalGpa.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col text-center px-3 border-r border-outline-variant/20">
                  <span className="text-label-caps text-on-surface-variant font-bold">GRADE</span>
                  <div className="mt-1">
                    <GradeBadge grade={result.letterGrade} />
                  </div>
                </div>

                <div className="flex flex-col text-center px-3">
                  <span className="text-label-caps text-on-surface-variant font-bold">STATUS</span>
                  <div className="mt-1">
                    <StatusBadge status={result.overallResult} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calculation Summary Numbers Strip */}
        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
              <span className="text-label-caps text-on-surface-variant font-bold">COMPULSORY GP TOTAL</span>
              <p className="font-mono text-xl font-bold text-on-surface mt-1">
                {result.compulsoryGpTotal.toFixed(2)}
                <span className="text-xs text-on-surface-variant font-normal"> / 30.00</span>
              </p>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
              <span className="text-label-caps text-on-surface-variant font-bold">OPTIONAL GP</span>
              <p className="font-mono text-xl font-bold text-on-surface mt-1">
                {result.optionalGradePoint.toFixed(2)}
              </p>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
              <span className="text-label-caps text-on-surface-variant font-bold">OPTIONAL BONUS (MAX(0, GP-2))</span>
              <p className="font-mono text-xl font-bold text-[#10B981] mt-1">
                +{result.optionalBonus.toFixed(2)}
              </p>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
              <span className="text-label-caps text-on-surface-variant font-bold">UNCANCELLED GPA</span>
              <p className="font-mono text-xl font-bold text-primary mt-1">
                {result.uncancelledGpa.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Subject Breakdown Table */}
        {result && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="font-title-sm font-bold text-on-surface">Subject-wise Marks & Points</h3>
              <span className="text-xs text-on-surface-variant font-medium">6 Compulsory + 1 Optional Subject</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/60 text-label-caps text-on-surface-variant">
                    <th className="py-3 px-4 font-bold">CODE</th>
                    <th className="py-3 px-4 font-bold">SUBJECT NAME</th>
                    <th className="py-3 px-4 font-bold">TYPE</th>
                    <th className="py-3 px-4 font-bold text-center">THEORY (/75)</th>
                    <th className="py-3 px-4 font-bold text-center">PRACTICAL (/25)</th>
                    <th className="py-3 px-4 font-bold text-center">TOTAL (/100)</th>
                    <th className="py-3 px-4 font-bold text-center">GRADE POINT</th>
                    <th className="py-3 px-4 font-bold text-center">LETTER GRADE</th>
                    <th className="py-3 px-4 font-bold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-md text-xs">
                  {result.subjects.map((sub) => (
                    <tr
                      key={sub.subjectCode}
                      className={`hover:bg-surface-container-low/50 transition-colors ${
                        sub.isFailed || sub.isAbsent ? 'bg-fail/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-on-surface-variant">
                        {sub.subjectCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-on-surface">
                        {sub.subjectName}
                        {!sub.isCompulsory && (
                          <span className="ml-2 text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                            4th Subject
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant font-medium">
                        {sub.isPractical ? 'Practical + Theory' : 'Theory Only'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {sub.isAbsent
                          ? 'AB'
                          : sub.isPractical
                          ? sub.theory !== undefined
                            ? sub.theory
                            : '--'
                          : sub.totalMark}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {sub.isAbsent
                          ? 'AB'
                          : sub.isPractical
                          ? sub.practical !== undefined
                            ? sub.practical
                            : '--'
                          : '--'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {sub.isAbsent ? (
                          <span className="text-slate-600">AB</span>
                        ) : (
                          <span>{sub.totalMark}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-primary">
                        {sub.gradePoint.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <GradeBadge grade={sub.letterGrade} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={sub.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Expandable Calculation Trace Viewer */}
        {result && (
          <CalculationTraceView
            subjects={result.subjects as any}
            overallTrace={result.overallTrace}
            compulsoryFailures={result.compulsoryFailures || []}
            uncancelledGpa={result.uncancelledGpa}
            finalGpa={result.finalGpa}
            letterGrade={result.letterGrade}
          />
        )}
      </div>

      {/* Edit Marks Modal */}
      {student && result && (
        <EditMarksModal
          isOpen={isEditModalOpen}
          studentId={student.studentId}
          studentName={student.name}
          caseId={student.caseId || currentCase}
          initialSubjects={result.subjects.map((s) => ({
            subjectId: s.subjectCode,
            subjectCode: s.subjectCode,
            subjectName: s.subjectName,
            isCompulsory: s.isCompulsory,
            isPractical: s.isPractical,
            status: s.status,
            markStatus: s.markStatus,
            mark: s.mark,
            theory: s.theory,
            practical: s.practical,
            totalMark: s.totalMark
          }))}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(res) => {
            if (res.data?.result) {
              setResult(res.data.result);
            }
            setSuccessMsg('Student marks updated and results recalculated successfully!');
            setTimeout(() => setSuccessMsg(null), 4000);
            loadStudentData();
          }}
        />
      )}

      {/* Result Verification Modal */}
      {student && result && (
        <ResultVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          student={student}
          result={result}
          marks={marks}
          caseId={student.caseId || currentCase}
        />
      )}
    </>
  );
}
