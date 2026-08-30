import { Request, Response } from 'express';
import { ResultModel } from '../models/Result.js';
import { recalculateStudentResult, recalculateAllStudents } from '../services/resultService.js';

export async function getResults(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const { className, overallResult, search, page = '1', limit = '100' } = req.query;

    const query: any = {};
    if (caseId !== 'ALL') {
      query.caseId = caseId;
    }
    if (className && className !== 'ALL') {
      query.className = className;
    }
    if (overallResult && overallResult !== 'ALL') {
      query.overallResult = overallResult;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ studentName: searchRegex }, { studentId: searchRegex }];
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [results, total] = await Promise.all([
      ResultModel.find(query)
        .sort({ finalGpa: -1, studentId: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ResultModel.countDocuments(query)
    ]);

    res.json({
      success: true,
      caseId,
      data: results,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getResultByStudentId(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const result = await recalculateStudentResult(studentId, caseId);
    if (!result) {
      res.status(404).json({ success: false, message: 'Result not found for student' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error getting student result:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function recalculateSingleResult(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const result = await recalculateStudentResult(studentId, caseId);
    res.json({
      success: true,
      message: 'Student result recalculated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error recalculating student result:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function recalculateAll(req: Request, res: Response): Promise<void> {
  try {
    const caseId = (req.query.caseId as string) || 'PUB-01';
    const stats = await recalculateAllStudents(caseId);
    res.json({
      success: true,
      message: `Successfully recalculated ${stats.totalRecalculated} student results in case ${caseId}`,
      data: stats
    });
  } catch (error: any) {
    console.error('Error recalculating all results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
