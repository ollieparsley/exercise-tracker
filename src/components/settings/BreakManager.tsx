import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/hooks/useApp";
import { getTodayKey } from "@/lib/date-utils";
import type { Break } from "@/types";

function formatRange(b: Break): string {
  const start = new Date(b.startDate + "T00:00:00").toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );
  const end = new Date(b.endDate + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return start === end ? start : `${start} – ${end}`;
}

interface BreakFormProps {
  initial?: Break;
  onSave: (b: Break) => void;
  onCancel: () => void;
}

function BreakForm({ initial, onSave, onCancel }: BreakFormProps) {
  const todayKey = getTodayKey();
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    if (!startDate || !endDate) {
      setError("Both start and end dates are required.");
      return;
    }
    if (startDate > endDate) {
      setError("Start date must be on or before end date.");
      return;
    }
    onSave({
      id: initial?.id ?? uuidv4(),
      startDate,
      endDate,
      label: label.trim() || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={todayKey}
        />
        <Input
          label="End date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || undefined}
          max={todayKey}
        />
      </div>
      <Input
        label="Label (optional)"
        type="text"
        placeholder="e.g. Illness, Holiday"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        maxLength={40}
      />
      {error && <p className="text-coral-red text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save break</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function BreakManager() {
  const { state, dispatch } = useApp();

  // null = no form open; "new" = adding; string id = editing that break
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const handleAdd = (b: Break) => {
    dispatch({ type: "ADD_BREAK", payload: b });
    setEditing(null);
  };

  const handleUpdate = (b: Break) => {
    dispatch({ type: "UPDATE_BREAK", payload: b });
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader>Rest &amp; Break Periods</CardHeader>

      {state.breaks.length === 0 && editing === null && (
        <p className="text-navy/50 text-sm mb-3">
          No breaks recorded. Add one to pause the daily goal for a date range.
        </p>
      )}

      {state.breaks.length > 0 && (
        <ul className="space-y-2 mb-4">
          {state.breaks.map((b) => (
            <li key={b.id}>
              {editing === b.id ? (
                <div className="py-2">
                  <BreakForm
                    initial={b}
                    onSave={handleUpdate}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between py-2 border-b border-navy/10 last:border-0">
                  <div>
                    <p className="text-navy text-sm font-medium">
                      {b.label ? b.label : "Break"}
                    </p>
                    <p className="text-navy/60 text-xs">{formatRange(b)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing(b.id)}
                      aria-label={`Edit break ${b.label ?? formatRange(b)}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        dispatch({ type: "DELETE_BREAK", payload: b.id })
                      }
                      aria-label={`Delete break ${b.label ?? formatRange(b)}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing === "new" ? (
        <BreakForm onSave={handleAdd} onCancel={() => setEditing(null)} />
      ) : (
        editing === null && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing("new")}
          >
            + Add break period
          </Button>
        )
      )}
    </Card>
  );
}

