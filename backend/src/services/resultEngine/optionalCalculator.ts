/**
 * Calculates Optional (4th) Subject Bonus according to Clarification R-13:
 * Bonus = max(0, optionalGradePoint - 2)
 *
 * Examples:
 * GP 5.0 -> bonus 3.0
 * GP 4.0 -> bonus 2.0
 * GP 3.5 -> bonus 1.5
 * GP 3.0 -> bonus 1.0
 * GP 2.0 -> bonus 0.0
 * GP 1.0 -> bonus 0.0
 * GP 0.0 / AB -> bonus 0.0
 */
export function calculateOptionalBonus(optionalGradePoint: number): number {
  if (typeof optionalGradePoint !== 'number' || isNaN(optionalGradePoint) || optionalGradePoint <= 2.0) {
    return 0.0;
  }
  const bonus = optionalGradePoint - 2.0;
  return Math.max(0.0, Number(bonus.toFixed(2)));
}
