import { describe, it, expect } from 'vitest';
import { getGradePoint, getSubjectLetterGrade } from '../gradePoint.js';
import { evaluatePracticalSubject } from '../practicalEvaluator.js';
import { calculateOptionalBonus } from '../optionalCalculator.js';
import { getFinalLetterGrade } from '../letterGrade.js';
import { calculateStudentResult } from '../resultEngine.js';
import { RawSubjectMarkInput } from '../types.js';

describe('Result Engine — Grade Point Boundary Tests', () => {
  it('correctly maps normal marks to grade points', () => {
    expect(getGradePoint(0)).toBe(0.0);
    expect(getGradePoint(32)).toBe(0.0);
    expect(getGradePoint(33)).toBe(1.0);
    expect(getGradePoint(39)).toBe(1.0);
    expect(getGradePoint(40)).toBe(2.0);
    expect(getGradePoint(49)).toBe(2.0);
    expect(getGradePoint(50)).toBe(3.0);
    expect(getGradePoint(59)).toBe(3.0);
    expect(getGradePoint(60)).toBe(3.5);
    expect(getGradePoint(69)).toBe(3.5);
    expect(getGradePoint(70)).toBe(4.0);
    expect(getGradePoint(79)).toBe(4.0);
    expect(getGradePoint(80)).toBe(5.0);
    expect(getGradePoint(100)).toBe(5.0);
  });
});

describe('Result Engine — Practical Subject Rules (R-11)', () => {
  it('Theory 24, Practical 8 fails because Theory < 25', () => {
    const input: RawSubjectMarkInput = {
      subjectId: 'sub-physics',
      subjectCode: '174',
      subjectName: 'Physics',
      isCompulsory: true,
      isPractical: true,
      status: 'MARKED',
      theory: 24,
      practical: 8
    };
    const res = evaluatePracticalSubject(input);
    expect(res.status).toBe('FAIL');
    expect(res.gradePoint).toBe(0.0);
    expect(res.letterGrade).toBe('F');
    expect(res.isPracticalFail).toBe(false); // practical itself was >= 8, theory failed
  });

  it('Theory 25, Practical 7 fails because Practical < 8', () => {
    const input: RawSubjectMarkInput = {
      subjectId: 'sub-physics',
      subjectCode: '174',
      subjectName: 'Physics',
      isCompulsory: true,
      isPractical: true,
      status: 'MARKED',
      theory: 25,
      practical: 7
    };
    const res = evaluatePracticalSubject(input);
    expect(res.status).toBe('FAIL');
    expect(res.gradePoint).toBe(0.0);
    expect(res.isPracticalFail).toBe(true); // flagged for practical checking list
  });

  it('Theory 25, Practical 8 passes (Total 33 -> GP 1.0)', () => {
    const input: RawSubjectMarkInput = {
      subjectId: 'sub-physics',
      subjectCode: '174',
      subjectName: 'Physics',
      isCompulsory: true,
      isPractical: true,
      status: 'MARKED',
      theory: 25,
      practical: 8
    };
    const res = evaluatePracticalSubject(input);
    expect(res.status).toBe('PASS');
    expect(res.totalMark).toBe(33);
    expect(res.gradePoint).toBe(1.0);
    expect(res.letterGrade).toBe('D');
    expect(res.isPracticalFail).toBe(false);
  });

  it('Theory 52, Practical 19 passes (Total 71 -> GP 4.0)', () => {
    const input: RawSubjectMarkInput = {
      subjectId: 'sub-chem',
      subjectCode: '176',
      subjectName: 'Chemistry',
      isCompulsory: true,
      isPractical: true,
      status: 'MARKED',
      theory: 52,
      practical: 19
    };
    const res = evaluatePracticalSubject(input);
    expect(res.status).toBe('PASS');
    expect(res.totalMark).toBe(71);
    expect(res.gradePoint).toBe(4.0);
    expect(res.letterGrade).toBe('A');
  });

  it('Theory 60, Practical 7 fails (Total 67 but Practical < 8)', () => {
    const input: RawSubjectMarkInput = {
      subjectId: 'sub-bio',
      subjectCode: '178',
      subjectName: 'Biology',
      isCompulsory: true,
      isPractical: true,
      status: 'MARKED',
      theory: 60,
      practical: 7
    };
    const res = evaluatePracticalSubject(input);
    expect(res.status).toBe('FAIL');
    expect(res.gradePoint).toBe(0.0);
    expect(res.isPracticalFail).toBe(true);
  });

  it('Theory 60, Practical 8 passes (Total 68 -> GP 3.5)', () => {
    const input: RawSubjectMarkInput = {
      subjectId: 'sub-bio',
      subjectCode: '178',
      subjectName: 'Biology',
      isCompulsory: true,
      isPractical: true,
      status: 'MARKED',
      theory: 60,
      practical: 8
    };
    const res = evaluatePracticalSubject(input);
    expect(res.status).toBe('PASS');
    expect(res.totalMark).toBe(68);
    expect(res.gradePoint).toBe(3.5);
  });
});

