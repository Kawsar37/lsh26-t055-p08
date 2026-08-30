'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface SubjectEntry {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  isCompulsory: boolean;
  isPractical: boolean;
  status: 'MARKED' | 'AB';
  mark?: number;
  theory?: number;
  practical?: number;
}

interface EditMarksModalProps {
  studentId: string;
  studentName: string;
  initialSubjects: any[];
  caseId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedResult: any) => void;
}

export function EditMarksModal({
  studentId,
  studentName,
  initialSubjects,
  caseId = 'PUB-01',
  isOpen,
  onClose,
  onSuccess
}: EditMarksModalProps) {
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize state whenever modal opens or initialSubjects change
  useEffect(() => {
    if (isOpen && Array.isArray(initialSubjects)) {
      const mapped = initialSubjects.map((s) => {
        const isPrac = Boolean(s.isPractical);
        const isAbsent = s.status === 'AB' || s.markStatus === 'AB' || s.totalMark === 'AB';
        const theoryVal = s.theory !== undefined ? Number(s.theory) : 0;
        const practicalVal = s.practical !== undefined ? Number(s.practical) : 0;
        const markVal = s.mark !== undefined ? Number(s.mark) : !isAbsent && s.totalMark ? Number(s.totalMark) : 0;

        return {
          subjectId: s.subjectCode || s.subjectId?._id || s.subjectId,
          subjectCode: s.subjectCode || s.subjectId?.code || s.subjectId || '',
          subjectName: s.subjectName || s.subjectId?.name || s.subjectCode || '',
          isCompulsory: s.isCompulsory ?? true,
          isPractical: isPrac,
          status: (isAbsent ? 'AB' : 'MARKED') as 'MARKED' | 'AB',
          mark: markVal,
          theory: theoryVal,
          practical: practicalVal
        };
      });
      setSubjects(mapped);
      setErrorMsg(null);
    }
  }, [isOpen, initialSubjects]);

  if (!isOpen) return null;

  const handleStatusChange = (index: number, newStatus: 'MARKED' | 'AB') => {
    const next = [...subjects];
    next[index].status = newStatus;
    setSubjects(next);
  };

  const handleMarkChange = (index: number, field: 'mark' | 'theory' | 'practical', value: string) => {
    const next = [...subjects];
    const num = value === '' ? 0 : Number(value);
    next[index][field] = num;
    setSubjects(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Validate bounds before submitting
      for (const s of subjects) {
        if (s.status === 'MARKED') {
          if (s.isPractical) {
            if ((s.theory ?? 0) < 0 || (s.theory ?? 0) > 75) {
              throw new Error(`Theory mark for ${s.subjectName} must be between 0 and 75.`);
            }
            if ((s.practical ?? 0) < 0 || (s.practical ?? 0) > 25) {
              throw new Error(`Practical mark for ${s.subjectName} must be between 0 and 25.`);
            }
          } else {
            if ((s.mark ?? 0) < 0 || (s.mark ?? 0) > 100) {
              throw new Error(`Mark for ${s.subjectName} must be between 0 and 100.`);
            }
          }
        }
      }

      // Format payload for backend
      const payload = subjects.map((s) => ({
        subjectCode: s.subjectCode,
        status: s.status,
        isPractical: s.isPractical,
        mark: s.isPractical ? undefined : Number(s.mark ?? 0),
        theory: s.isPractical ? Number(s.theory ?? 0) : undefined,
        practical: s.isPractical ? Number(s.practical ?? 0) : undefined
      }));

      const res = await api.updateStudentMarks(studentId, payload, caseId);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error('Error updating student marks:', err);
      setErrorMsg(err.message || 'Failed to update marks');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[22px]">edit_note</span>
            </div>
            <div>
              <h3 className="font-title-sm font-bold text-on-surface">Edit Student Marks & Recalculate</h3>
              <p className="text-xs text-on-surface-variant">
                Student: {studentName} ({studentId}) • Dataset: <strong className="text-primary">{caseId}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-fail/10 border border-fail/30 rounded-lg text-fail text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {subjects.map((sub, idx) => (
              <div
                key={sub.subjectCode || idx}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="w-48">
                  <span className="font-semibold text-xs text-on-surface block truncate">
                    {sub.subjectName}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {sub.isCompulsory ? 'Compulsory' : 'Optional (4th)'} {sub.isPractical ? '• Practical' : ''} ({sub.subjectCode})
                  </span>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-1 bg-surface-container-highest p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(idx, 'MARKED')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      sub.status === 'MARKED'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Marked
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(idx, 'AB')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      sub.status === 'AB'
                        ? 'bg-fail text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    AB
                  </button>
                </div>

                {/* Mark Input Fields */}
                <div className="flex items-center gap-3">
                  {sub.status === 'AB' ? (
                    <div className="text-xs font-bold text-fail bg-fail/10 px-4 py-1.5 rounded-lg border border-fail/20">
                      Absent (0.0 GP)
                    </div>
                  ) : sub.isPractical ? (
                    <div className="flex items-center gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-on-surface-variant uppercase font-bold block">
                          Theory (/75)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="75"
                          value={sub.theory ?? ''}
                          onChange={(e) => handleMarkChange(idx, 'theory', e.target.value)}
                          className="w-16 px-2 py-1 bg-surface-container border border-outline-variant/40 rounded-md text-xs font-mono font-bold text-on-surface text-center outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-on-surface-variant uppercase font-bold block">
                          Practical (/25)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sub.practical ?? ''}
                          onChange={(e) => handleMarkChange(idx, 'practical', e.target.value)}
                          className="w-16 px-2 py-1 bg-surface-container border border-outline-variant/40 rounded-md text-xs font-mono font-bold text-on-surface text-center outline-none focus:border-primary"
                        />
                      </div>

                      <div className="pt-3 font-mono font-bold text-xs text-primary">
                        = {(Number(sub.theory ?? 0) + Number(sub.practical ?? 0))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <label className="text-[10px] text-on-surface-variant uppercase font-bold block">
                        Mark (/100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.mark ?? ''}
                        onChange={(e) => handleMarkChange(idx, 'mark', e.target.value)}
                        className="w-20 px-2 py-1 bg-surface-container border border-outline-variant/40 rounded-md text-xs font-mono font-bold text-on-surface text-center outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-primary hover:bg-on-primary-fixed-variant text-white rounded-lg transition-colors shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              {isSubmitting ? 'Saving & Recalculating...' : 'Save & Recalculate Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
