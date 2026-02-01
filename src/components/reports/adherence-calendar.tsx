'use client';
import { useMedication } from '@/context/medication-context';
import { Calendar } from '@/components/ui/calendar';

export function AdherenceCalendar() {
  const { logs } = useMedication();

  const loggedDays = logs
    .filter(log => log.status === 'taken')
    .map(log => new Date(log.time));

  return (
    <Calendar
      mode="multiple"
      selected={loggedDays}
      className="rounded-md"
      classNames={{
        day_selected: "bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      }}
      modifiers={{
        // Prevents selecting days
        disabled: () => true,
      }}
    />
  );
}
