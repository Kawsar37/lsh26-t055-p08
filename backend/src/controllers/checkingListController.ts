import { Request, Response } from 'express';
import { ResultModel } from '../models/Result.js';

export async function getOptionalCheckingList(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const { className } = req.query;

    const query: any = { 'checkingFlags.needsOptionalReview': true };
    if (caseId !== 'ALL') {
      query.caseId = caseId;
    }
    if (className && className !== 'ALL') {
      query.className = className;
    }

    const results = await ResultModel.find(query)
      .sort({ caseId: 1, finalGpa: 1, studentId: 1 })
      .lean();

    const items = results.map((r: any) => {
      const optSubject = r.subjects?.find((s: any) => !s.isCompulsory);
      const markDisplay = optSubject
        ? optSubject.isAbsent
          ? 'AB'
          : optSubject.isPractical
          ? `Th: ${optSubject.theory}, Pr: ${optSubject.practical} (Tot: ${optSubject.totalMark})`
          : `${optSubject.mark}/100`
        : 'N/A';

      const reason = optSubject?.isAbsent
        ? 'Optional subject is marked ABSENT (AB)'
        : `Optional Grade Point is ${r.optionalGradePoint.toFixed(1)} (<= 2.0 threshold)`;

      return {
        resultId: r._id,
        caseId: r.caseId,
        studentId: r.studentId,
        studentCode: r.studentId,
        studentName: r.studentName,
        className: r.className,
        subjectName: optSubject?.subjectName || 'Optional Subject',
        subjectCode: optSubject?.subjectCode || 'N/A',
        problematicValue: markDisplay,
        optionalGradePoint: r.optionalGradePoint,
        optionalBonus: r.optionalBonus,
        finalGpa: r.finalGpa,
        letterGrade: r.letterGrade,
        overallResult: r.overallResult,
        reason
      };
    });

    res.json({ success: true, caseId, count: items.length, data: items });
  } catch (error: any) {
    console.error('Error in getOptionalCheckingList:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPracticalCheckingList(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const { className } = req.query;

    const query: any = { 'checkingFlags.needsPracticalReview': true };
    if (caseId !== 'ALL') {
      query.caseId = caseId;
    }
    if (className && className !== 'ALL') {
      query.className = className;
    }

    const results = await ResultModel.find(query)
      .sort({ caseId: 1, finalGpa: 1, studentId: 1 })
      .lean();

    const items: any[] = [];
    results.forEach((r: any) => {
      const practicalFailSubjects = r.subjects?.filter(
        (s: any) => s.isPractical && s.markStatus === 'MARKED' && s.practical !== undefined && s.practical < 8
      );

      practicalFailSubjects.forEach((s: any) => {
        items.push({
          resultId: r._id,
          caseId: r.caseId,
          studentId: r.studentId,
          studentCode: r.studentId,
          studentName: r.studentName,
          className: r.className,
          subjectName: s.subjectName,
          subjectCode: s.subjectCode,
          isCompulsory: s.isCompulsory,
          problematicValue: `Practical: ${s.practical}/25 (Theory: ${s.theory}/75)`,
          practicalMark: s.practical,
          theoryMark: s.theory,
          totalMark: s.totalMark,
          gradePoint: s.gradePoint,
          finalGpa: r.finalGpa,
          letterGrade: r.letterGrade,
          overallResult: r.overallResult,
          reason: `Practical component score (${s.practical}/25) failed the minimum threshold requirement of 8`
        });
      });
    });

    res.json({ success: true, caseId, count: items.length, data: items });
  } catch (error: any) {
    console.error('Error in getPracticalCheckingList:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAbsentCheckingList(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const { className } = req.query;

    const query: any = { 'checkingFlags.needsAbsentReview': true };
    if (caseId !== 'ALL') {
      query.caseId = caseId;
    }
    if (className && className !== 'ALL') {
      query.className = className;
    }

    const results = await ResultModel.find(query)
      .sort({ caseId: 1, finalGpa: 1, studentId: 1 })
      .lean();

    const items: any[] = [];
    results.forEach((r: any) => {
      const absentSubjects = r.subjects?.filter((s: any) => s.isAbsent);
      absentSubjects.forEach((s: any) => {
        items.push({
          resultId: r._id,
          caseId: r.caseId,
          studentId: r.studentId,
          studentCode: r.studentId,
          studentName: r.studentName,
          className: r.className,
          subjectName: s.subjectName,
          subjectCode: s.subjectCode,
          isCompulsory: s.isCompulsory,
          problematicValue: 'AB (Absent)',
          finalGpa: r.finalGpa,
          letterGrade: r.letterGrade,
          overallResult: r.overallResult,
          reason: s.isCompulsory
            ? 'Absent in compulsory subject (forces overall result to F)'
            : 'Absent in optional 4th subject (yields 0 bonus points)'
        });
      });
    });

    res.json({ success: true, caseId, count: items.length, data: items });
  } catch (error: any) {
    console.error('Error in getAbsentCheckingList:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
