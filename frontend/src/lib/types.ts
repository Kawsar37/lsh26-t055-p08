export type SubjectStatus = 'PASS' | 'FAIL' | 'ABSENT';
export type OverallResult = 'PASS' | 'FAIL';
export type MarkStatus = 'MARKED' | 'AB';

export interface TraceStep {
  type: string;
  label: string;
  value: string | number;
  rule: string;
  passed: boolean;
  detail?: string;
}

export interface CalculatedSubjectResult {
  subjectCode: string;
  subjectName: string;
  isCompulsory: boolean;
  isPractical: boolean;
  status: SubjectStatus;
  markStatus: MarkStatus;
  mark?: number;
  theory?: number;
  practical?: number;
  totalMark: number | string;
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

export interface ResultData {
  _id: string;
  caseId: string;
  studentId: string;
  studentName: string;
  className: string;
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

export interface StudentItem {
  _id: string;
  caseId: string;
  studentId: string;
  name: string;
  className: string;
  rollNumber: number;
  optionalSubjectCode: string;
  avatarUrl?: string;
  result?: ResultData | null;
}

export interface CaseItem {
  caseId: string;
  totalStudents: number;
  passRate: number;
  passed?: number;
  failed?: number;
  averageGpa?: number;
}

export interface DashboardStats {
  caseId: string;
  availableCases: CaseItem[];
  totalStudents: number;
  passed: number;
  failed: number;
  passRate: number;
  needsReview: number;
  gradeDistribution: Record<string, number>;
  classComparative: Array<{
    className: string;
    total: number;
    passed: number;
    failed: number;
  }>;
  recentAudit: Array<{
    resultId: string;
    caseId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    className: string;
    finalGpa: number;
    uncancelledGpa: number;
    letterGrade: string;
    overallResult: OverallResult;
    isFlaggedForReview: boolean;
    hasCompulsoryFailure: boolean;
    calculatedAt: string;
  }>;
}

export interface CheckingListItem {
  resultId: string;
  caseId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  subjectName: string;
  subjectCode: string;
  problematicValue: string;
  finalGpa: number;
  letterGrade: string;
  overallResult: OverallResult;
  reason: string;
}

export interface ClassSummaryData {
  className: string;
  totalStudents: number;
  passed: number;
  failed: number;
  passRate: number;
  averageGpa: number;
  needsReview: number;
  gradeDistribution: Record<string, number>;
  subjectFailures: Array<{
    subjectName: string;
    subjectCode: string;
    failCount: number;
  }>;
}
