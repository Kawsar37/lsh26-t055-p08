import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  caseId: string; // e.g. "PUB-01"
  studentId: string; // e.g. "S001"
  name: string;
  className: string; // e.g. "Class 9", "Class 10"
  rollNumber: number;
  optionalSubjectCode: string; // "HMT", "AGR", "REL"
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    caseId: { type: String, required: true, default: 'PUB-01', index: true },
    studentId: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    className: { type: String, required: true, default: 'Class 9' },
    rollNumber: { type: Number, required: true },
    optionalSubjectCode: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

StudentSchema.index({ caseId: 1, studentId: 1 }, { unique: true });
StudentSchema.index({ caseId: 1, className: 1, rollNumber: 1 });

export const StudentModel = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