describe('Result Engine — Optional 4th Subject Bonus (R-13)', () => {
  it('correctly calculates optional bonus points: max(0, optionalGP - 2)', () => {
    expect(calculateOptionalBonus(5.0)).toBe(3.0);
    expect(calculateOptionalBonus(4.0)).toBe(2.0);
    expect(calculateOptionalBonus(3.5)).toBe(1.5);
    expect(calculateOptionalBonus(3.0)).toBe(1.0);
    expect(calculateOptionalBonus(2.0)).toBe(0.0);
    expect(calculateOptionalBonus(1.0)).toBe(0.0);
    expect(calculateOptionalBonus(0.0)).toBe(0.0);
  });
});

describe('Result Engine — Compulsory Failure Override (R-13)', () => {
  it('forces Final GPA = 0.00 and Letter Grade = F when any compulsory subject fails, while preserving uncancelled GPA', () => {
    const sampleSubjects: RawSubjectMarkInput[] = [
      { subjectId: '1', subjectCode: '101', subjectName: 'Bangla', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 85 }, // GP 5.0
      { subjectId: '2', subjectCode: '107', subjectName: 'English', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 82 }, // GP 5.0
      { subjectId: '3', subjectCode: '109', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 90 }, // GP 5.0
      { subjectId: '4', subjectCode: '174', subjectName: 'Physics', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 50, practical: 20 }, // 70 -> GP 4.0
      { subjectId: '5', subjectCode: '176', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 20, practical: 20 }, // Theory failed -> GP 0.0
      { subjectId: '6', subjectCode: '178', subjectName: 'Biology', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 55, practical: 20 }, // 75 -> GP 4.0
      { subjectId: '7', subjectCode: '126', subjectName: 'Higher Math', isCompulsory: false, isPractical: true, status: 'MARKED', theory: 60, practical: 25 } // 85 -> GP 5.0 -> Bonus 3.0
    ];

    const result = calculateStudentResult('S001', sampleSubjects);

    // Compulsory GPs: 5.0 + 5.0 + 5.0 + 4.0 + 0.0 + 4.0 = 23.0
    // Optional Bonus: max(0, 5.0 - 2.0) = 3.0
    // Total Numerator: 26.0 / 6 = 4.3333... -> Uncancelled GPA: 4.33
    expect(result.compulsoryGpTotal).toBe(23.0);
    expect(result.optionalBonus).toBe(3.0);
    expect(result.uncancelledGpa).toBe(4.33);

    // Override
    expect(result.hasCompulsoryFailure).toBe(true);
    expect(result.compulsoryFailures).toContain('Chemistry');
    expect(result.finalGpa).toBe(0.0);
    expect(result.letterGrade).toBe('F');
    expect(result.overallResult).toBe('FAIL');
  });
});

