/**
 * Pure calculation and business logic for college attendance, grading,
 * and automated 85% warning notice generation.
 */

export interface AttendanceStats {
  attended: number;
  total: number;
  percentage: number;
  status: 'SAFE' | 'WARNING_LVL1' | 'WARNING_LVL2' | 'CRITICAL';
  classesNeededFor85: number;
  missableClassesBeforeWarning: number;
}

export type WarningSeverity = 'NONE' | 'LEVEL_1_CAUTION' | 'LEVEL_2_SERIOUS' | 'LEVEL_3_CRITICAL';

export const ATTENDANCE_THRESHOLD_PERCENT = 85.0;

/**
 * Calculates attendance percentage rounded to 1 decimal place.
 */
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 100.0;
  if (attended < 0) return 0.0;
  if (attended >= total) return 100.0;
  const pct = (attended / total) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Checks if a student's attendance falls below the mandatory 85% requirement.
 */
export function isAttendanceWarningNeeded(
  percentage: number,
  threshold: number = ATTENDANCE_THRESHOLD_PERCENT
): boolean {
  return percentage < threshold;
}

/**
 * Determines warning severity tier:
 * - >= 85%: NONE
 * - 75% to 84.9%: LEVEL_1_CAUTION (< 85% compliance warning)
 * - 65% to 74.9%: LEVEL_2_SERIOUS (Debarment warning & parent notification)
 * - < 65%: LEVEL_3_CRITICAL (Exam barring & Dean disciplinary hearing)
 */
export function getWarningSeverity(percentage: number): WarningSeverity {
  if (percentage >= 85.0) return 'NONE';
  if (percentage >= 75.0) return 'LEVEL_1_CAUTION';
  if (percentage >= 65.0) return 'LEVEL_2_SERIOUS';
  return 'LEVEL_3_CRITICAL';
}

/**
 * Calculates consecutive upcoming classes a student must attend to bring their
 * attendance up to targetThreshold (default 85%).
 * Formula:
 * (attended + x) / (total + x) >= target / 100
 * attended + x >= (target/100) * total + (target/100) * x
 * x * (1 - target/100) >= (target/100) * total - attended
 * x >= (0.85 * total - attended) / 0.15
 */
export function calculateClassesNeededForTarget(
  attended: number,
  total: number,
  targetThreshold: number = ATTENDANCE_THRESHOLD_PERCENT
): number {
  if (total <= 0) return 0;
  const currentPct = (attended / total) * 100;
  if (currentPct >= targetThreshold) return 0;

  const targetRatio = targetThreshold / 100;
  const numerator = targetRatio * total - attended;
  const denominator = 1 - targetRatio;

  if (denominator <= 0) return 0;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

/**
 * Calculates how many subsequent classes a safe student can miss before
 * their attendance drops strictly below the target threshold.
 */
export function calculateMissableClasses(
  attended: number,
  total: number,
  targetThreshold: number = ATTENDANCE_THRESHOLD_PERCENT
): number {
  if (total <= 0) return 0;
  const currentPct = (attended / total) * 100;
  if (currentPct < targetThreshold) return 0;

  const targetRatio = targetThreshold / 100;
  // attended / (total + m) >= targetRatio => total + m <= attended / targetRatio
  // m <= attended / targetRatio - total
  const maxTotalAllowed = attended / targetRatio;
  const missable = Math.floor(maxTotalAllowed - total);
  return Math.max(0, missable);
}

/**
 * Computes comprehensive attendance statistics for a student in a course or overall.
 */
export function computeAttendanceStats(
  attended: number,
  total: number,
  threshold: number = ATTENDANCE_THRESHOLD_PERCENT
): AttendanceStats {
  const percentage = calculateAttendancePercentage(attended, total);
  const classesNeededFor85 = calculateClassesNeededForTarget(attended, total, threshold);
  const missableClassesBeforeWarning = calculateMissableClasses(attended, total, threshold);

  let status: AttendanceStats['status'] = 'SAFE';
  if (percentage < 65.0) {
    status = 'CRITICAL';
  } else if (percentage < 75.0) {
    status = 'WARNING_LVL2';
  } else if (percentage < threshold) {
    status = 'WARNING_LVL1';
  }

  return {
    attended,
    total,
    percentage,
    status,
    classesNeededFor85,
    missableClassesBeforeWarning,
  };
}

/**
 * Formats academic grade based on total score (out of 100).
 */
export function calculateGradeAndGpa(totalScore: number): { grade: string; gpa: number; standing: 'Passed' | 'Honors' | 'Probation' | 'Failed' } {
  if (totalScore >= 90) return { grade: 'A+', gpa: 4.0, standing: 'Honors' };
  if (totalScore >= 85) return { grade: 'A', gpa: 3.8, standing: 'Passed' };
  if (totalScore >= 80) return { grade: 'A-', gpa: 3.6, standing: 'Passed' };
  if (totalScore >= 75) return { grade: 'B+', gpa: 3.3, standing: 'Passed' };
  if (totalScore >= 70) return { grade: 'B', gpa: 3.0, standing: 'Passed' };
  if (totalScore >= 65) return { grade: 'C+', gpa: 2.5, standing: 'Passed' };
  if (totalScore >= 60) return { grade: 'C', gpa: 2.0, standing: 'Probation' };
  if (totalScore >= 50) return { grade: 'D', gpa: 1.0, standing: 'Probation' };
  return { grade: 'F', gpa: 0.0, standing: 'Failed' };
}
