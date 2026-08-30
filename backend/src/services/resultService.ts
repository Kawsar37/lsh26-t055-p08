import mongoose from 'mongoose';
import { StudentModel } from '../models/Student.js';
import { MarkModel } from '../models/Mark.js';
import { ResultModel, IResult } from '../models/Result.js';
import { CaseModel } from '../models/Case.js';
import { calculateStudentResult } from './resultEngine/resultEngine.js';
import { RawSubjectMarkInput } from './resultEngine/types.js';

export async function recalculateStudentResult(
  studentId: string,
  caseId: string = 'PUB-01'
): Promise<IResult | null> {
  const student = await StudentModel.findOne({ caseId, studentId });
  if (!student) {
    throw new Error(`Student not found: ${studentId} in case ${caseId}`);
  }

  // Get case metadata
  const caseDoc = await CaseModel.findOne({ caseId });
  const subjectsMeta = caseDoc?.subjects || [];
  const compulsoryCodes = caseDoc?.compulsory || ['BAN', 'ENG', 'MAT', 'PHY', 'CHE', 'BIO'];

  const subjectMap = new Map<string, { code: string; name: string; practical: boolean }>();
  subjectsMeta.forEach((s: any) => subjectMap.set(s.code, s));

  // Fetch all marks for this student
  const marks = await MarkModel.find({ caseId, studentId });
  const marksMap = new Map<string, any>();
  marks.forEach((m) => {
    marksMap.set(m.subjectCode, m);
  });

  const rawSubjectInputs: RawSubjectMarkInput[] = [];

  // Compulsory subjects
  for (const compCode of compulsoryCodes) {
    const subMeta = subjectMap.get(compCode) || { code: compCode, name: compCode, practical: false };
    const rawMark = marksMap.get(compCode);

    if (!rawMark || rawMark.status === 'AB') {
      rawSubjectInputs.push({
        subjectId: compCode,
        subjectCode: compCode,
        subjectName: subMeta.name,
        isCompulsory: true,
        isPractical: subMeta.practical,
        status: 'AB'
      });
    } else if (subMeta.practical) {
      rawSubjectInputs.push({
        subjectId: compCode,
        subjectCode: compCode,
        subjectName: subMeta.name,
        isCompulsory: true,
        isPractical: true,
        status: 'MARKED',
        theory: rawMark.theory,
        practical: rawMark.practical
      });
    } else {
      rawSubjectInputs.push({
        subjectId: compCode,
        subjectCode: compCode,
        subjectName: subMeta.name,
        isCompulsory: true,
        isPractical: false,
        status: 'MARKED',
        mark: rawMark.mark
      });
    }
  }

  // Optional subject
  const optCode = student.optionalSubjectCode;
  const optMeta = subjectMap.get(optCode) || { code: optCode, name: optCode, practical: false };
  const optRawMark = marksMap.get(optCode);

  if (!optRawMark || optRawMark.status === 'AB') {
    rawSubjectInputs.push({
      subjectId: optCode,
      subjectCode: optCode,
      subjectName: optMeta.name,
      isCompulsory: false,
      isPractical: optMeta.practical,
      status: 'AB'
    });
  } else if (optMeta.practical) {
    rawSubjectInputs.push({
      subjectId: optCode,
      subjectCode: optCode,
      subjectName: optMeta.name,
      isCompulsory: false,
      isPractical: true,
      status: 'MARKED',
      theory: optRawMark.theory,
      practical: optRawMark.practical
    });
  } else {
    rawSubjectInputs.push({
      subjectId: optCode,
      subjectCode: optCode,
      subjectName: optMeta.name,
      isCompulsory: false,
      isPractical: false,
      status: 'MARKED',
      mark: optRawMark.mark
    });
  }

  // Run pure deterministic result calculation engine!
  const calculation = calculateStudentResult(student.studentId, rawSubjectInputs);

  const resultData = {
    caseId,
    studentId: student.studentId,
    studentName: student.name,
    className: student.className,
    calculationVersion: calculation.calculationVersion,
    subjects: calculation.subjects.map((s) => ({
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      isCompulsory: s.isCompulsory,
      isPractical: s.isPractical,
      status: s.status,
      markStatus: s.markStatus,
      mark: s.mark,
      theory: s.theory,
      practical: s.practical,
      totalMark: s.totalMark,
      gradePoint: s.gradePoint,
      letterGrade: s.letterGrade,
      isFailed: s.isFailed,
      isAbsent: s.isAbsent,
      isPracticalFail: s.isPracticalFail,
      traceSteps: s.traceSteps,
      appliedRule: s.appliedRule
    })),
    compulsoryGpTotal: calculation.compulsoryGpTotal,
    optionalGradePoint: calculation.optionalGradePoint,
    optionalBonus: calculation.optionalBonus,
    rawGpa: calculation.rawGpa,
    uncancelledGpa: calculation.uncancelledGpa,
    finalGpa: calculation.finalGpa,
    letterGrade: calculation.letterGrade,
    overallResult: calculation.overallResult,
    hasCompulsoryFailure: calculation.hasCompulsoryFailure,
    compulsoryFailures: calculation.compulsoryFailures,
    hasAbsent: calculation.hasAbsent,
    hasPracticalFail: calculation.hasPracticalFail,
    checkingFlags: calculation.checkingFlags,
    overallTrace: calculation.overallTrace,
    calculatedAt: new Date(calculation.calculatedAt)
  };

  const savedResult = await ResultModel.findOneAndUpdate(
    { caseId, studentId: student.studentId },
    resultData,
    { new: true, upsert: true }
  );

  return savedResult;
}

export async function recalculateAllStudents(caseId: string = 'PUB-01'): Promise<{ totalRecalculated: number }> {
  const query = caseId && caseId !== 'ALL' ? { caseId } : {};
  const students = await StudentModel.find(query);
  let count = 0;
  for (const s of students) {
    await recalculateStudentResult(s.studentId, s.caseId);
    count++;
  }
  return { totalRecalculated: count };
}
