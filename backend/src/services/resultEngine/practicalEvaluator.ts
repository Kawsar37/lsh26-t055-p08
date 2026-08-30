import { getGradePoint, getSubjectLetterGrade } from './gradePoint.js';
import { CalculatedSubjectResult, RawSubjectMarkInput, TraceStep } from './types.js';

/**
 * Evaluates practical subject marks according to Clarification R-11:
 * - Theory is out of 75 (Pass >= 25)
 * - Practical is out of 25 (Pass >= 8)
 * - Passes ONLY if BOTH conditions are met.
 * - If either fails: gradePoint = 0, status = FAIL.
 * - If both pass: total = theory + practical -> apply standard grade table.
 */
export function evaluatePracticalSubject(input: RawSubjectMarkInput): CalculatedSubjectResult {
  const theory = Number(input.theory ?? 0);
  const practical = Number(input.practical ?? 0);
  const total = theory + practical;
  const traceSteps: TraceStep[] = [];

  const theoryPassed = theory >= 25;
  traceSteps.push({
    type: 'THEORY_CHECK',
    label: 'Theory Component Check',
    value: `${theory}/75`,
    rule: 'Theory mark must be >= 25/75 to pass',
    passed: theoryPassed,
    detail: theoryPassed
      ? `Theory mark ${theory} satisfies pass threshold (>= 25)`
      : `Theory mark ${theory} is below passing threshold 25 (FAILED)`
  });

  const practicalPassed = practical >= 8;
  traceSteps.push({
    type: 'PRACTICAL_CHECK',
    label: 'Practical Component Check',
    value: `${practical}/25`,
    rule: 'Practical mark must be >= 8/25 to pass',
    passed: practicalPassed,
    detail: practicalPassed
      ? `Practical mark ${practical} satisfies pass threshold (>= 8)`
      : `Practical mark ${practical} is below passing threshold 8 (FAILED)`
  });

  const isPracticalFailFlag = practical < 8;

  if (!theoryPassed || !practicalPassed) {
    const failReasons: string[] = [];
    if (!theoryPassed) failReasons.push(`Theory ${theory} < 25`);
    if (!practicalPassed) failReasons.push(`Practical ${practical} < 8`);

    const appliedRule = `Practical subject failed component requirement (${failReasons.join(', ')}) -> Grade Point: 0.0, Status: FAIL`;
    traceSteps.push({
      type: 'GRADE_POINT',
      label: 'Component Failure Override',
      value: 0.0,
      rule: appliedRule,
      passed: false,
      detail: `Total marks ${total} (${theory} + ${practical}) overridden to 0.0 GP due to component failure.`
    });

    return {
      subjectId: input.subjectId,
      subjectCode: input.subjectCode,
      subjectName: input.subjectName,
      isCompulsory: input.isCompulsory,
      isPractical: true,
      status: 'FAIL',
      markStatus: 'MARKED',
      theory,
      practical,
      totalMark: total,
      gradePoint: 0.0,
      letterGrade: 'F',
      isFailed: true,
      isAbsent: false,
      isPracticalFail: isPracticalFailFlag,
      traceSteps,
      appliedRule
    };
  }

  // Both passed!
  const gradePoint = getGradePoint(total);
  const letterGrade = getSubjectLetterGrade(gradePoint);
  const isFailed = gradePoint === 0;

  traceSteps.push({
    type: 'TOTAL',
    label: 'Combined Marks Calculation',
    value: total,
    rule: `Theory (${theory}) + Practical (${practical}) = ${total}`,
    passed: true,
    detail: `Both components passed. Combined total is ${total}/100.`
  });

  const rangeDescription =
    total >= 80 ? '80 and above -> 5.0 (A+)'
    : total >= 70 ? '70–79 -> 4.0 (A)'
    : total >= 60 ? '60–69 -> 3.5 (A-)'
    : total >= 50 ? '50–59 -> 3.0 (B)'
    : total >= 40 ? '40–49 -> 2.0 (C)'
    : total >= 33 ? '33–39 -> 1.0 (D)'
    : 'Below 33 -> 0.0 (F)';

  const appliedRule = `Theory ${theory}/75 (>=25) & Practical ${practical}/25 (>=8) passed. Combined ${total} falls in ${rangeDescription}`;

  traceSteps.push({
    type: 'GRADE_POINT',
    label: 'Standard Grade Point Assignment',
    value: gradePoint,
    rule: appliedRule,
    passed: !isFailed,
    detail: `Assigned Grade Point ${gradePoint.toFixed(1)} (${letterGrade})`
  });

  return {
    subjectId: input.subjectId,
    subjectCode: input.subjectCode,
    subjectName: input.subjectName,
    isCompulsory: input.isCompulsory,
    isPractical: true,
    status: isFailed ? 'FAIL' : 'PASS',
    markStatus: 'MARKED',
    theory,
    practical,
    totalMark: total,
    gradePoint,
    letterGrade,
    isFailed,
    isAbsent: false,
    isPracticalFail: false,
    traceSteps,
    appliedRule
  };
}
