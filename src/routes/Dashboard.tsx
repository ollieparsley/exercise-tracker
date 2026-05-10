import { AppLayout } from "@/components/layout/AppLayout";
import { TodayProgress } from "@/components/dashboard/TodayProgress";
import { TotalDebt } from "@/components/dashboard/TotalDebt";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { MeasurementChart } from "@/components/dashboard/MeasurementChart";

export function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-4">
        <TodayProgress />
        <TotalDebt />
        <PerformanceChart />
        <MeasurementChart />
      </div>
    </AppLayout>
  );
}
