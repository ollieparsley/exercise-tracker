import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsPage } from "@/components/settings/SettingsPage";

export function Settings() {
  return (
    <AppLayout title="Settings">
      <SettingsPage />
    </AppLayout>
  );
}
