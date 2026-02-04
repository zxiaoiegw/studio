import mongoose, { Schema, Document } from 'mongoose';

export interface IIntakeLog extends Document {
  medicationId: string;
  medicationName: string;
  time: Date;
  status: 'taken' | 'missed' | 'skipped';
  dosage: string;
  userId?: string;
}

const IntakeLogSchema = new Schema<IIntakeLog>({
  medicationId: { type: String, required: true },
  medicationName: { type: String, required: true },
  time: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['taken', 'missed', 'skipped'], 
    required: true 
  },
  dosage: { type: String, required: true },
  userId: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.IntakeLog || 
  mongoose.model<IIntakeLog>('IntakeLog', IntakeLogSchema);