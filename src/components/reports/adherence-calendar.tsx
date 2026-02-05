'use client';
import { useMedication } from '@/context/medication-context';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';

export function AdherenceCalendar() {
  const { logs, isClient } = useMedication();

  // Normalize dates to midnight to ensure proper day comparison
  // and deduplicate (multiple doses on same day should only mark once)
  const loggedDays = logs
    .filter(log => log.status === 'taken')
    .map(log => {
      const date = new Date(log.time);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    })
    .filter((date, index, self) =>
      index === self.findIndex(d => d.getTime() === date.getTime())
    );

  if (!isClient) {
    return <Skeleton className="h-[298px] w-[280px] rounded-md" />;
  }

  return (
    <Calendar
      mode="multiple"
      selected={loggedDays}
      className="rounded-md"
      modifiers={{
        taken: loggedDays,
      }}
      modifiersClassNames={{
        taken: "bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      }}
      classNames={{
        day_button: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 w-full rounded-md",
      }}
    />
  );
}
