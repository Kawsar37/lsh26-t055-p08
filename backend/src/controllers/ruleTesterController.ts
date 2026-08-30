import { Request, Response } from 'express';
import { getGradePoint, getSubjectLetterGrade } from '../services/resultEngine/gradePoint.js';
import { evaluatePracticalSubject } from '../services/resultEngine/practicalEvaluator.js';
import { calculateOptionalBonus } from '../services/resultEngine/optionalCalculator.js';
import { evaluateAbsentSubject } from '../services/resultEngine/absentEvaluator.js';
import { calculateStudentResult } from '../services/resultEngine/resultEngine.js';

/**
 * Pure Rule Tester Controller - 100% In-Memory, ZERO Database Mutation
 */
export async function evaluateRuleTester(req: Request, res: Response): Promise<void> {
  try {
    const { mode, payload } = req.body;

    switch (mode) {
      case 'NORMAL_SUBJECT': {
        const { mark } = payload;
        if (mark === 'AB' || mark === 'ab') {
          const evalResult = evaluateAbsentSubject({
            subjectId: 'SUBJ',
            subjectCode: 'SUBJ',
            subjectName: 'Test Subject',
            isCompulsory: true,
            isPractical: false,
            status: 'AB'
          });
          res.json({ success: true, data: evalResult });
          return;
        }

        const numMark = Number(mark);
        const gradePoint = getGradePoint(numMark);
        const letterGrade = getSubjectLetterGrade(gradePoint);
        const isPass = gradePoint > 0;

        let ruleText = '0–32 → 0.0 (F - FAIL)';
        if (numMark >= 80) ruleText = '80–100 → 5.0 (A+)';
        else if (numMark >= 70) ruleText = '70–79 → 4.0 (A)';
        else if (numMark >= 60) ruleText = '60–69 → 3.5 (A-)';
        else if (numMark >= 50) ruleText = '50–59 → 3.0 (B)';
        else if (numMark >= 40) ruleText = '40–49 → 2.0 (C)';
        else if (numMark >= 33) ruleText = '33–39 → 1.0 (D)';

        res.json({
          success: true,
          data: {
            mark: numMark,
            gradePoint,
            letterGrade,
            status: isPass ? 'PASS' : 'FAIL',
            appliedRule: ruleText
          }
        });
        return;
      }

      case 'PRACTICAL_SUBJECT': {
        const { theory, practical } = payload;
        const evalResult = evaluatePracticalSubject({
          subjectId: 'PRAC',
          subjectCode: 'PRAC',
          subjectName: 'Practical Subject',
          isCompulsory: true,
          isPractical: true,
          status: 'MARKED',
          theory: Number(theory),
          practical: Number(practical)
        });
        res.json({ success: true, data: evalResult });
        return;
      }

      case 'OPTIONAL_BONUS': {
        const { gradePoint } = payload;
        const gp = Number(gradePoint);
        const bonus = calculateOptionalBonus(gp);
        res.json({
          success: true,
          data: {
            optionalGradePoint: gp,
            optionalBonus: bonus,
            formula: `max(0, ${gp} - 2.0)`,
            explanation: gp <= 2.0
              ? `Optional GP (${gp}) is <= 2.0 threshold, so bonus is 0.0.`
              : `Optional GP (${gp}) contributes +${bonus.toFixed(2)} bonus points to compulsory GPA total.`
          }
        });
        return;
      }

      case 'ABSENT_BEHAVIOR': {
        const { isCompulsory } = payload;
        const evalResult = evaluateAbsentSubject({
          subjectId: isCompulsory ? 'COMP_AB' : 'OPT_AB',
          subjectCode: isCompulsory ? 'COMP' : 'OPT',
          subjectName: isCompulsory ? 'Compulsory Subject' : 'Optional Subject',
          isCompulsory: Boolean(isCompulsory),
          isPractical: false,
          status: 'AB'
        });
        res.json({ success: true, data: evalResult });
        return;
      }

      case 'MOCK_STUDENT': {
        const { marks, optionalSubjectCode } = payload;
        const rawInputs = marks.map((m: any) => ({
          subjectId: m.subjectCode,
          subjectCode: m.subjectCode,
          subjectName: m.subjectName || m.subjectCode,
          isCompulsory: m.isCompulsory !== false,
          isPractical: Boolean(m.isPractical),
          status: m.status || (m.theory !== undefined || m.mark !== undefined ? 'MARKED' : 'AB'),
          mark: m.mark !== undefined ? Number(m.mark) : undefined,
          theory: m.theory !== undefined ? Number(m.theory) : undefined,
          practical: m.practical !== undefined ? Number(m.practical) : undefined
        }));

        const result = calculateStudentResult('TEST_STUDENT', rawInputs);

        res.json({ success: true, data: result });
        return;
      }

      default:
        res.status(400).json({ success: false, message: `Unknown rule tester mode: ${mode}` });
    }
  } catch (error: any) {
    console.error('Error in evaluateRuleTester:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