describe('Result Engine — Absence Rules (R-12)', () => {
  it('compulsory AB results in overall F and preserves AB in trace', () => {
    const sampleSubjects: RawSubjectMarkInput[] = [
      { subjectId: '1', subjectCode: '101', subjectName: 'Bangla', isCompulsory: true, isPractical: false, status: 'AB' },
      { subjectId: '2', subjectCode: '107', subjectName: 'English', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 80 },
      { subjectId: '3', subjectCode: '109', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 80 },
      { subjectId: '4', subjectCode: '174', subjectName: 'Physics', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 60, practical: 20 },
      { subjectId: '5', subjectCode: '176', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 60, practical: 20 },
      { subjectId: '6', subjectCode: '178', subjectName: 'Biology', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 60, practical: 20 },
      { subjectId: '7', subjectCode: '126', subjectName: 'Higher Math', isCompulsory: false, isPractical: false, status: 'MARKED', mark: 80 }
    ];

    const result = calculateStudentResult('S002', sampleSubjects);
    expect(result.hasAbsent).toBe(true);
    expect(result.subjects[0].status).toBe('ABSENT');
    expect(result.subjects[0].totalMark).toBe('AB');
    expect(result.finalGpa).toBe(0.0);
    expect(result.letterGrade).toBe('F');
    expect(result.checkingFlags.needsAbsentReview).toBe(true);
  });

  it('optional AB does NOT fail student overall if compulsory passed, but flags for Absent and Optional checking lists', () => {
    const sampleSubjects: RawSubjectMarkInput[] = [
      { subjectId: '1', subjectCode: '101', subjectName: 'Bangla', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 80 }, // 5.0
      { subjectId: '2', subjectCode: '107', subjectName: 'English', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 80 }, // 5.0
      { subjectId: '3', subjectCode: '109', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 80 }, // 5.0
      { subjectId: '4', subjectCode: '174', subjectName: 'Physics', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 60, practical: 20 }, // 5.0
      { subjectId: '5', subjectCode: '176', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 60, practical: 20 }, // 5.0
      { subjectId: '6', subjectCode: '178', subjectName: 'Biology', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 60, practical: 20 }, // 5.0
      { subjectId: '7', subjectCode: '126', subjectName: 'Higher Math', isCompulsory: false, isPractical: false, status: 'AB' } // Optional AB
    ];

    const result = calculateStudentResult('S003', sampleSubjects);
    expect(result.compulsoryGpTotal).toBe(30.0);
    expect(result.optionalBonus).toBe(0.0);
    expect(result.finalGpa).toBe(5.0);
    expect(result.letterGrade).toBe('A+');
    expect(result.overallResult).toBe('PASS');
    expect(result.checkingFlags.needsOptionalReview).toBe(true);
    expect(result.checkingFlags.needsAbsentReview).toBe(true);
  });
});

describe('Result Engine — GPA Capping & Divisor', () => {
  it('caps uncancelled GPA at 5.00 when raw exceeds 5.00', () => {
    // 6 compulsory subjects with 5.0 = 30.0 + optional 5.0 (bonus 3.0) = 33.0 / 6 = 5.5
    const sampleSubjects: RawSubjectMarkInput[] = [
      { subjectId: '1', subjectCode: '101', subjectName: 'Bangla', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 95 },
      { subjectId: '2', subjectCode: '107', subjectName: 'English', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 95 },
      { subjectId: '3', subjectCode: '109', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 95 },
      { subjectId: '4', subjectCode: '174', subjectName: 'Physics', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 70, practical: 25 },
      { subjectId: '5', subjectCode: '176', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 70, practical: 25 },
      { subjectId: '6', subjectCode: '178', subjectName: 'Biology', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 70, practical: 25 },
      { subjectId: '7', subjectCode: '126', subjectName: 'Higher Math', isCompulsory: false, isPractical: true, status: 'MARKED', theory: 70, practical: 25 }
    ];

    const result = calculateStudentResult('S004', sampleSubjects);
    expect(result.rawGpa).toBe(5.5);
    expect(result.uncancelledGpa).toBe(5.0);
    expect(result.finalGpa).toBe(5.0);
    expect(result.letterGrade).toBe('A+');
    expect(result.overallResult).toBe('PASS');
  });
});

describe('Result Engine — Checking Lists Membership', () => {
  it('student can appear in all 3 checking lists simultaneously', () => {
    const sampleSubjects: RawSubjectMarkInput[] = [
      { subjectId: '1', subjectCode: '101', subjectName: 'Bangla', isCompulsory: true, isPractical: false, status: 'AB' }, // Triggers Absent
      { subjectId: '2', subjectCode: '107', subjectName: 'English', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 75 },
      { subjectId: '3', subjectCode: '109', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, status: 'MARKED', mark: 70 },
      { subjectId: '4', subjectCode: '174', subjectName: 'Physics', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 50, practical: 6 }, // Triggers Practical Fail (< 8)
      { subjectId: '5', subjectCode: '176', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 50, practical: 18 },
      { subjectId: '6', subjectCode: '178', subjectName: 'Biology', isCompulsory: true, isPractical: true, status: 'MARKED', theory: 50, practical: 18 },
      { subjectId: '7', subjectCode: '126', subjectName: 'Higher Math', isCompulsory: false, isPractical: false, status: 'MARKED', mark: 45 } // GP 2.0 <= 2.0 -> Triggers Optional
    ];

    const result = calculateStudentResult('S005', sampleSubjects);
    expect(result.checkingFlags.needsAbsentReview).toBe(true);
    expect(result.checkingFlags.needsPracticalReview).toBe(true);
    expect(result.checkingFlags.needsOptionalReview).toBe(true);
    expect(result.checkingFlags.isFlaggedForReview).toBe(true);
    expect(result.checkingFlags.reviewReasons.length).toBe(3);
  });
});
