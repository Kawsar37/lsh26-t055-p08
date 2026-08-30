'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { api } from '../../lib/api';

export default function ImportMarksPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
      setErrorMsg(null);
      setIsSuccess(false);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      setErrorMsg('Please select a CSV file first.');
      return;
    }

    try {
      setIsValidating(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.importMarks(formData, true); // dryRun = true
      setImportResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!file) return;

    try {
      setIsImporting(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.importMarks(formData, false); // dryRun = false
      setImportResult(res);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Import execution failed.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Header title="Import Student Marks (CSV Engine)" />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[28px]">upload_file</span>
            </div>
            <div>
              <h1 className="font-headline-md font-bold text-on-surface">CSV Mark Ingestion & Invalidation Engine</h1>
              <p className="text-xs text-on-surface-variant mt-1">
                Upload class marks with pre-import schema validation. Invalid inputs are rejected with exact error reasons.
              </p>
            </div>
          </div>

          <a
            href={api.getTemplateUrl()}
            download="resultflow_marks_template.csv"
            className="bg-surface-container hover:bg-surface-container-high text-primary font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2 border border-outline-variant/30 text-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download CSV Template
          </a>
        </div>

        {/* File Upload Drag & Drop Zone */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border-2 border-dashed border-outline-variant/40 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
          </div>

          <h3 className="font-title-sm font-bold text-on-surface">Select or drop marks CSV file</h3>
          <p className="text-xs text-on-surface-variant mt-1 max-w-md">
            Must match standard columns: <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono font-bold text-primary">Student_ID, Subject_Code, Status, Mark, Theory, Practical</code>
          </p>

          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3 mt-6">
            <label
              htmlFor="csv-file-input"
              className="bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-2 px-5 rounded-lg transition-colors cursor-pointer text-xs border border-outline-variant/30"
            >
              Browse Computer
            </label>

            {file && (
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="bg-primary hover:bg-on-primary-fixed-variant text-white font-bold py-2 px-5 rounded-lg transition-colors text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                {isValidating ? 'Validating CSV...' : 'Validate & Preview'}
              </button>
            )}
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-2 text-xs font-mono bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px] text-primary">description</span>
              <span className="font-bold text-on-surface">{file.name}</span>
              <span className="text-on-surface-variant">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-fail/10 border border-fail/30 rounded-xl text-fail flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="p-4 bg-pass/10 border border-pass/30 rounded-xl text-pass flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="font-bold">
                {importResult?.message || 'Marks successfully imported and results recalculated!'}
              </span>
            </div>
            <Link
              href="/results"
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1 rounded font-bold transition-colors"
            >
              View Updated Results
            </Link>
          </div>
        )}

        {/* Validation Summary & Preview Results */}
        {importResult && (
          <div className="space-y-6">
            {/* Metric counters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
                <span className="text-label-caps text-on-surface-variant font-bold">TOTAL ROWS</span>
                <p className="font-mono text-2xl font-bold text-on-surface mt-1">{importResult.totalRows}</p>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
                <span className="text-label-caps text-on-surface-variant font-bold">VALID ROWS</span>
                <p className="font-mono text-2xl font-bold text-[#10B981] mt-1">{importResult.acceptedCount}</p>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
                <span className="text-label-caps text-on-surface-variant font-bold">REJECTED ROWS</span>
                <p className="font-mono text-2xl font-bold text-[#F43F5E] mt-1">{importResult.rejectedCount}</p>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15">
                <span className="text-label-caps text-on-surface-variant font-bold">AFFECTED STUDENTS</span>
                <p className="font-mono text-2xl font-bold text-primary mt-1">{importResult.affectedStudentsCount}</p>
              </div>
            </div>

            {/* Execute Button */}
            {!isSuccess && importResult.acceptedCount > 0 && (
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 flex items-center justify-between">
                <div>
                  <h4 className="font-title-sm font-bold text-on-surface">Ready to Execute Import</h4>
                  <p className="text-xs text-on-surface-variant">
                    Importing will save {importResult.acceptedCount} valid records and automatically run the Result Engine.
                  </p>
                </div>
                <button
                  onClick={handleExecuteImport}
                  disabled={isImporting}
                  className="bg-primary hover:bg-on-primary-fixed-variant text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  {isImporting ? 'Ingesting & Calculating...' : `Import ${importResult.acceptedCount} Valid Marks`}
                </button>
              </div>
            )}

            {/* Rejected Rows Table */}
            {importResult.rejectedRows && importResult.rejectedRows.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-fail/30 overflow-hidden">
                <div className="p-4 bg-fail/10 border-b border-fail/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-fail text-[20px]">cancel</span>
                  <h3 className="font-title-sm font-bold text-fail">
                    Rejected Rows ({importResult.rejectedRows.length}) — Rule Violations
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/20 bg-surface-container-low/70 text-label-caps text-on-surface-variant">
                        <th className="py-2.5 px-4 font-bold">CSV ROW</th>
                        <th className="py-2.5 px-4 font-bold">STUDENT ID</th>
                        <th className="py-2.5 px-4 font-bold">SUBJECT</th>
                        <th className="py-2.5 px-4 font-bold">REASON FOR REJECTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-mono">
                      {importResult.rejectedRows.map((r: any, idx: number) => (
                        <tr key={idx} className="bg-fail/5 hover:bg-fail/10">
                          <td className="py-2 px-4 font-bold text-fail">Row #{r.rowNumber}</td>
                          <td className="py-2 px-4 font-bold">{r.data?.Student_ID || r.data?.studentId || '--'}</td>
                          <td className="py-2 px-4">{r.data?.Subject_Code || r.data?.subjectCode || '--'}</td>
                          <td className="py-2 px-4 text-fail font-bold font-sans">{r.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Accepted Rows Table */}
            {importResult.acceptedRows && importResult.acceptedRows.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
                <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-pass text-[20px]">check_circle</span>
                  <h3 className="font-title-sm font-bold text-on-surface">
                    Validated & Accepted Rows ({importResult.acceptedRows.length})
                  </h3>
                </div>

                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/20 bg-surface-container-low/70 text-label-caps text-on-surface-variant sticky top-0 bg-surface-container-low">
                        <th className="py-2.5 px-4 font-bold">ROW</th>
                        <th className="py-2.5 px-4 font-bold">STUDENT ID</th>
                        <th className="py-2.5 px-4 font-bold">NAME</th>
                        <th className="py-2.5 px-4 font-bold">SUBJECT</th>
                        <th className="py-2.5 px-4 font-bold text-center">STATUS</th>
                        <th className="py-2.5 px-4 font-bold text-center">MARKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-mono">
                      {importResult.acceptedRows.slice(0, 50).map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-surface-container-low/50">
                          <td className="py-2 px-4 text-on-surface-variant">#{r.rowNumber}</td>
                          <td className="py-2 px-4 font-bold text-primary">{r.studentId}</td>
                          <td className="py-2 px-4 font-sans font-semibold">{r.studentName}</td>
                          <td className="py-2 px-4">{r.subjectName} ({r.subjectCode})</td>
                          <td className="py-2 px-4 text-center font-bold">
                            {r.status === 'AB' ? (
                              <span className="text-slate-600 bg-slate-200 px-2 py-0.5 rounded">AB</span>
                            ) : (
                              <span className="text-pass bg-pass/10 px-2 py-0.5 rounded">MARKED</span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center font-bold">
                            {r.status === 'AB' ? (
                              'AB'
                            ) : r.isPractical ? (
                              `Th: ${r.theory}, Pr: ${r.practical} (Tot: ${r.total})`
                            ) : (
                              `${r.mark}/100`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
