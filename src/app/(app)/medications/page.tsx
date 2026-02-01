import { MedicationsClient } from '@/components/medications/medications-client';

export default function MedicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Medication Management
        </h1>
        <p className="text-muted-foreground">
          View, add, and manage your medications and schedules.
        </p>
      </div>
      <MedicationsClient />
    </div>
  );
}
