import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendancePercentage,
  isAttendanceWarningNeeded,
  getWarningSeverity,
  calculateClassesNeededForTarget,
  calculateMissableClasses,
  computeAttendanceStats,
  calculateGradeAndGpa,
} from './attendanceLogic';

test('calculateAttendancePercentage handles normal, boundary, and edge values', () => {
  assert.equal(calculateAttendancePercentage(80, 100), 80.0);
  assert.equal(calculateAttendancePercentage(85, 100), 85.0);
  assert.equal(calculateAttendancePercentage(42, 50), 84.0);
  assert.equal(calculateAttendancePercentage(0, 50), 0.0);
  assert.equal(calculateAttendancePercentage(50, 50), 100.0);
  assert.equal(calculateAttendancePercentage(0, 0), 100.0);
  // Rounding test (84.615... => 84.6)
  assert.equal(calculateAttendancePercentage(11, 13), 84.6);
});

test('isAttendanceWarningNeeded correctly triggers when attendance is less than 85%', () => {
  assert.equal(isAttendanceWarningNeeded(84.9), true);
  assert.equal(isAttendanceWarningNeeded(84.0), true);
  assert.equal(isAttendanceWarningNeeded(72.5), true);
  assert.equal(isAttendanceWarningNeeded(85.0), false);
  assert.equal(isAttendanceWarningNeeded(85.1), false);
  assert.equal(isAttendanceWarningNeeded(95.0), false);
});

test('getWarningSeverity classifies students into appropriate tiers', () => {
  assert.equal(getWarningSeverity(90.0), 'NONE');
  assert.equal(getWarningSeverity(85.0), 'NONE');
  assert.equal(getWarningSeverity(84.9), 'LEVEL_1_CAUTION');
  assert.equal(getWarningSeverity(75.0), 'LEVEL_1_CAUTION');
  assert.equal(getWarningSeverity(74.9), 'LEVEL_2_SERIOUS');
  assert.equal(getWarningSeverity(65.0), 'LEVEL_2_SERIOUS');
  assert.equal(getWarningSeverity(64.9), 'LEVEL_3_CRITICAL');
  assert.equal(getWarningSeverity(40.0), 'LEVEL_3_CRITICAL');
});

test('calculateClassesNeededForTarget returns exact consecutive classes to reach 85%', () => {
  // If student has 40 out of 50 (80%), to reach 85%:
  // (40 + x) / (50 + x) >= 0.85 => 40 + x >= 42.5 + 0.85x => 0.15x >= 2.5 => x >= 16.666 => 17 classes
  const needed = calculateClassesNeededForTarget(40, 50, 85);
  assert.equal(needed, 17);
  // Verify with formula: (40 + 17) / (50 + 17) = 57 / 67 = 85.07% >= 85%
  assert.ok((57 / 67) * 100 >= 85);

  // If already at or above 85%, needed is 0
  assert.equal(calculateClassesNeededForTarget(85, 100, 85), 0);
  assert.equal(calculateClassesNeededForTarget(90, 100, 85), 0);
});

test('calculateMissableClasses returns safe margin before dipping under 85%', () => {
  // 90 attended out of 100 classes (90%)
  // 90 / (100 + m) >= 0.85 => 100 + m <= 105.88 => m <= 5
  assert.equal(calculateMissableClasses(90, 100, 85), 5);
  // If already at 84%, missable should be 0
  assert.equal(calculateMissableClasses(84, 100, 85), 0);
});

test('computeAttendanceStats aggregates comprehensive report', () => {
  const statsDeficient = computeAttendanceStats(41, 50, 85);
  assert.equal(statsDeficient.percentage, 82.0);
  assert.equal(statsDeficient.status, 'WARNING_LVL1');
  assert.ok(statsDeficient.classesNeededFor85 > 0);

  const statsSafe = computeAttendanceStats(48, 50, 85);
  assert.equal(statsSafe.percentage, 96.0);
  assert.equal(statsSafe.status, 'SAFE');
  assert.equal(statsSafe.classesNeededFor85, 0);
  assert.ok(statsSafe.missableClassesBeforeWarning > 0);
});

test('calculateGradeAndGpa maps scores correctly', () => {
  assert.deepEqual(calculateGradeAndGpa(95), { grade: 'A+', gpa: 4.0, standing: 'Honors' });
  assert.deepEqual(calculateGradeAndGpa(82), { grade: 'A-', gpa: 3.6, standing: 'Passed' });
  assert.deepEqual(calculateGradeAndGpa(62), { grade: 'C', gpa: 2.0, standing: 'Probation' });
  assert.deepEqual(calculateGradeAndGpa(45), { grade: 'F', gpa: 0.0, standing: 'Failed' });
});
