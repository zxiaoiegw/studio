import type { Medication, IntakeLog } from '@/lib/types';

export const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'demo-med-1',
    name: 'Aspirin',
    dosage: '81mg',
    schedule: {
      frequency: 'daily',
      times: ['08:00'],
    },
    refill: {
      quantity: 28,
      reminderThreshold: 5,
    },
  },
  {
    id: 'demo-med-2',
    name: 'Vitamin D',
    dosage: '1000 IU',
    schedule: {
      frequency: 'daily',
      times: ['09:00'],
    },
    refill: {
      quantity: 45,
      reminderThreshold: 10,
    },
  },
  {
    id: 'demo-med-3',
    name: 'Metformin',
    dosage: '500mg',
    schedule: {
      frequency: 'daily',
      times: ['08:00', '18:00'],
    },
    refill: {
      quantity: 56,
      reminderThreshold: 14,
    },
  },
  {
    id: 'demo-med-4',
    name: 'Lisinopril',
    dosage: '10mg',
    schedule: {
      frequency: 'daily',
      times: ['07:00'],
    },
    refill: {
      quantity: 30,
      reminderThreshold: 7,
    },
  },
  {
    id: 'demo-med-5',
    name: 'Melatonin',
    dosage: '3mg',
    schedule: {
      frequency: 'daily',
      times: ['21:00'],
    },
    refill: {
      quantity: 20,
      reminderThreshold: 5,
    },
  },
];

function getRecentDate(daysAgo: number, time: string): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const [hours, minutes] = time.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date.toISOString();
}

export const DEMO_LOGS: IntakeLog[] = [
  {
    id: 'demo-log-1',
    medicationId: 'demo-med-1',
    medicationName: 'Aspirin',
    time: getRecentDate(0, '08:05'),
    status: 'taken',
    dosage: '81mg',
  },
  {
    id: 'demo-log-2',
    medicationId: 'demo-med-2',
    medicationName: 'Vitamin D',
    time: getRecentDate(0, '09:10'),
    status: 'taken',
    dosage: '1000 IU',
  },
  {
    id: 'demo-log-3',
    medicationId: 'demo-med-3',
    medicationName: 'Metformin',
    time: getRecentDate(0, '08:02'),
    status: 'taken',
    dosage: '500mg',
  },
  {
    id: 'demo-log-4',
    medicationId: 'demo-med-1',
    medicationName: 'Aspirin',
    time: getRecentDate(1, '08:15'),
    status: 'taken',
    dosage: '81mg',
  },
  {
    id: 'demo-log-5',
    medicationId: 'demo-med-2',
    medicationName: 'Vitamin D',
    time: getRecentDate(1, '09:00'),
    status: 'taken',
    dosage: '1000 IU',
  },
  {
    id: 'demo-log-6',
    medicationId: 'demo-med-3',
    medicationName: 'Metformin',
    time: getRecentDate(1, '08:00'),
    status: 'taken',
    dosage: '500mg',
  },
  {
    id: 'demo-log-7',
    medicationId: 'demo-med-3',
    medicationName: 'Metformin',
    time: getRecentDate(1, '18:10'),
    status: 'taken',
    dosage: '500mg',
  },
  {
    id: 'demo-log-8',
    medicationId: 'demo-med-4',
    medicationName: 'Lisinopril',
    time: getRecentDate(1, '07:00'),
    status: 'taken',
    dosage: '10mg',
  },
  {
    id: 'demo-log-9',
    medicationId: 'demo-med-5',
    medicationName: 'Melatonin',
    time: getRecentDate(1, '21:05'),
    status: 'taken',
    dosage: '3mg',
  },
  {
    id: 'demo-log-10',
    medicationId: 'demo-med-4',
    medicationName: 'Lisinopril',
    time: getRecentDate(2, '07:30'),
    status: 'missed',
    dosage: '10mg',
  },
];
