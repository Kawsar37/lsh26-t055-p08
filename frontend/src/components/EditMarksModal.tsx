'use client';

import React, { useState } from 'react';
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
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedResult: any) => void;
}

export function EditMarksModal({
  studentId,
  studentName,
  initialSubjects,
  isOpen,
  onClose,
  onSuccess
}: EditMarksModalProps) {
  const [subjects, setSubjects] = useState<SubjectEntry[]>(() =>
    initialSubjects.map((s) => ({
      subjectId: s.subjectId?._id || s.subjectId,
      subjectCode: s.subjectCode || s.subjectId?.code || '',
      subjectName: s.subjectName || s.subjectId?.name || '',
      isCompulsory: s.isCompulsory ?? true,
      isPractical: s.isPractical ?? false,
      status: s.status === 'AB' || s.markStatus === 'AB' ? 'AB' : 'MARKED',
      mark: s.mark !== undefined ? s.mark : s.totalMark !== 'AB' ? Number(s.totalMark) : 0,
      theory: s.theory !== undefined ? s.theory : 0,
      practical: s.practical !== undefined ? s.practical : 0
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

      const res = await api.updateStudentMarks(studentId, subjects);
      onSuccess(res);
      onClose();
    } catch (err: any) {
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
              <p className="text-xs text-on-surface-variant">Student: {studentName} ({studentId})</p>
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
                key={sub.subjectId || idx}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="w-48">
                  <span className="font-semibold text-xs text-on-surface block truncate">
                    {sub.subjectName}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {sub.isCompulsory ? 'Compulsory' : 'Optional (4th)'} {sub.isPractical ? '• Practical' : ''}
                  </span>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-1 bg-surface-container-highest p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(idx, 'MARKED')}
                    className={`px-2 py-1 rounded-md transition-colors ${
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
                    className={`px-2 py-1 rounded-md transition-colors ${
                      sub.status === 'AB'
                        ? 'bg-fail text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    AB
                  </button>
                </div>

                {/* Mark Inputs */}
                {sub.status === 'MARKED' ? (
                  sub.isPractical ? (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <label className="text-[9px] text-on-surface-variant font-bold uppercase">
                          Theory (/75)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="75"
                          value={sub.theory ?? 0}
                          onChange={(e) => handleMarkChange(idx, 'theory', e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-outline-variant/40 rounded text-xs font-mono font-bold focus:border-primary outline-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] text-on-surface-variant font-bold uppercase">
                          Practical (/25)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sub.practical ?? 0}
                          onChange={(e) => handleMarkChange(idx, 'practical', e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-outline-variant/40 rounded text-xs font-mono font-bold focus:border-primary outline-none"
                        />
                      </div>
                      <div className="text-xs font-mono font-bold text-primary pl-1">
                        = {(sub.theory ?? 0) + (sub.practical ?? 0)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <label className="text-[9px] text-on-surface-variant font-bold uppercase">
                        Mark (/100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.mark ?? 0}
                        onChange={(e) => handleMarkChange(idx, 'mark', e.target.value)}
                        className="w-20 px-2 py-1 bg-white border border-outline-variant/40 rounded text-xs font-mono font-bold focus:border-primary outline-none"
                      />
                    </div>
                  )
                ) : (
                  <div className="text-xs font-bold text-fail bg-fail/10 px-3 py-1.5 rounded-lg">
                    Absent (0 GP)
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-on-primary-fixed-variant text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              {isSubmitting ? 'Recalculating...' : 'Save & Recalculate Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
