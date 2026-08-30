import { CalculatedSubjectResult, TraceStep } from './types.js';

export function buildStudentOverallTrace(params: {
  compulsorySubjects: CalculatedSubjectResult[];
  optionalSubject?: CalculatedSubjectResult;
  compulsoryGpTotal: number;
  optionalGradePoint: number;
  optionalBonus: number;
  rawGpa: number;
  uncancelledGpa: number;
  finalGpa: number;
  letterGrade: string;
  hasCompulsoryFailure: boolean;
  compulsoryFailures: string[];
}): TraceStep[] {
  const {
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
  } = params;

  const trace: TraceStep[] = [];

  // Step 1: Compulsory GP Summation
  const compulsoryBreakdown = compulsorySubjects
    .map((s) => `${s.subjectCode || s.subjectName}: ${s.gradePoint.toFixed(1)}`)
    .join(' + ');

  trace.push({
    type: 'TOTAL',
    label: 'Compulsory Grade Point Total',
    value: compulsoryGpTotal.toFixed(2),
    rule: `Sum of 6 compulsory subject GPs (${compulsoryBreakdown}) = ${compulsoryGpTotal.toFixed(2)}`,
    passed: !hasCompulsoryFailure,
    detail: `Total points accumulated from compulsory curriculum: ${compulsoryGpTotal.toFixed(2)}`
  });

  // Step 2: Optional Subject Bonus
  if (optionalSubject) {
    const optDesc = optionalSubject.isAbsent
      ? 'Optional subject is AB -> Bonus = 0.00'
      : `max(0, ${optionalGradePoint.toFixed(1)} - 2.0) = ${optionalBonus.toFixed(2)}`;

    trace.push({
      type: 'BONUS_CALCULATION',
      label: '4th (Optional) Subject Bonus',
      value: `+${optionalBonus.toFixed(2)}`,
      rule: `Optional 4th subject (${optionalSubject.subjectName}) GP = ${optionalGradePoint.toFixed(1)} -> Bonus rule: ${optDesc}`,
      passed: true,
      detail: `Optional bonus added to numerator without increasing divisor (Divisor remains 6).`
    });
  } else {
    trace.push({
      type: 'BONUS_CALCULATION',
      label: '4th (Optional) Subject Bonus',
      value: '+0.00',
      rule: 'No optional subject enrolled. Bonus = 0.00',
      passed: true
    });
  }

  // Step 3: Raw & Uncancelled GPA
  const formulaDesc = `(${compulsoryGpTotal.toFixed(2)} + ${optionalBonus.toFixed(2)}) / 6 = ${rawGpa.toFixed(4)}`;
  const capApplied = rawGpa > 5.0;

  trace.push({
    type: 'FINAL_GPA',
    label: 'Uncancelled GPA Calculation',
    value: uncancelledGpa.toFixed(2),
    rule: `Raw GPA = ${formulaDesc}. ${capApplied ? 'Capped at 5.00 maximum.' : 'Uncancelled GPA = ' + uncancelledGpa.toFixed(2)}`,
    passed: true,
    detail: `Calculated over fixed divisor of 6.`
  });

  // Step 4: Compulsory Failure Check & Final Override
  if (hasCompulsoryFailure) {
    trace.push({
      type: 'FAILURE_OVERRIDE',
      label: 'Compulsory Failure Override (R-13)',
      value: 'GPA 0.00 (F)',
      rule: `Compulsory failure in: ${compulsoryFailures.join(', ')} forces Final GPA = 0.00 and Letter Grade = F.`,
      passed: false,
      detail: `Academic override applied. Uncancelled GPA of ${uncancelledGpa.toFixed(2)} is overridden to 0.00 due to failed compulsory subject(s).`
    });
  } else {
    trace.push({
      type: 'FINAL_GPA',
      label: 'Final Result Validation',
      value: `GPA ${finalGpa.toFixed(2)} (${letterGrade})`,
      rule: `All 6 compulsory subjects passed. Final GPA = ${finalGpa.toFixed(2)}, Letter Grade = ${letterGrade}`,
      passed: true,
      detail: `Student successfully achieved academic standing ${letterGrade}.`
    });
  }

  return trace;
}
