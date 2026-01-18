import { AppLayout } from "@/components/layout/AppLayout";
import { SessionLogger } from "@/components/session/SessionLogger";

export function Log() {
  return (
    <AppLayout title="Log Exercise">
      <SessionLogger />
    </AppLayout>
  );
}
