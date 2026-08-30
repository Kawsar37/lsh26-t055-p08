import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  code: string; // e.g. "101", "174"
  name: string; // e.g. "Bangla", "Physics"
  isCompulsory: boolean;
  isPractical: boolean;
  theoryMax: number;
  practicalMax: number;
  totalMax: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    isCompulsory: { type: Boolean, required: true, default: true },
    isPractical: { type: Boolean, required: true, default: false },
    theoryMax: { type: Number, default: 100 },
    practicalMax: { type: Number, default: 0 },
    totalMax: { type: Number, default: 100 }
  },
  { timestamps: true }
);

export const SubjectModel = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
