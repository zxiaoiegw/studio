import { AdherenceChart } from "@/components/reports/adherence-chart";
import { AdherenceCalendar } from "@/components/reports/adherence-calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Adherence Reports
        </h1>
        <p className="text-muted-foreground">
          Track your medication adherence with visual charts and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Adherence Chart</CardTitle>
              <CardDescription>Taken vs. Scheduled Doses Over the Last 30 Days</CardDescription>
            </CardHeader>
            <CardContent>
              <AdherenceChart />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Adherence Calendar</CardTitle>
              <CardDescription>A monthly view of your logged doses.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AdherenceCalendar />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
