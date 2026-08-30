'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCase } from '@/context/CaseContext';

export default function PrintMarksheetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { activeCase } = useCase();
  const studentId = params?.id as string;
  const currentCase = searchParams.get('caseId') || activeCase || 'PUB-01';

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    api.getPrintMarksheet(studentId, currentCase)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load marksheet data'))
      .finally(() => setLoading(false));
  }, [studentId, currentCase]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-on-surface-variant">Generating official marksheet...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-fail/10 text-fail rounded-xl border border-fail/30 text-xs">
        {error || 'Marksheet could not be generated.'}
      </div>
    );
  }

  const { student, result, institution } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm">
        <Link
          href={`/students/${student.studentId}?caseId=${student.caseId || currentCase}`}
          className="text-xs font-bold text-on-surface-variant hover:text-primary flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Audit Trace
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded">
            Dataset: {student.caseId || currentCase}
          </span>
          <button
            onClick={handlePrint}
            className="bg-primary hover:bg-on-primary-fixed-variant text-white font-bold py-2 px-5 rounded-lg text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Official Marksheet
          </button>
        </div>
      </div>

      {/* Official Marksheet Paper Container */}
      <div className="print-page bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-outline-variant/30 text-black">
        {/* Institution Header */}
        <div className="text-center border-b-2 border-primary pb-6 space-y-1">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[28px]">school</span>
            </div>
            <div>
              <h1 className="font-headline-md font-extrabold tracking-tight text-primary text-2xl uppercase">
                {institution.name}
              </h1>
              <p className="text-xs font-semibold text-gray-600">{institution.subTitle}</p>
            </div>
          </div>

          <h2 className="font-title-sm font-bold text-gray-800 text-sm tracking-wider uppercase">
            ACADEMIC TRANSCRIPT / OFFICIAL MARKSHEET
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {institution.examName} • {institution.gradingSystem}
          </p>
        </div>

        {/* Student Profile Metadata Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 uppercase text-[10px] font-bold block">Student Name</span>
            <strong className="text-gray-900 text-sm">{student.name}</strong>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-[10px] font-bold block">Student ID</span>
            <strong className="font-mono text-gray-900 text-sm">{student.studentId}</strong>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-[10px] font-bold block">Class & Section</span>
            <strong className="text-gray-900 text-sm">{student.className}</strong>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-[10px] font-bold block">Roll Number</span>
            <strong className="font-mono text-gray-900 text-sm">#{student.rollNumber}</strong>
          </div>
        </div>

        {/* Subject-Wise Mark Breakdown Table */}
        <table className="w-full text-left border-collapse border border-gray-300 text-xs my-6">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 font-bold uppercase text-[10px] text-gray-700">
              <th className="py-2.5 px-3 border-r border-gray-300">Code</th>
              <th className="py-2.5 px-3 border-r border-gray-300">Subject Name</th>
              <th className="py-2.5 px-3 text-center border-r border-gray-300">Theory (/75)</th>
              <th className="py-2.5 px-3 text-center border-r border-gray-300">Practical (/25)</th>
              <th className="py-2.5 px-3 text-center border-r border-gray-300">Total (/100)</th>
              <th className="py-2.5 px-3 text-center border-r border-gray-300">Grade Point</th>
              <th className="py-2.5 px-3 text-center border-r border-gray-300">Letter Grade</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {result.subjects.map((sub: any) => (
              <tr key={sub.subjectCode} className="hover:bg-gray-50">
                <td className="py-2.5 px-3 font-mono font-bold text-gray-700 border-r border-gray-300">
                  {sub.subjectCode}
                </td>
                <td className="py-2.5 px-3 font-semibold text-gray-900 border-r border-gray-300">
                  {sub.subjectName}
                  {!sub.isCompulsory && (
                    <span className="ml-1.5 text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                      4th Subject
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-mono border-r border-gray-300">
                  {sub.isAbsent ? 'AB' : sub.isPractical ? sub.theory : sub.totalMark}
                </td>
                <td className="py-2.5 px-3 text-center font-mono border-r border-gray-300">
                  {sub.isAbsent ? 'AB' : sub.isPractical ? sub.practical : '--'}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold border-r border-gray-300">
                  {sub.totalMark}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-extrabold text-primary border-r border-gray-300">
                  {sub.gradePoint.toFixed(1)}
                </td>
                <td className="py-2.5 px-3 text-center font-bold border-r border-gray-300">
                  {sub.letterGrade}
                </td>
                <td className="py-2.5 px-3 text-center font-bold">
                  {sub.status === 'PASS' ? (
                    <span className="text-emerald-700">PASS</span>
                  ) : (
                    <span className="text-rose-600 font-bold">{sub.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GPA & Result Seal Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-5 bg-blue-50/50 rounded-xl border border-blue-200">
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-2">
              GPA Calculation Breakdown
            </h4>
            <div className="flex justify-between border-b border-blue-200/60 pb-1">
              <span className="text-gray-600">Compulsory Subjects GP Sum (6 Subjects):</span>
              <strong className="font-mono">{result.compulsoryGpTotal.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between border-b border-blue-200/60 pb-1">
              <span className="text-gray-600">Optional 4th Subject Bonus (max(0, GP-2)):</span>
              <strong className="font-mono text-emerald-700">+{result.optionalBonus.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between border-b border-blue-200/60 pb-1">
              <span className="text-gray-600">Uncancelled Calculated GPA (Divisor: 6):</span>
              <strong className="font-mono text-blue-900">{result.uncancelledGpa.toFixed(2)}</strong>
            </div>
            {result.hasCompulsoryFailure && (
              <div className="p-2 bg-rose-100 rounded text-rose-800 text-[11px] font-bold">
                ⚠️ Compulsory Subject Failure Override Applied: Final GPA forced to 0.00 (F)
              </div>
            )}
          </div>

          <div className="flex items-center justify-around bg-white p-4 rounded-xl border border-blue-200 shadow-sm text-center">
            <div>
              <span className="text-gray-500 font-bold text-[10px] uppercase block">FINAL GPA</span>
              <span className={`font-mono text-3xl font-extrabold ${result.overallResult === 'PASS' ? 'text-primary' : 'text-rose-600'}`}>
                {result.finalGpa.toFixed(2)}
              </span>
            </div>

            <div className="border-l border-gray-200 pl-6">
              <span className="text-gray-500 font-bold text-[10px] uppercase block">LETTER GRADE</span>
              <span className="text-3xl font-black text-gray-900 block">
                {result.letterGrade}
              </span>
            </div>

            <div className="border-l border-gray-200 pl-6">
              <span className="text-gray-500 font-bold text-[10px] uppercase block">RESULT</span>
              <span className={`text-base font-extrabold uppercase px-2.5 py-1 rounded ${
                result.overallResult === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {result.overallResult}
              </span>
            </div>
          </div>
        </div>

        {/* Official Signatures Strip */}
        <div className="grid grid-cols-3 gap-8 pt-16 mt-12 text-center text-xs border-t border-gray-300">
          <div>
            <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
            <p className="font-semibold text-gray-700">Class Teacher</p>
          </div>
          <div>
            <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
            <p className="font-semibold text-gray-700">Head of Department</p>
          </div>
          <div>
            <div className="border-t border-gray-400 w-36 mx-auto mb-1"></div>
            <p className="font-bold text-primary">Controller of Examinations</p>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-[9px] text-gray-400 font-mono">
          <span>Dataset: {student.caseId || currentCase} • Engine: ResultFlow P08-v1</span>
          <span>Transcript Generated: {new Date(result.calculatedAt).toLocaleString()}</span>
          <span>System Authenticated • ResultFlow Core</span>
        </div>
      </div>
    </div>
  );
}
