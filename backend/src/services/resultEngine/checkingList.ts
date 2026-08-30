import { CalculatedSubjectResult, CheckingFlags } from './types.js';

/**
 * Computes Checking List flags for a student:
 * 1. Optional Checking List: optional GP <= 2.0 (includes optional AB).
 * 2. Practical Fail Checking List: ANY practical component < 8 (compulsory or optional).
 * 3. Absent Checking List: AB in ANY subject (compulsory or optional).
 */
export function evaluateCheckingFlags(
  subjects: CalculatedSubjectResult[],
  optionalGradePoint: number,
  optionalSubject?: CalculatedSubjectResult
): CheckingFlags {
  const reviewReasons: string[] = [];

  // 1. Optional Review Check (GP <= 2.0 or Optional AB)
  const isOptionalAbsent = optionalSubject ? optionalSubject.isAbsent : false;
  const needsOptionalReview = optionalSubject !== undefined && (optionalGradePoint <= 2.0 || isOptionalAbsent);
  if (needsOptionalReview) {
    const detail = isOptionalAbsent
      ? 'Optional subject is marked ABSENT (AB)'
      : `Optional Grade Point is ${optionalGradePoint.toFixed(1)} (<= 2.0 threshold)`;
    reviewReasons.push(`Optional Review: ${detail}`);
  }

  // 2. Practical Fail Check (any practical mark < 8)
  const practicalFailSubjects = subjects.filter(
    (s) => s.isPractical && s.markStatus === 'MARKED' && s.practical !== undefined && s.practical < 8
  );
  const needsPracticalReview = practicalFailSubjects.length > 0;
  if (needsPracticalReview) {
    const list = practicalFailSubjects.map((s) => `${s.subjectName} (${s.practical}/25)`).join(', ');
    reviewReasons.push(`Practical Component Fail: ${list}`);
  }

  // 3. Absent Check (AB anywhere)
  const absentSubjects = subjects.filter((s) => s.isAbsent);
  const needsAbsentReview = absentSubjects.length > 0;
  if (needsAbsentReview) {
    const list = absentSubjects.map((s) => `${s.subjectName} (${s.isCompulsory ? 'Compulsory' : 'Optional'})`).join(', ');
    reviewReasons.push(`Absent in: ${list}`);
  }

  const isFlaggedForReview = needsOptionalReview || needsPracticalReview || needsAbsentReview;

  return {
    needsOptionalReview,
    needsPracticalReview,
    needsAbsentReview,
    isFlaggedForReview,
    reviewReasons
  };
}
