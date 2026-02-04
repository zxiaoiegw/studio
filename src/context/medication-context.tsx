'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
// useAuth() is used to read the current userId.
// Client Components only
// React Hook, Client-side (browser)
import { useAuth } from '@clerk/nextjs';
import type { Medication, IntakeLog } from '@/lib/types';

interface MedicationContextType {
  medications: Medication[];
  logs: IntakeLog[];
  loading: boolean;
  error: string | null;
  addMedication: (med: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (med: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  logIntake: (log: Omit<IntakeLog, 'id'>) => Promise<void>;
  getLogsForMedication: (medicationId: string) => IntakeLog[];
  refreshData: () => Promise<void>;
  isClient: boolean;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Fetches medications and logs from the API and updates state.
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // call meds API
      const medsRes = await fetch('/api/medications');
      if (!medsRes.ok) throw new Error('Failed to fetch medications');
      // parse & store meds.
      const medsData = await medsRes.json();
      setMedications(medsData);

      // Fetch logs
      const logsRes = await fetch('/api/logs');
      if (!logsRes.ok) throw new Error('Failed to fetch logs');
      const logsData = await logsRes.json();
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);  //always clear loading
    }
  };

  // Re-fetch whenever the signed-in user changes (switch account / sign in / sign out).
  useEffect(() => {
    setIsClient(true);
    if (!userId) {
      setMedications([]);
      setLogs([]);
      setLoading(false);
      setError(null);
      return;
    }
    fetchData();
  }, [userId]);

  const addMedication = async (med: Omit<Medication, 'id'>) => {
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(med),
      });
      
      if (!res.ok) throw new Error('Failed to add medication');
      
      const newMed = await res.json();

      // Spreads the existing array and appends the new medication at the end
      //Creates a new array: [old items..., newMed]
      setMedications(prev => [...prev, newMed]);
    } catch (err) {
      console.error('Error adding medication:', err);
      throw err;
    }
  };

  const updateMedication = async (updatedMed: Medication) => {
    try {
      const res = await fetch(`/api/medications/${updatedMed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMed),
      });
      
      if (!res.ok) throw new Error('Failed to update medication');
      
      const updated = await res.json();

      // Maps over the array, replacing the medication that matches the ID
      // For each item: if ID matches → use updated version, otherwise → keep original
      // Array length stays the same, one item gets replaced
      setMedications(prev => prev.map(med => (med.id === updated.id ? updated : med)));
    } catch (err) {
      console.error('Error updating medication:', err);
      throw err;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const res = await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete medication');
      
      // filter() creates a NEW array with only items that pass the test
      // Test: med.id !== '2' (keep if ID is NOT '2')
      setMedications(prev => prev.filter(med => med.id !== id));
    } catch (err) {
      console.error('Error deleting medication:', err);
      throw err;
    }
  };

  const logIntake = async (log: Omit<IntakeLog, 'id'>) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to log intake');
      }

      const data = await res.json();
      const newLog = data.log ?? data;
      setLogs(prev => [newLog, ...prev]);
      if (data.updatedMedication) {
        setMedications(prev =>
          prev.map(m => (m.id === data.updatedMedication.id ? data.updatedMedication : m))
        );
      }
    } catch (err) {
      console.error('Error logging intake:', err);
      throw err;
    }
  };
  
  const getLogsForMedication = (medicationId: string) => {
    return logs.filter(log => log.medicationId === medicationId);
  };

  const refreshData = async () => {
    await fetchData();
  };

  const value = {
    medications,
    logs,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    logIntake,
    getLogsForMedication,
    refreshData,
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