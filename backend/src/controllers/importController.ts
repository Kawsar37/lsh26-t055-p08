import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import { StudentModel } from '../models/Student.js';
import { SubjectModel } from '../models/Subject.js';
import { MarkModel } from '../models/Mark.js';
import { recalculateStudentResult } from '../services/resultService.js';

export function getCsvTemplate(req: Request, res: Response): void {
  const csvContent = `Student_ID,Student_Name,Subject_Code,Subject_Name,Status,Mark,Theory,Practical
S-1001,Alice Johnson,101,Bangla,MARKED,85,,
S-1001,Alice Johnson,107,English,MARKED,78,,
S-1001,Alice Johnson,109,Mathematics,MARKED,92,,
S-1001,Alice Johnson,174,Physics,MARKED,,56,22
S-1001,Alice Johnson,176,Chemistry,MARKED,,48,19
S-1001,Alice Johnson,178,Biology,MARKED,,54,20
S-1001,Alice Johnson,126,Higher Mathematics,MARKED,,60,24
S-1002,Bob Smith,101,Bangla,AB,,,
S-1002,Bob Smith,174,Physics,MARKED,,24,7
`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="resultflow_marks_template.csv"');
  res.send(csvContent);
}

export async function validateAndImportMarks(req: Request, res: Response): Promise<void> {
  try {
    let csvData = '';

    if (req.file) {
      csvData = req.file.buffer.toString('utf-8');
    } else if (req.body.csvString) {
      csvData = req.body.csvString;
    } else {
      res.status(400).json({ success: false, message: 'CSV file or csvString is required' });
      return;
    }

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const isDryRun = req.query.dryRun === 'true' || req.body.dryRun === true;

    const acceptedRows: any[] = [];
    const rejectedRows: any[] = [];
    const warnings: any[] = [];
    const affectedStudentIds = new Set<string>();

    const allStudents = await StudentModel.find({}).populate('optionalSubjectId');
    const allSubjects = await SubjectModel.find({});

    const studentMap = new Map<string, any>();
    allStudents.forEach((s) => studentMap.set(s.studentId.toUpperCase(), s));

    const subjectMap = new Map<string, any>();
    allSubjects.forEach((sub) => {
      subjectMap.set(sub.code.toUpperCase(), sub);
      subjectMap.set(sub.name.toUpperCase(), sub);
    });

    const seenStudentSubject = new Set<string>();

    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      const rowNumber = index + 2; // header is line 1

      const studentIdRaw = (row.Student_ID || row.studentId || row.student_id || '').trim();
      const subjectCodeRaw = (row.Subject_Code || row.subjectCode || row.subject_code || row.Subject || '').trim();
      const statusRaw = (row.Status || row.status || 'MARKED').trim().toUpperCase();
      const markRaw = (row.Mark || row.mark || '').trim();
      const theoryRaw = (row.Theory || row.theory || '').trim();
      const practicalRaw = (row.Practical || row.practical || '').trim();

      if (!studentIdRaw) {
        rejectedRows.push({
          rowNumber,
          data: row,
          error: 'Student ID is missing'
        });
        continue;
      }

      const student = studentMap.get(studentIdRaw.toUpperCase());
      if (!student) {
        rejectedRows.push({
          rowNumber,
          data: row,
          error: `Student '${studentIdRaw}' does not exist in database`
        });
        continue;
      }

      if (!subjectCodeRaw) {
        rejectedRows.push({
          rowNumber,
          data: row,
          error: 'Subject Code / Name is missing'
        });
        continue;
      }

      const subject = subjectMap.get(subjectCodeRaw.toUpperCase());
      if (!subject) {
        rejectedRows.push({
          rowNumber,
          data: row,
          error: `Subject '${subjectCodeRaw}' is not recognized`
        });
        continue;
      }

      const duplicateKey = `${student._id.toString()}_${subject._id.toString()}`;
      if (seenStudentSubject.has(duplicateKey)) {
        rejectedRows.push({
          rowNumber,
          data: row,
          error: `Duplicate entry for student ${studentIdRaw} and subject ${subject.name}`
        });
        continue;
      }
      seenStudentSubject.add(duplicateKey);

      // Validate status
      if (statusRaw !== 'MARKED' && statusRaw !== 'AB' && statusRaw !== 'ABSENT') {
        rejectedRows.push({
          rowNumber,
          data: row,
          error: `Invalid status '${statusRaw}'. Expected 'MARKED' or 'AB'`
        });
        continue;
      }

      const isAbsent = statusRaw === 'AB' || statusRaw === 'ABSENT';

      if (isAbsent) {
        acceptedRows.push({
          rowNumber,
          studentMongoId: student._id,
          studentId: student.studentId,
          studentName: student.name,
          subjectMongoId: subject._id,
          subjectName: subject.name,
          subjectCode: subject.code,
          isPractical: subject.isPractical,
          status: 'AB',
          mark: undefined,
          theory: undefined,
          practical: undefined
        });
        affectedStudentIds.add(student._id.toString());
        continue;
      }

      // If MARKED, validate numerical boundaries
      if (subject.isPractical) {
        if (theoryRaw === '' || practicalRaw === '') {
          rejectedRows.push({
            rowNumber,
            data: row,
            error: `Practical subject ${subject.name} requires both Theory (0-75) and Practical (0-25) marks`
          });
          continue;
        }

        const theory = Number(theoryRaw);
        const practical = Number(practicalRaw);

        if (isNaN(theory) || theory < 0 || theory > 75) {
          rejectedRows.push({
            rowNumber,
            data: row,
            error: `Theory mark '${theoryRaw}' is invalid. Allowed range: 0–75`
          });
          continue;
        }

        if (isNaN(practical) || practical < 0 || practical > 25) {
          rejectedRows.push({
            rowNumber,
            data: row,
            error: `Practical mark '${practicalRaw}' is invalid. Allowed range: 0–25`
          });
          continue;
        }

        if (practical < 8) {
          warnings.push({
            rowNumber,
            message: `Practical component ${practical}/25 is below passing threshold (8). Will trigger Practical Fail flag.`
          });
        }

        acceptedRows.push({
          rowNumber,
          studentMongoId: student._id,
          studentId: student.studentId,
          studentName: student.name,
          subjectMongoId: subject._id,
          subjectName: subject.name,
          subjectCode: subject.code,
          isPractical: true,
          status: 'MARKED',
          theory,
          practical,
          total: theory + practical
        });
        affectedStudentIds.add(student._id.toString());
      } else {
        // Normal subject
        if (markRaw === '') {
          rejectedRows.push({
            rowNumber,
            data: row,
            error: `Mark is required for theory subject ${subject.name}`
          });
          continue;
        }

        const mark = Number(markRaw);
        if (isNaN(mark) || mark < 0 || mark > 100) {
          rejectedRows.push({
            rowNumber,
            data: row,
            error: `Mark '${markRaw}' is invalid. Allowed range: 0–100`
          });
          continue;
        }

        acceptedRows.push({
          rowNumber,
          studentMongoId: student._id,
          studentId: student.studentId,
          studentName: student.name,
          subjectMongoId: subject._id,
          subjectName: subject.name,
          subjectCode: subject.code,
          isPractical: false,
          status: 'MARKED',
          mark
        });
        affectedStudentIds.add(student._id.toString());
      }
    }

    // If not dry run, persist and recalculate
    if (!isDryRun && acceptedRows.length > 0) {
      for (const row of acceptedRows) {
        if (row.status === 'AB') {
          await MarkModel.findOneAndUpdate(
            { studentId: row.studentMongoId, subjectId: row.subjectMongoId },
            { studentId: row.studentMongoId, subjectId: row.subjectMongoId, status: 'AB', mark: undefined, theory: undefined, practical: undefined },
            { upsert: true, new: true }
          );
        } else if (row.isPractical) {
          await MarkModel.findOneAndUpdate(
            { studentId: row.studentMongoId, subjectId: row.subjectMongoId },
            { studentId: row.studentMongoId, subjectId: row.subjectMongoId, status: 'MARKED', theory: row.theory, practical: row.practical, mark: undefined },
            { upsert: true, new: true }
          );
        } else {
          await MarkModel.findOneAndUpdate(
            { studentId: row.studentMongoId, subjectId: row.subjectMongoId },
            { studentId: row.studentMongoId, subjectId: row.subjectMongoId, status: 'MARKED', mark: row.mark, theory: undefined, practical: undefined },
            { upsert: true, new: true }
          );
        }
      }

      // Recalculate affected students
      for (const stId of Array.from(affectedStudentIds)) {
        await recalculateStudentResult(stId);
      }
    }

    res.json({
      success: true,
      dryRun: isDryRun,
      totalRows: records.length,
      acceptedCount: acceptedRows.length,
      rejectedCount: rejectedRows.length,
      warningCount: warnings.length,
      acceptedRows,
      rejectedRows,
      warnings,
      affectedStudentsCount: affectedStudentIds.size,
      message: isDryRun
        ? `Validated ${records.length} rows: ${acceptedRows.length} valid, ${rejectedRows.length} rejected.`
        : `Successfully imported ${acceptedRows.length} marks and recalculated ${affectedStudentIds.size} students.`
    });
  } catch (error: any) {
    console.error('Error importing marks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
