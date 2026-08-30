import { Request, Response } from 'express';
import { StudentModel } from '../models/Student.js';
import { ResultModel } from '../models/Result.js';
import { recalculateStudentResult } from '../services/resultService.js';

export async function getPrintMarksheetData(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const caseId = (req.query.caseId as string) || 'PUB-01';

    let student = await StudentModel.findOne({ caseId, studentId }).lean();
    if (!student) {
      student = await StudentModel.findOne({ studentId }).lean();
    }

    if (!student) {
      res.status(404).json({ success: false, message: `Student ${studentId} not found` });
      return;
    }

    const currentCaseId = student.caseId;
    let result = await ResultModel.findOne({ caseId: currentCaseId, studentId: student.studentId }).lean();
    if (!result) {
      result = (await recalculateStudentResult(student.studentId, currentCaseId)) as any;
    }

    res.json({
      success: true,
      data: {
        institution: {
          name: 'Academic High School & College',
          subTitle: 'Board of Intermediate and Secondary Education',
          examName: `Secondary School Annual Examination (${currentCaseId})`,
          gradingSystem: 'National Uniform Grading System (Scale 5.00)'
        },
        caseId: currentCaseId,
        student,
        result
      }
    });
  } catch (error: any) {
    console.error('Error fetching marksheet data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
