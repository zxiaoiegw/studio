'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useDemoMode } from '@/context/demo-context';
import { DEMO_MEDICATIONS, DEMO_LOGS } from '@/lib/demo-data';
import type { Medication, IntakeLog } from '@/lib/types';

const DEMO_MEDS_KEY = 'pill_pal_demo_meds';
const DEMO_LOGS_KEY = 'pill_pal_demo_logs';

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

// Helper to read/write demo data from localStorage
function getDemoMeds(): Medication[] {
  try {
    const raw = localStorage.getItem(DEMO_MEDS_KEY);
    return raw ? JSON.parse(raw) : DEMO_MEDICATIONS;
  } catch {
    return DEMO_MEDICATIONS;
  }
}

function getDemoLogs(): IntakeLog[] {
  try {
    const raw = localStorage.getItem(DEMO_LOGS_KEY);
    return raw ? JSON.parse(raw) : DEMO_LOGS;
  } catch {
    return DEMO_LOGS;
  }
}

function saveDemoMeds(meds: Medication[]) {
  localStorage.setItem(DEMO_MEDS_KEY, JSON.stringify(meds));
}

function saveDemoLogs(logs: IntakeLog[]) {
  localStorage.setItem(DEMO_LOGS_KEY, JSON.stringify(logs));
}

export const MedicationProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();
  const { isDemo } = useDemoMode();
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

  const loadDemoData = useCallback(() => {
    setMedications(getDemoMeds());
    setLogs(getDemoLogs());
    setLoading(false);
    setError(null);
  }, []);

  // Re-fetch whenever the signed-in user changes or demo mode changes.
  useEffect(() => {
    setIsClient(true);

    if (isDemo) {
      loadDemoData();
      return;
    }

    if (!userId) {
      setMedications([]);
      setLogs([]);
      setLoading(false);
      setError(null);
      return;
    }
    fetchData();
  }, [userId, isDemo, loadDemoData]);

  const addMedication = async (med: Omit<Medication, 'id'>) => {
    if (isDemo) {
      const newMed: Medication = { ...med, id: `demo-med-${Date.now()}` };
      const updated = [...medications, newMed];
      setMedications(updated);
      saveDemoMeds(updated);
      return;
    }

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
    if (isDemo) {
      const updated = medications.map(m => (m.id === updatedMed.id ? updatedMed : m));
      setMedications(updated);
      saveDemoMeds(updated);
      return;
    }

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
    if (isDemo) {
      const updated = medications.filter(m => m.id !== id);
      setMedications(updated);
      saveDemoMeds(updated);
      return;
    }

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
    if (isDemo) {
      const newLog: IntakeLog = { ...log, id: `demo-log-${Date.now()}` };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      saveDemoLogs(updatedLogs);

      // Decrement quantity if taken
      if (log.status === 'taken' && log.medicationId) {
        const updatedMeds = medications.map(m => {
          if (m.id === log.medicationId) {
            return {
              ...m,
              refill: { ...m.refill, quantity: Math.max(0, m.refill.quantity - 1) },
            };
          }
          return m;
        });
        setMedications(updatedMeds);
        saveDemoMeds(updatedMeds);
      }
      return;
    }

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
    if (isDemo) {
      loadDemoData();
      return;
    }
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
