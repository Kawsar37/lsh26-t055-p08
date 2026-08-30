/**
 * Centralized Grade Point Calculator
 * Exact Grading Rules:
 * 80 and above -> 5.0
 * 70 - 79      -> 4.0
 * 60 - 69      -> 3.5
 * 50 - 59      -> 3.0
 * 40 - 49      -> 2.0
 * 33 - 39      -> 1.0
 * Below 33     -> 0.0 and FAIL
 */
export function getGradePoint(mark: number): number {
  if (typeof mark !== 'number' || isNaN(mark)) {
    return 0.0;
  }
  if (mark >= 80) return 5.0;
  if (mark >= 70) return 4.0;
  if (mark >= 60) return 3.5;
  if (mark >= 50) return 3.0;
  if (mark >= 40) return 2.0;
  if (mark >= 33) return 1.0;
  return 0.0;
}

export function getSubjectLetterGrade(gradePoint: number): string {
  if (gradePoint >= 5.0) return 'A+';
  if (gradePoint >= 4.0) return 'A';
  if (gradePoint >= 3.5) return 'A-';
  if (gradePoint >= 3.0) return 'B';
  if (gradePoint >= 2.0) return 'C';
  if (gradePoint >= 1.0) return 'D';
  return 'F';
}
