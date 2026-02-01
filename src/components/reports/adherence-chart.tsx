'use client';
import { useMedication } from '@/context/medication-context';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

export function AdherenceChart() {
  const { logs, medications, isClient } = useMedication();

  const data = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const scheduledDoses = medications.reduce((total, med) => {
      const isScheduledToday = med.schedule.frequency === 'daily' || med.schedule.days?.includes(date.getDay());
      return isScheduledToday ? total + med.schedule.times.length : total;
    }, 0);

    const takenDoses = logs.filter(log => {
      const logDate = new Date(log.time);
      return logDate.getDate() === date.getDate() &&
             logDate.getMonth() === date.getMonth() &&
             logDate.getFullYear() === date.getFullYear() &&
             log.status === 'taken';
    }).length;

    return {
      day,
      taken: takenDoses,
      scheduled: scheduledDoses,
    };
  }).reverse();

  if (!isClient) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="day"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value, index) => index % 3 === 0 ? value : ''}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
            cursor={{ fill: 'hsl(var(--secondary))', radius: 'var(--radius)' }}
            content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="scheduled" fill="hsl(var(--primary))" opacity={0.2} radius={[4, 4, 0, 0]} name="Scheduled" />
        <Bar dataKey="taken" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Taken" />
      </BarChart>
    </ResponsiveContainer>
  );
}
