import { AdherenceOverview } from '@/components/dashboard/adherence-overview';
import { TodaySchedule } from '@/components/dashboard/today-schedule';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome back,
        </h1>
        <p className="text-muted-foreground">Here's your medication summary for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <TodaySchedule />
        </div>
        <div className="lg:col-span-1">
            <AdherenceOverview />
        </div>
      </div>
    </div>
  );
}
