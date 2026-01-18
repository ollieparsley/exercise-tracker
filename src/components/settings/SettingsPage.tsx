import { GoalSettings } from "./GoalSettings";
import { TypeManager } from "./TypeManager";
import { BackupRestore } from "@/components/data/BackupRestore";

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <GoalSettings />
      <TypeManager />
      <BackupRestore />
    </div>
  );
}
