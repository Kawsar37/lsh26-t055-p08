import { Request, Response } from 'express';
import { ResultModel } from '../models/Result.js';
import { StudentModel } from '../models/Student.js';
import { CaseModel } from '../models/Case.js';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const filterQuery: any = {};
    if (caseId !== 'ALL') {
      filterQuery.caseId = caseId;
    }

    const [totalStudents, results, cases] = await Promise.all([
      StudentModel.countDocuments(filterQuery),
      ResultModel.find(filterQuery).sort({ finalGpa: -1 }).lean(),
      CaseModel.find({}).sort({ caseId: 1 }).lean()
    ]);

    let passedCount = 0;
    let failedCount = 0;
    let needsReviewCount = 0;

    const gradeDistribution: Record<string, number> = {
      'A+': 0,
      A: 0,
      'A-': 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0
    };

    const classStatsMap = new Map<string, { className: string; total: number; passed: number; failed: number }>();

    results.forEach((r: any) => {
      const isPass = r.overallResult === 'PASS';
      if (isPass) {
        passedCount++;
      } else {
        failedCount++;
      }

      if (r.checkingFlags?.isFlaggedForReview) {
        needsReviewCount++;
      }

      const letter = r.letterGrade || 'F';
      if (gradeDistribution[letter] !== undefined) {
        gradeDistribution[letter]++;
      } else {
        gradeDistribution['F']++;
      }

      const cName = r.className || 'Class 9';
      const current = classStatsMap.get(cName) || { className: cName, total: 0, passed: 0, failed: 0 };
      current.total++;
      if (isPass) current.passed++;
      else current.failed++;
      classStatsMap.set(cName, current);
    });

    const passRate = totalStudents > 0 ? Number(((passedCount / totalStudents) * 100).toFixed(1)) : 0;
    const classComparative = Array.from(classStatsMap.values());

    const recentAudit = results.slice(0, 15).map((r: any) => ({
      resultId: r._id,
      caseId: r.caseId,
      studentId: r.studentId,
      studentCode: r.studentId,
      studentName: r.studentName,
      className: r.className,
      finalGpa: r.finalGpa,
      uncancelledGpa: r.uncancelledGpa,
      letterGrade: r.letterGrade,
      overallResult: r.overallResult,
      isFlaggedForReview: r.checkingFlags?.isFlaggedForReview,
      hasCompulsoryFailure: r.hasCompulsoryFailure,
      calculatedAt: r.calculatedAt || r.updatedAt
    }));

    res.json({
      success: true,
      data: {
        caseId,
        availableCases: cases.map((c) => ({ caseId: c.caseId, totalStudents: c.totalStudents, passRate: c.passRate })),
        totalStudents,
        passed: passedCount,
        failed: failedCount,
        passRate,
        needsReview: needsReviewCount,
        gradeDistribution,
        classComparative,
        recentAudit
      }
    });
  } catch (error: any) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
