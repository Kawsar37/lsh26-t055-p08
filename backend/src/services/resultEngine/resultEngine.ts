import { getGradePoint, getSubjectLetterGrade } from './gradePoint.js';
import { evaluatePracticalSubject } from './practicalEvaluator.js';
import { evaluateAbsentSubject } from './absentEvaluator.js';
import { calculateOptionalBonus } from './optionalCalculator.js';
import { getFinalLetterGrade } from './letterGrade.js';
import { evaluateCheckingFlags } from './checkingList.js';
import { buildStudentOverallTrace } from './traceBuilder.js';
import {
  CalculatedSubjectResult,
  RawSubjectMarkInput,
  StudentCalculationResult,
  TraceStep
} from './types.js';

export const CALCULATION_VERSION = 'P08-v1';

/**
 * Pure deterministic evaluation of an individual subject mark input.
 */
export function evaluateSubjectMark(input: RawSubjectMarkInput): CalculatedSubjectResult {
  // 1. Check for Absent (AB)
  if (input.status === 'AB') {
    return evaluateAbsentSubject(input);
  }

  // 2. Practical Subject
  if (input.isPractical) {
    return evaluatePracticalSubject(input);
  }

  // 3. Normal (Theory only) Subject
  const mark = Number(input.mark ?? 0);
  const gradePoint = getGradePoint(mark);
  const letterGrade = getSubjectLetterGrade(gradePoint);
  const isFailed = gradePoint === 0;
  const traceSteps: TraceStep[] = [];

  const rangeDescription =
    mark >= 80 ? '80 and above -> 5.0 (A+)'
    : mark >= 70 ? '70–79 -> 4.0 (A)'
    : mark >= 60 ? '60–69 -> 3.5 (A-)'
    : mark >= 50 ? '50–59 -> 3.0 (B)'
    : mark >= 40 ? '40–49 -> 2.0 (C)'
    : mark >= 33 ? '33–39 -> 1.0 (D)'
    : 'Below 33 -> 0.0 (F)';

  const appliedRule = `Mark ${mark}/100 falls within ${rangeDescription}`;

  traceSteps.push({
    type: 'GRADE_POINT',
    label: 'Standard Grade Point Assignment',
    value: gradePoint,
    rule: appliedRule,
    passed: !isFailed,
    detail: isFailed
      ? `Mark ${mark} is below the 33-point threshold (FAIL)`
      : `Awarded Grade Point ${gradePoint.toFixed(1)} (${letterGrade})`
  });

  return {
    subjectId: input.subjectId,
    subjectCode: input.subjectCode,
    subjectName: input.subjectName,
    isCompulsory: input.isCompulsory,
    isPractical: false,
    status: isFailed ? 'FAIL' : 'PASS',
    markStatus: 'MARKED',
    mark,
    totalMark: mark,
    gradePoint,
    letterGrade,
    isFailed,
    isAbsent: false,
    isPracticalFail: false,
    traceSteps,
    appliedRule
  };
}

/**
 * Pure deterministic calculation engine for a student's full result.
 * Receives raw inputs, applies all Competition rules, and returns a fully structured result snapshot.
 */
export function calculateStudentResult(
  studentId: string,
  subjectInputs: RawSubjectMarkInput[]
): StudentCalculationResult {
  const evaluatedSubjects = subjectInputs.map((input) => evaluateSubjectMark(input));

  const compulsorySubjects = evaluatedSubjects.filter((s) => s.isCompulsory);
  const optionalSubjects = evaluatedSubjects.filter((s) => !s.isCompulsory);
  const optionalSubject = optionalSubjects[0]; // Exactly 1 optional 4th subject

  // 1. Calculate compulsory GP Total
  const compulsoryGpTotal = Number(
    compulsorySubjects.reduce((sum, s) => sum + s.gradePoint, 0).toFixed(2)
  );

  // 2. Identify compulsory failures & absences
  const failedCompulsorySubjects = compulsorySubjects.filter((s) => s.isFailed || s.isAbsent);
  const hasCompulsoryFailure = failedCompulsorySubjects.length > 0;
  const compulsoryFailures = failedCompulsorySubjects.map((s) => s.subjectName);

  // 3. Optional Subject Bonus (max(0, optionalGP - 2))
  const optionalGradePoint = optionalSubject ? optionalSubject.gradePoint : 0.0;
  const optionalBonus = optionalSubject ? calculateOptionalBonus(optionalGradePoint) : 0.0;

  // 4. Raw & Uncancelled GPA (Divisor is ALWAYS 6)
  const rawGpa = (compulsoryGpTotal + optionalBonus) / 6;
  const uncancelledGpa = Number(Math.min(rawGpa, 5.0).toFixed(2));

  // 5. Final GPA & Compulsory Failure Override
  let finalGpa = 0.0;
  let letterGrade = 'F';
  let overallResult: 'PASS' | 'FAIL' = 'FAIL';

  if (hasCompulsoryFailure) {
    finalGpa = 0.0;
    letterGrade = 'F';
    overallResult = 'FAIL';
  } else {
    finalGpa = uncancelledGpa;
    letterGrade = getFinalLetterGrade(finalGpa, false);
    overallResult = finalGpa >= 1.0 ? 'PASS' : 'FAIL';
  }

  // 6. Flags for checking lists
  const hasAbsent = evaluatedSubjects.some((s) => s.isAbsent);
  const hasPracticalFail = evaluatedSubjects.some((s) => s.isPracticalFail);
  const checkingFlags = evaluateCheckingFlags(evaluatedSubjects, optionalGradePoint, optionalSubject);

  // 7. Structured Overall Audit Trace
  const overallTrace = buildStudentOverallTrace({
    compulsorySubjects,
    optionalSubject,
    compulsoryGpTotal,
    optionalGradePoint,
    optionalBonus,
    rawGpa,
    uncancelledGpa,
    finalGpa,
    letterGrade,
    hasCompulsoryFailure,
    compulsoryFailures
  });

  return {
    studentId,
    calculationVersion: CALCULATION_VERSION,
    subjects: evaluatedSubjects,
    compulsoryGpTotal,
    optionalGradePoint,
    optionalBonus,
    rawGpa: Number(rawGpa.toFixed(4)),
    uncancelledGpa,
    finalGpa,
    letterGrade,
    overallResult,
    hasCompulsoryFailure,
    compulsoryFailures,
    hasAbsent,
    hasPracticalFail,
    checkingFlags,
    overallTrace,
    calculatedAt: new Date().toISOString()
  };
}
