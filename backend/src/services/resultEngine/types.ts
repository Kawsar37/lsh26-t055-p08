export type SubjectStatus = 'PASS' | 'FAIL' | 'ABSENT';
export type OverallResult = 'PASS' | 'FAIL';
export type MarkStatus = 'MARKED' | 'AB';

export interface RawSubjectMarkInput {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  isCompulsory: boolean;
  isPractical: boolean;
  status: MarkStatus;
  mark?: number; // 0-100 for normal subjects
  theory?: number; // 0-75 for practical subjects
  practical?: number; // 0-25 for practical subjects
}

export interface TraceStep {
  type: 'RANGE_CHECK' | 'THEORY_CHECK' | 'PRACTICAL_CHECK' | 'TOTAL' | 'GRADE_POINT' | 'ABSENT_CHECK' | 'BONUS_CALCULATION' | 'FINAL_GPA' | 'FAILURE_OVERRIDE';
  label: string;
  value: string | number;
  rule: string;
  passed: boolean;
  detail?: string;
}

export interface CalculatedSubjectResult {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  isCompulsory: boolean;
  isPractical: boolean;
  status: SubjectStatus;
  markStatus: MarkStatus;
  mark?: number;
  theory?: number;
  practical?: number;
  totalMark: number | 'AB';
  gradePoint: number;
  letterGrade: string;
  isFailed: boolean;
  isAbsent: boolean;
  isPracticalFail: boolean;
  traceSteps: TraceStep[];
  appliedRule: string;
}

export interface CheckingFlags {
  needsOptionalReview: boolean;
  needsPracticalReview: boolean;
  needsAbsentReview: boolean;
  isFlaggedForReview: boolean;
  reviewReasons: string[];
}

export interface StudentCalculationResult {
  studentId: string;
  calculationVersion: string;
  subjects: CalculatedSubjectResult[];
  compulsoryGpTotal: number;
  optionalGradePoint: number;
  optionalBonus: number;
  rawGpa: number;
  uncancelledGpa: number;
  finalGpa: number;
  letterGrade: string;
  overallResult: OverallResult;
  hasCompulsoryFailure: boolean;
  compulsoryFailures: string[];
  hasAbsent: boolean;
  hasPracticalFail: boolean;
  checkingFlags: CheckingFlags;
  overallTrace: TraceStep[];
  calculatedAt: string;
}
