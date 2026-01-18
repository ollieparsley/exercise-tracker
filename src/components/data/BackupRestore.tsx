import { useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/hooks/useApp";
import { downloadJSON, downloadExcel, parseJSONFile } from "@/lib/export";
import { clearState } from "@/lib/storage";

export function BackupRestore() {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleBackup = () => {
    downloadJSON(state);
  };

  const handleExportExcel = () => {
    downloadExcel(state.logs, state.types);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const result = await parseJSONFile(file);

    if (result.success) {
      dispatch({ type: "IMPORT_STATE", payload: result.data });
    } else {
      setError(result.error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    clearState();
    dispatch({ type: "RESET_STATE" });
    setShowResetConfirm(false);
  };

  return (
    <Card>
      <CardHeader>Data Management</CardHeader>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleBackup} className="flex-1">
            Backup JSON
          </Button>
          <Button
            variant="secondary"
            onClick={handleRestoreClick}
            className="flex-1"
          >
            Restore
          </Button>
        </div>

        <Button
          variant="secondary"
          onClick={handleExportExcel}
          className="w-full"
        >
          Export Excel
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select backup file"
        />

        {error && <p className="text-coral-red text-sm">{error}</p>}

        <div className="pt-2 border-t border-navy/10">
          {showResetConfirm ? (
            <div className="space-y-2">
              <p className="text-coral-red text-sm">
                Are you sure? This will delete all your data!
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Yes, Reset
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setShowResetConfirm(true)}
              className="w-full text-coral-red hover:text-coral-red"
            >
              Reset All Data
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
