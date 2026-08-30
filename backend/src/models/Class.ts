import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string; // e.g. "Class 9", "Class 10"
  section?: string; // e.g. "A", "B", "Science"
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    section: { type: String, trim: true, default: 'A' },
    academicYear: { type: String, default: '2026' }
  },
  { timestamps: true }
);

ClassSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

export const ClassModel = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
