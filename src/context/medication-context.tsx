'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Medication, IntakeLog } from '@/lib/types';
import { INITIAL_MEDICATIONS, INITIAL_LOGS, generateLogs } from '@/lib/data';

interface MedicationContextType {
  medications: Medication[];
  logs: IntakeLog[];
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (id: string) => void;
  logIntake: (log: Omit<IntakeLog, 'id'>) => void;
  getLogsForMedication: (medicationId: string) => IntakeLog[];
  isClient: boolean;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider = ({ children }: { children: ReactNode }) => {
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [logs, setLogs] = useState<IntakeLog[]>(INITIAL_LOGS);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setLogs(generateLogs());
    setIsClient(true);
  }, []);

  const addMedication = (med: Omit<Medication, 'id'>) => {
    const newMed = { ...med, id: Date.now().toString() };
    setMedications(prev => [...prev, newMed]);
  };

  const updateMedication = (updatedMed: Medication) => {
    setMedications(prev => prev.map(med => (med.id === updatedMed.id ? updatedMed : med)));
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const logIntake = (log: Omit<IntakeLog, 'id'>) => {
    const newLog = { ...log, id: Date.now().toString() };
    setLogs(prev => [newLog, ...prev]);
  };
  
  const getLogsForMedication = (medicationId: string) => {
    return logs.filter(log => log.medicationId === medicationId);
  };

  const value = {
    medications,
    logs,
    addMedication,
    updateMedication,
    deleteMedication,
    logIntake,
    getLogsForMedication,
    isClient,
  };

  return (
    <MedicationContext.Provider value={value}>
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
};
