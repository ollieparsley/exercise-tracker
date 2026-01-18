import { AppLayout } from "@/components/layout/AppLayout";
import { HistoryBackfill } from "@/components/history/HistoryBackfill";

export function History() {
  return (
    <AppLayout title="History">
      <HistoryBackfill />
    </AppLayout>
  );
}
