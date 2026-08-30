import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectMeta {
  code: string;
  name: string;
  practical: boolean;
}

export interface ICase extends Document {
  caseId: string; // e.g. "PUB-01"
  problemId: string; // "P08"
  schemaVersion: string; // "2.1"
  subjects: ISubjectMeta[];
  compulsory: string[];
  totalStudents: number;
  passed: number;
  failed: number;
  passRate: number;
  averageGpa: number;
  needsReview: number;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    problemId: { type: String, default: 'P08' },
    schemaVersion: { type: String, default: '2.1' },
    subjects: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        practical: { type: Boolean, required: true }
      }
    ],
    compulsory: [{ type: String, required: true }],
    totalStudents: { type: Number, default: 0 },
    passed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    averageGpa: { type: Number, default: 0 },
    needsReview: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const CaseModel = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
