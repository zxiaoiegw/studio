'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_MEDICATIONS, DEMO_LOGS } from '@/lib/demo-data';

const DEMO_FLAG_KEY = 'pill_pal_demo';
const DEMO_MEDS_KEY = 'pill_pal_demo_meds';
const DEMO_LOGS_KEY = 'pill_pal_demo_logs';
const DEMO_COOKIE = 'pill_pal_demo';

interface DemoContextType {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsDemo(localStorage.getItem(DEMO_FLAG_KEY) === 'true');
  }, []);

  const enterDemo = () => {
    localStorage.setItem(DEMO_FLAG_KEY, 'true');
    localStorage.setItem(DEMO_MEDS_KEY, JSON.stringify(DEMO_MEDICATIONS));
    localStorage.setItem(DEMO_LOGS_KEY, JSON.stringify(DEMO_LOGS));
    document.cookie = `${DEMO_COOKIE}=true; path=/`;
    setIsDemo(true);
    router.push('/dashboard');
  };

  const exitDemo = () => {
    localStorage.removeItem(DEMO_FLAG_KEY);
    localStorage.removeItem(DEMO_MEDS_KEY);
    localStorage.removeItem(DEMO_LOGS_KEY);
    document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0`;
    setIsDemo(false);
    router.push('/sign-in');
  };

  return (
    <DemoContext.Provider value={{ isDemo, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
};
