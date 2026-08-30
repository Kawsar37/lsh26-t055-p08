import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CaseModel } from '../models/Case.js';
import { StudentModel } from '../models/Student.js';
import { MarkModel } from '../models/Mark.js';
import { ResultModel } from '../models/Result.js';
import { calculateStudentResult } from '../services/resultEngine/resultEngine.js';
import { RawSubjectMarkInput } from '../services/resultEngine/types.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resultflow';

interface FixtureSubject {
  code: string;
  name: string;
  practical: boolean;
}

interface FixtureStudent {
  id: string;
  name: string;
  class: string;
  optional: string;
  marks: Record<string, number | string | { theory: number; practical: number }>;
}

interface FixtureCase {
  case_id: string;
  subjects: FixtureSubject[];
  compulsory: string[];
  students: FixtureStudent[];
}

interface FixtureFile {
  schema_version: string;
  problem_id: string;
  format_note?: string;
  cases: FixtureCase[];
}

export async function importPublicFixture(options: { reset?: boolean } = {}) {
  try {
    console.log('[Fixture Importer] Connecting to MongoDB at', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'));
    await mongoose.connect(MONGODB_URI);

    // Locate fixture file
    let fixturePath = path.resolve(process.cwd(), 'fixtures/P08_school_results_public.json');
    if (!fs.existsSync(fixturePath)) {
      fixturePath = path.resolve(process.cwd(), '../P08_school_results_public.json');
    }
    if (!fs.existsSync(fixturePath)) {
      throw new Error(`Cannot locate P08_school_results_public.json at ${fixturePath}`);
    }

    console.log(`[Fixture Importer] Reading fixture file from: ${fixturePath}`);
    const rawData = fs.readFileSync(fixturePath, 'utf-8');
    const fixture: FixtureFile = JSON.parse(rawData);

    if (fixture.problem_id !== 'P08') {
      throw new Error(`Invalid problem_id: ${fixture.problem_id}. Expected 'P08'`);
    }

    console.log(`[Fixture Importer] Schema Version: ${fixture.schema_version}, Total Cases: ${fixture.cases.length}`);

    if (options.reset) {
      console.log('[Fixture Importer] Reset flag passed. Clearing previous fixture data...');
      await Promise.all([
        CaseModel.deleteMany({}),
        StudentModel.deleteMany({}),
        MarkModel.deleteMany({}),
        ResultModel.deleteMany({})
      ]);
    }

    let totalStudentsImported = 0;
    let totalResultsCalculated = 0;

    for (const c of fixture.cases) {
      const caseId = c.case_id;
      console.log(`[Fixture Importer] Processing Case ${caseId} (${c.students.length} students)...`);

      // Build subject lookup map
      const subjectMap = new Map<string, FixtureSubject>();
      c.subjects.forEach((sub) => subjectMap.set(sub.code, sub));

      let casePassedCount = 0;
      let caseFailedCount = 0;
      let caseGpaSum = 0;
      let caseNeedsReviewCount = 0;

      for (let idx = 0; idx < c.students.length; idx++) {
        const s = c.students[idx];
        const studentId = s.id;
        const studentName = s.name;
        const className = s.class;
        const optionalCode = s.optional;
        const rollNumber = parseInt(studentId.replace(/\D/g, ''), 10) || idx + 1;

        // Upsert Student
        await StudentModel.findOneAndUpdate(
          { caseId, studentId },
          {
            caseId,
            studentId,
            name: studentName,
            className,
            rollNumber,
            optionalSubjectCode: optionalCode,
            avatarUrl: ''
          },
          { upsert: true, new: true }
        );
        totalStudentsImported++;

        // Process Marks & build calculation inputs
        const rawSubjectInputs: RawSubjectMarkInput[] = [];

        // 1. Process 6 Compulsory Subjects
        for (const compCode of c.compulsory) {
          const subMeta = subjectMap.get(compCode) || {
            code: compCode,
            name: compCode,
            practical: false
          };
          const rawMark = s.marks[compCode];

          if (rawMark === 'AB' || rawMark === undefined) {
            // Absent in compulsory
            await MarkModel.findOneAndUpdate(
              { caseId, studentId, subjectCode: compCode },
              { caseId, studentId, subjectCode: compCode, status: 'AB' },
              { upsert: true, new: true }
            );

            rawSubjectInputs.push({
              subjectId: compCode,
              subjectCode: compCode,
              subjectName: subMeta.name,
              isCompulsory: true,
              isPractical: subMeta.practical,
              status: 'AB'
            });
          } else if (subMeta.practical && typeof rawMark === 'object') {
            const theory = Number(rawMark.theory ?? 0);
            const practical = Number(rawMark.practical ?? 0);

            await MarkModel.findOneAndUpdate(
              { caseId, studentId, subjectCode: compCode },
              { caseId, studentId, subjectCode: compCode, status: 'MARKED', theory, practical },
              { upsert: true, new: true }
            );

            rawSubjectInputs.push({
              subjectId: compCode,
              subjectCode: compCode,
              subjectName: subMeta.name,
              isCompulsory: true,
              isPractical: true,
              status: 'MARKED',
              theory,
              practical
            });
          } else {
            const mark = Number(rawMark ?? 0);

            await MarkModel.findOneAndUpdate(
              { caseId, studentId, subjectCode: compCode },
              { caseId, studentId, subjectCode: compCode, status: 'MARKED', mark },
              { upsert: true, new: true }
            );

            rawSubjectInputs.push({
              subjectId: compCode,
              subjectCode: compCode,
              subjectName: subMeta.name,
              isCompulsory: true,
              isPractical: false,
              status: 'MARKED',
              mark
            });
          }
        }

        // 2. Process Optional Subject
        const optMeta = subjectMap.get(optionalCode) || {
          code: optionalCode,
          name: optionalCode,
          practical: false
        };
        const optRawMark = s.marks[optionalCode];

        if (optRawMark === 'AB' || optRawMark === undefined) {
          await MarkModel.findOneAndUpdate(
            { caseId, studentId, subjectCode: optionalCode },
            { caseId, studentId, subjectCode: optionalCode, status: 'AB' },
            { upsert: true, new: true }
          );

          rawSubjectInputs.push({
            subjectId: optionalCode,
            subjectCode: optionalCode,
            subjectName: optMeta.name,
            isCompulsory: false,
            isPractical: optMeta.practical,
            status: 'AB'
          });
        } else if (optMeta.practical && typeof optRawMark === 'object') {
          const theory = Number(optRawMark.theory ?? 0);
          const practical = Number(optRawMark.practical ?? 0);

          await MarkModel.findOneAndUpdate(
            { caseId, studentId, subjectCode: optionalCode },
            { caseId, studentId, subjectCode: optionalCode, status: 'MARKED', theory, practical },
            { upsert: true, new: true }
          );

          rawSubjectInputs.push({
            subjectId: optionalCode,
            subjectCode: optionalCode,
            subjectName: optMeta.name,
            isCompulsory: false,
            isPractical: true,
            status: 'MARKED',
            theory,
            practical
          });
        } else {
          const mark = Number(optRawMark ?? 0);

          await MarkModel.findOneAndUpdate(
            { caseId, studentId, subjectCode: optionalCode },
            { caseId, studentId, subjectCode: optionalCode, status: 'MARKED', mark },
            { upsert: true, new: true }
          );

          rawSubjectInputs.push({
            subjectId: optionalCode,
            subjectCode: optionalCode,
            subjectName: optMeta.name,
            isCompulsory: false,
            isPractical: false,
            status: 'MARKED',
            mark
          });
        }

        // 3. Run Pure Result Engine
        const calculation = calculateStudentResult(studentId, rawSubjectInputs);

        // 4. Save Calculated Result Snapshot
        await ResultModel.findOneAndUpdate(
          { caseId, studentId },
          {
            caseId,
            studentId,
            studentName,
            className,
            calculationVersion: calculation.calculationVersion,
            subjects: calculation.subjects.map((sub) => ({
              subjectCode: sub.subjectCode,
              subjectName: sub.subjectName,
              isCompulsory: sub.isCompulsory,
              isPractical: sub.isPractical,
              status: sub.status,
              markStatus: sub.markStatus,
              mark: sub.mark,
              theory: sub.theory,
              practical: sub.practical,
              totalMark: sub.totalMark,
              gradePoint: sub.gradePoint,
              letterGrade: sub.letterGrade,
              isFailed: sub.isFailed,
              isAbsent: sub.isAbsent,
              isPracticalFail: sub.isPracticalFail,
              traceSteps: sub.traceSteps,
              appliedRule: sub.appliedRule
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
          },
          { upsert: true, new: true }
        );
        totalResultsCalculated++;

        // Track stats
        if (calculation.overallResult === 'PASS') {
          casePassedCount++;
        } else {
          caseFailedCount++;
        }
        caseGpaSum += calculation.finalGpa;
        if (calculation.checkingFlags.isFlaggedForReview) {
          caseNeedsReviewCount++;
        }
      }

      // Upsert Case Metadata Summary
      const totalStudentsInCase = c.students.length;
      const passRate = totalStudentsInCase > 0 ? Number(((casePassedCount / totalStudentsInCase) * 100).toFixed(1)) : 0;
      const avgGpa = totalStudentsInCase > 0 ? Number((caseGpaSum / totalStudentsInCase).toFixed(2)) : 0;

      await CaseModel.findOneAndUpdate(
        { caseId },
        {
          caseId,
          problemId: fixture.problem_id,
          schemaVersion: fixture.schema_version,
          subjects: c.subjects,
          compulsory: c.compulsory,
          totalStudents: totalStudentsInCase,
          passed: casePassedCount,
          failed: caseFailedCount,
          passRate,
          averageGpa: avgGpa,
          needsReview: caseNeedsReviewCount
        },
        { upsert: true, new: true }
      );
    }

    console.log(`[Fixture Importer] SUCCESS: Imported ${fixture.cases.length} cases, ${totalStudentsImported} students, and calculated ${totalResultsCalculated} results.`);
    await mongoose.disconnect();
    return {
      casesCount: fixture.cases.length,
      studentsCount: totalStudentsImported,
      resultsCount: totalResultsCalculated
    };
  } catch (error) {
    console.error('[Fixture Importer Error]:', error);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('importPublicFixture') || process.argv[1]?.includes('seedData')) {
  const isReset = process.argv.includes('--reset');
  importPublicFixture({ reset: isReset });
}
