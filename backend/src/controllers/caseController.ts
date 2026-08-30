import { Request, Response } from 'express';
import { CaseModel } from '../models/Case.js';

export async function getCases(req: Request, res: Response): Promise<void> {
  try {
    const cases = await CaseModel.find({}).sort({ caseId: 1 }).lean();
    res.json({ success: true, count: cases.length, data: cases });
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCaseById(req: Request, res: Response): Promise<void> {
  try {
    const { caseId } = req.params;
    const caseDoc = await CaseModel.findOne({ caseId }).lean();
    if (!caseDoc) {
      res.status(404).json({ success: false, message: `Case ${caseId} not found` });
      return;
    }
    res.json({ success: true, data: caseDoc });
  } catch (error: any) {
    console.error('Error fetching case by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
