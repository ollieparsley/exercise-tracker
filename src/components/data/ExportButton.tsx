import { Button } from "@/components/ui/Button";
import { useApp } from "@/hooks/useApp";
import { downloadCSV } from "@/lib/export";

export function ExportButton() {
  const { state } = useApp();

  const handleExport = () => {
    downloadCSV(state.logs, state.types);
  };

  return (
    <Button variant="secondary" onClick={handleExport}>
      Export CSV
    </Button>
  );
}
