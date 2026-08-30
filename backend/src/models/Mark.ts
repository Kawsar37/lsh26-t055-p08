import mongoose, { Schema, Document } from 'mongoose';

export type MarkStatus = 'MARKED' | 'AB';

export interface IMark extends Document {
  caseId: string;
  studentId: string;
  subjectCode: string;
  status: MarkStatus;
  mark?: number; // 0-100 for normal
  theory?: number; // 0-75 for practical
  practical?: number; // 0-25 for practical
  createdAt: Date;
  updatedAt: Date;
}

const MarkSchema: Schema = new Schema(
  {
    caseId: { type: String, required: true, default: 'PUB-01', index: true },
    studentId: { type: String, required: true, index: true },
    subjectCode: { type: String, required: true, index: true },
    status: { type: String, enum: ['MARKED', 'AB'], default: 'MARKED', required: true },
    mark: { type: Number, min: 0, max: 100 },
    theory: { type: Number, min: 0, max: 75 },
    practical: { type: Number, min: 0, max: 25 }
  },
  { timestamps: true }
);

MarkSchema.index({ caseId: 1, studentId: 1, subjectCode: 1 }, { unique: true });

export const MarkModel = mongoose.models.Mark || mongoose.model<IMark>('Mark', MarkSchema);
