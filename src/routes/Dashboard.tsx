import { AppLayout } from "@/components/layout/AppLayout";
import { TodayProgress } from "@/components/dashboard/TodayProgress";
import { TotalDebt } from "@/components/dashboard/TotalDebt";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

export function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-4">
        <TodayProgress />
        <TotalDebt />
        <PerformanceChart />
      </div>
    </AppLayout>
  );
}
