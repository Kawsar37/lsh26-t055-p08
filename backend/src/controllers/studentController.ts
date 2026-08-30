import { Request, Response } from 'express';
import { StudentModel } from '../models/Student.js';
import { ResultModel } from '../models/Result.js';
import { MarkModel } from '../models/Mark.js';
import { CaseModel } from '../models/Case.js';
import { recalculateStudentResult } from '../services/resultService.js';

export async function getStudents(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const { className, status, review, search, page = '1', limit = '100' } = req.query;

    const query: any = {};
    if (caseId !== 'ALL') {
      query.caseId = caseId;
    }
    if (className && className !== 'ALL') {
      query.className = className;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ name: searchRegex }, { studentId: searchRegex }];
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [students, totalCount] = await Promise.all([
      StudentModel.find(query)
        .sort({ caseId: 1, rollNumber: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      StudentModel.countDocuments(query)
    ]);

    // Fetch results
    const studentKeys = students.map((s) => ({ caseId: s.caseId, studentId: s.studentId }));
    const results = await ResultModel.find({
      $or: studentKeys.map((k) => ({ caseId: k.caseId, studentId: k.studentId }))
    }).lean();

    const resultMap = new Map<string, any>();
    results.forEach((r) => {
      resultMap.set(`${r.caseId}_${r.studentId}`, r);
    });

    let combined = students.map((s) => {
      const result = resultMap.get(`${s.caseId}_${s.studentId}`);
      return {
        ...s,
        result: result || null
      };
    });

    if (status && status !== 'ALL') {
      combined = combined.filter((s) => {
        if (!s.result) return false;
        if (status === 'PASS') return s.result.overallResult === 'PASS';
        if (status === 'FAIL') return s.result.overallResult === 'FAIL';
        if (status === 'ABSENT') return s.result.hasAbsent === true;
        if (status === 'NEEDS_REVIEW') return s.result.checkingFlags?.isFlaggedForReview === true;
        return true;
      });
    }

    if (review === 'true') {
      combined = combined.filter((s) => s.result?.checkingFlags?.isFlaggedForReview === true);
    }

    res.json({
      success: true,
      caseId,
      data: combined,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStudentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const caseId = (req.query.caseId as string) || 'PUB-01';

    let student: any = await StudentModel.findOne({ caseId, studentId: id }).lean();
    if (!student) {
      student = await StudentModel.findOne({ studentId: id }).lean();
    }
    if (!student) {
      res.status(404).json({ success: false, message: `Student ${id} not found in case ${caseId}` });
      return;
    }

    const currentCaseId = student.caseId;

    let result = await ResultModel.findOne({ caseId: currentCaseId, studentId: student.studentId }).lean();
    if (!result) {
      result = (await recalculateStudentResult(student.studentId, currentCaseId)) as any;
    }

    const marks = await MarkModel.find({ caseId: currentCaseId, studentId: student.studentId }).lean();
    const caseDoc = await CaseModel.findOne({ caseId: currentCaseId }).lean();

    res.json({
      success: true,
      data: {
        caseId: currentCaseId,
        student,
        result,
        marks,
        caseMeta: caseDoc
      }
    });
  } catch (error: any) {
    console.error('Error fetching student detail:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateStudentMarks(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const { marks } = req.body; // Array of { subjectCode, status: 'MARKED'|'AB', mark, theory, practical }

    if (!Array.isArray(marks)) {
      res.status(400).json({ success: false, message: 'Marks array is required' });
      return;
    }

    let student = await StudentModel.findOne({ caseId, studentId: id });
    if (!student) {
      student = await StudentModel.findOne({ studentId: id });
    }
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const currentCaseId = student.caseId;

    // Fetch case metadata to know exact practical subjects
    const caseDoc = await CaseModel.findOne({ caseId: currentCaseId });
    const subjectMap = new Map<string, { code: string; name: string; practical: boolean }>();
    caseDoc?.subjects?.forEach((s: any) => subjectMap.set(s.code, s));

    for (const m of marks) {
      const code = m.subjectCode;
      if (!code) continue;

      const subMeta = subjectMap.get(code);
      const isPractical = subMeta?.practical ?? (m.isPractical === true);

      if (m.status === 'AB') {
        await MarkModel.findOneAndUpdate(
          { caseId: currentCaseId, studentId: student.studentId, subjectCode: code },
          {
            $set: { caseId: currentCaseId, studentId: student.studentId, subjectCode: code, status: 'AB' },
            $unset: { mark: 1, theory: 1, practical: 1 }
          },
          { upsert: true, new: true }
        );
      } else if (isPractical) {
        const theory = Number(m.theory ?? 0);
        const practical = Number(m.practical ?? 0);
        if (theory < 0 || theory > 75) {
          res.status(400).json({ success: false, message: `Theory mark for ${code} must be between 0 and 75.` });
          return;
        }
        if (practical < 0 || practical > 25) {
          res.status(400).json({ success: false, message: `Practical mark for ${code} must be between 0 and 25.` });
          return;
        }
        await MarkModel.findOneAndUpdate(
          { caseId: currentCaseId, studentId: student.studentId, subjectCode: code },
          {
            $set: { caseId: currentCaseId, studentId: student.studentId, subjectCode: code, status: 'MARKED', theory, practical },
            $unset: { mark: 1 }
          },
          { upsert: true, new: true }
        );
      } else {
        const mark = Number(m.mark ?? 0);
        if (mark < 0 || mark > 100) {
          res.status(400).json({ success: false, message: `Mark for ${code} must be between 0 and 100.` });
          return;
        }
        await MarkModel.findOneAndUpdate(
          { caseId: currentCaseId, studentId: student.studentId, subjectCode: code },
          {
            $set: { caseId: currentCaseId, studentId: student.studentId, subjectCode: code, status: 'MARKED', mark },
            $unset: { theory: 1, practical: 1 }
          },
          { upsert: true, new: true }
        );
      }
    }

    // Automatically recalculate results using pure engine!
    const updatedResult = await recalculateStudentResult(student.studentId, currentCaseId);

    res.json({
      success: true,
      message: 'Marks updated and result recalculated successfully',
      data: {
        student,
        result: updatedResult
      }
    });
  } catch (error: any) {
    console.error('Error updating marks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
