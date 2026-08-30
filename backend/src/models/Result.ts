import mongoose, { Schema, Document } from 'mongoose';

export interface ICalculatedSubjectSnapshot {
  subjectCode: string;
  subjectName: string;
  isCompulsory: boolean;
  isPractical: boolean;
  status: 'PASS' | 'FAIL' | 'ABSENT';
  markStatus: 'MARKED' | 'AB';
  mark?: number;
  theory?: number;
  practical?: number;
  totalMark: number | string; // number or 'AB'
  gradePoint: number;
  letterGrade: string;
  isFailed: boolean;
  isAbsent: boolean;
  isPracticalFail: boolean;
  traceSteps: Array<{
    type: string;
    label: string;
    value: string | number;
    rule: string;
    passed: boolean;
    detail?: string;
  }>;
  appliedRule: string;
}

export interface IResult extends Document {
  caseId: string;
  studentId: string;
  studentName: string;
  className: string;
  calculationVersion: string;
  subjects: ICalculatedSubjectSnapshot[];
  compulsoryGpTotal: number;
  optionalGradePoint: number;
  optionalBonus: number;
  rawGpa: number;
  uncancelledGpa: number;
  finalGpa: number;
  letterGrade: string;
  overallResult: 'PASS' | 'FAIL';
  hasCompulsoryFailure: boolean;
  compulsoryFailures: string[];
  hasAbsent: boolean;
  hasPracticalFail: boolean;
  checkingFlags: {
    needsOptionalReview: boolean;
    needsPracticalReview: boolean;
    needsAbsentReview: boolean;
    isFlaggedForReview: boolean;
    reviewReasons: string[];
  };
  overallTrace: Array<{
    type: string;
    label: string;
    value: string | number;
    rule: string;
    passed: boolean;
    detail?: string;
  }>;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema(
  {
    caseId: { type: String, required: true, default: 'PUB-01', index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    className: { type: String, required: true, default: 'Class 9' },
    calculationVersion: { type: String, default: 'P08-v1' },
    subjects: [
      {
        subjectCode: { type: String, required: true },
        subjectName: { type: String, required: true },
        isCompulsory: { type: Boolean, required: true },
        isPractical: { type: Boolean, required: true },
        status: { type: String, enum: ['PASS', 'FAIL', 'ABSENT'], required: true },
        markStatus: { type: String, enum: ['MARKED', 'AB'], required: true },
        mark: { type: Number },
        theory: { type: Number },
        practical: { type: Number },
        totalMark: { type: Schema.Types.Mixed, required: true },
        gradePoint: { type: Number, required: true },
        letterGrade: { type: String, required: true },
        isFailed: { type: Boolean, required: true },
        isAbsent: { type: Boolean, required: true },
        isPracticalFail: { type: Boolean, required: true },
        traceSteps: [
          {
            type: { type: String },
            label: { type: String },
            value: { type: Schema.Types.Mixed },
            rule: { type: String },
            passed: { type: Boolean },
            detail: { type: String }
          }
        ],
        appliedRule: { type: String }
      }
    ],
    compulsoryGpTotal: { type: Number, required: true },
    optionalGradePoint: { type: Number, required: true },
    optionalBonus: { type: Number, required: true },
    rawGpa: { type: Number, required: true },
    uncancelledGpa: { type: Number, required: true },
    finalGpa: { type: Number, required: true, index: true },
    letterGrade: { type: String, required: true, index: true },
    overallResult: { type: String, enum: ['PASS', 'FAIL'], required: true, index: true },
    hasCompulsoryFailure: { type: Boolean, default: false },
    compulsoryFailures: [{ type: String }],
    hasAbsent: { type: Boolean, default: false },
    hasPracticalFail: { type: Boolean, default: false },
    checkingFlags: {
      needsOptionalReview: { type: Boolean, default: false },
      needsPracticalReview: { type: Boolean, default: false },
      needsAbsentReview: { type: Boolean, default: false },
      isFlaggedForReview: { type: Boolean, default: false, index: true },
      reviewReasons: [{ type: String }]
    },
    overallTrace: [
      {
        type: { type: String },
        label: { type: String },
        value: { type: Schema.Types.Mixed },
        rule: { type: String },
        passed: { type: Boolean },
        detail: { type: String }
      }
    ],
    calculatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ResultSchema.index({ caseId: 1, studentId: 1 }, { unique: true });
ResultSchema.index({ caseId: 1, overallResult: 1 });
ResultSchema.index({ caseId: 1, 'checkingFlags.isFlaggedForReview': 1 });

export const ResultModel = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
