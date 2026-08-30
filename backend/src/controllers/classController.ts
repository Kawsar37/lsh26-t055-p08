import { Request, Response } from 'express';
import { ResultModel } from '../models/Result.js';
import { StudentModel } from '../models/Student.js';
import { CaseModel } from '../models/Case.js';

export async function getClasses(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const filterQuery = caseId !== 'ALL' ? { caseId } : {};

    const classNames = await StudentModel.distinct('className', filterQuery);
    const classes = classNames.sort().map((name) => ({
      _id: name,
      name,
      section: 'A'
    }));

    res.json({ success: true, caseId, data: classes });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClassSummary(req: Request, res: Response): Promise<void> {
  try {
    const { classId } = req.params;
    const caseId = (req.query.caseId as string) || 'PUB-01';

    const query: any = {};
    if (caseId !== 'ALL') {
      query.caseId = caseId;
    }
    if (classId !== 'ALL') {
      query.className = classId;
    }

    const results = await ResultModel.find(query).lean();
    const totalStudents = results.length;

    if (totalStudents === 0) {
      res.json({
        success: true,
        caseId,
        data: {
          className: classId !== 'ALL' ? classId : 'All Classes',
          totalStudents: 0,
          passed: 0,
          failed: 0,
          passRate: 0,
          averageGpa: 0,
          needsReview: 0,
          gradeDistribution: { 'A+': 0, A: 0, 'A-': 0, B: 0, C: 0, D: 0, F: 0 },
          subjectFailures: []
        }
      });
      return;
    }

    let passedCount = 0;
    let failedCount = 0;
    let totalGpaSum = 0;
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

    const subjectFailureMap = new Map<string, { subjectName: string; subjectCode: string; failCount: number }>();

    results.forEach((r: any) => {
      if (r.overallResult === 'PASS') {
        passedCount++;
      } else {
        failedCount++;
      }

      totalGpaSum += r.finalGpa || 0;

      if (r.checkingFlags?.isFlaggedForReview) {
        needsReviewCount++;
      }

      const letter = r.letterGrade || 'F';
      if (gradeDistribution[letter] !== undefined) {
        gradeDistribution[letter]++;
      } else {
        gradeDistribution['F']++;
      }

      r.subjects?.forEach((s: any) => {
        if (s.isFailed || s.isAbsent) {
          const key = s.subjectCode || s.subjectName;
          const current = subjectFailureMap.get(key) || {
            subjectName: s.subjectName,
            subjectCode: s.subjectCode,
            failCount: 0
          };
          current.failCount++;
          subjectFailureMap.set(key, current);
        }
      });
    });

    const passRate = Number(((passedCount / totalStudents) * 100).toFixed(1));
    const averageGpa = Number((totalGpaSum / totalStudents).toFixed(2));
    const subjectFailures = Array.from(subjectFailureMap.values()).sort((a, b) => b.failCount - a.failCount);

    res.json({
      success: true,
      caseId,
      data: {
        className: classId !== 'ALL' ? classId : 'All Classes',
        totalStudents,
        passed: passedCount,
        failed: failedCount,
        passRate,
        averageGpa,
        needsReview: needsReviewCount,
        gradeDistribution,
        subjectFailures
      }
    });
  } catch (error: any) {
    console.error('Error fetching class summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
