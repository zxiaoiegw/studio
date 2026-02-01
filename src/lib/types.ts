export type Medication = {
  id: string;
  name: string;
  dosage: string;
  schedule: Schedule;
  refill: {
    quantity: number;
    reminderThreshold: number;
  };
};

export type Schedule = {
  frequency: 'daily' | 'weekly' | 'custom';
  times: string[]; // HH:mm format
  days?: number[]; // 0 for Sunday, 1 for Monday, etc. for weekly/custom
};

export type IntakeLog = {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string; // ISO 8601
  status: 'taken' | 'skipped';
  dosage: string;
};
