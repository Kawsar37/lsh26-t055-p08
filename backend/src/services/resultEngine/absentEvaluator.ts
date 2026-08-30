import { CalculatedSubjectResult, RawSubjectMarkInput, TraceStep } from './types.js';

/**
 * Evaluates Absent (AB) marks according to Clarification R-12:
 * - AB is distinct from numeric zero.
 * - Compulsory subject AB: gradePoint = 0, status = ABSENT, forces overall result = F.
 * - Optional subject AB: gradePoint = 0, bonus = 0, does NOT automatically fail overall,
 *   but triggers optional review and absent review checking lists.
 */
export function evaluateAbsentSubject(input: RawSubjectMarkInput): CalculatedSubjectResult {
  const traceSteps: TraceStep[] = [];
  const isCompulsory = input.isCompulsory;

  const appliedRule = isCompulsory
    ? `Student marked ABSENT (AB) in compulsory subject ${input.subjectName} -> Grade Point: 0.0, Subject Status: ABSENT. Compulsory absence forces overall result to F.`
    : `Student marked ABSENT (AB) in optional subject ${input.subjectName} -> Grade Point: 0.0, Optional Bonus: 0.0. Flagged for Optional & Absent Checking Lists.`;

  traceSteps.push({
    type: 'ABSENT_CHECK',
    label: isCompulsory ? 'Compulsory Subject Absence' : 'Optional Subject Absence',
    value: 'AB',
    rule: appliedRule,
    passed: false,
    detail: `Status recorded as AB. Numeric zero is not substituted.`
  });

  traceSteps.push({
    type: 'GRADE_POINT',
    label: 'Grade Point Assignment for Absentee',
    value: 0.0,
    rule: 'Absent status yields 0.0 Grade Point',
    passed: false,
    detail: 'Grade Point: 0.0 (F)'
  });

  return {
    subjectId: input.subjectId,
    subjectCode: input.subjectCode,
    subjectName: input.subjectName,
    isCompulsory: input.isCompulsory,
    isPractical: input.isPractical,
    status: 'ABSENT',
    markStatus: 'AB',
    totalMark: 'AB',
    gradePoint: 0.0,
    letterGrade: 'F',
    isFailed: true,
    isAbsent: true,
    isPracticalFail: false,
    traceSteps,
    appliedRule
  };
}
