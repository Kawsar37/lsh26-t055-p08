/**
 * Converts Final GPA to Letter Grade:
 * 5.00      -> A+
 * 4.00–4.99 -> A
 * 3.50–3.99 -> A-
 * 3.00–3.49 -> B
 * 2.00–2.99 -> C
 * 1.00–1.99 -> D
 * Fail      -> F
 */
export function getFinalLetterGrade(finalGpa: number, isOverallFailed: boolean): string {
  if (isOverallFailed || finalGpa < 1.0) {
    return 'F';
  }
  // To avoid floating point precision issues (e.g., 4.999999)
  const gpa = Number(finalGpa.toFixed(2));
  if (gpa >= 5.0) return 'A+';
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.0) return 'D';
  return 'F';
}
