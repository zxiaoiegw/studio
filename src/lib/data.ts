import type { Medication, IntakeLog } from '@/lib/types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500 mg',
    schedule: {
      frequency: 'daily',
      times: ['08:00', '20:00'],
    },
    refill: {
      quantity: 60,
      reminderThreshold: 10,
    },
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10 mg',
    schedule: {
      frequency: 'daily',
      times: ['09:00'],
    },
    refill: {
      quantity: 30,
      reminderThreshold: 5,
    },
  },
  {
    id: '3',
    name: 'Amoxicillin',
    dosage: '250 mg',
    schedule: {
      frequency: 'custom',
      times: ['07:00', '15:00', '23:00'],
      days: [0,1,2,3,4,5,6]
    },
    refill: {
      quantity: 21,
      reminderThreshold: 3,
    },
  },
];

const generateLogs = (): IntakeLog[] => {
  const logs: IntakeLog[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Log for Metformin
    const logTime1 = new Date(date);
    logTime1.setHours(8, Math.floor(Math.random() * 15)); // 8:00 - 8:14 AM
    if(Math.random() > 0.1) { // 90% chance of taking
        logs.push({
            id: `log-${logs.length}`,
            medicationId: '1',
            medicationName: 'Metformin',
            time: logTime1.toISOString(),
            status: 'taken',
            dosage: '500 mg',
        });
    }

    const logTime2 = new Date(date);
    logTime2.setHours(20, Math.floor(Math.random() * 15)); // 8:00 - 8:14 PM
     if(Math.random() > 0.15) { // 85% chance of taking
        logs.push({
            id: `log-${logs.length}`,
            medicationId: '1',
            medicationName: 'Metformin',
            time: logTime2.toISOString(),
            status: 'taken',
            dosage: '500 mg',
        });
    }

    // Log for Lisinopril
    const logTime3 = new Date(date);
    logTime3.setHours(9, Math.floor(Math.random() * 10)); // 9:00 - 9:09 AM
    if(Math.random() > 0.05) { // 95% chance of taking
        logs.push({
            id: `log-${logs.length}`,
            medicationId: '2',
            medicationName: 'Lisinopril',
            time: logTime3.toISOString(),
            status: 'taken',
            dosage: '10 mg',
        });
    }
  }
  return logs.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

export const INITIAL_LOGS: IntakeLog[] = generateLogs();
