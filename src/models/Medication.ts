import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication extends Document {
  name: string;
  dosage: string;
  schedule: {
    frequency: 'daily' | 'custom';
    times: string[];
    days?: number[];
  };
  refill: {
    quantity: number;
    reminderThreshold: number;
  };
  userId?: string; // if you want user-specific meds
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  schedule: {
    frequency: { 
      type: String, 
      enum: ['daily', 'custom'], 
      required: true 
    },
    times: [{ type: String, required: true }],
    days: [{ type: Number }],
  },
  refill: {
    quantity: { type: Number, required: true },
    reminderThreshold: { type: Number, required: true },
  },
  userId: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.Medication || 
  mongoose.model<IMedication>('Medication', MedicationSchema);