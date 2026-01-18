import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TypeSelector } from "./TypeSelector";
import { QuickActions } from "./QuickActions";
import { CountInput } from "./CountInput";
import { useApp } from "@/hooks/useApp";
import { getTodayKey } from "@/lib/date-utils";
import { getLogsForDate } from "@/lib/calculations";
import type { LogEntry } from "@/types";

interface SessionLoggerProps {
  dateKey?: string;
}

export function SessionLogger({ dateKey }: SessionLoggerProps) {
  const { state, dispatch } = useApp();
  const activeTypes = state.types.filter((t) => !t.isArchived);
  const [selectedTypeId, setSelectedTypeId] = useState(
    activeTypes[0]?.id ?? ""
  );

  const targetDate = dateKey ?? getTodayKey();
  const logsForDate = getLogsForDate(state.logs, targetDate);

  const handleLog = (count: number) => {
    if (!selectedTypeId || count === 0) return;
    const entry: LogEntry = {
      id: uuidv4(),
      // eslint-disable-next-line react-hooks/purity -- timestamp is only needed when event fires
      timestamp: Date.now(),
      dateKey: targetDate,
      typeId: selectedTypeId,
      count,
    };
    dispatch({ type: "ADD_LOG", payload: entry });
  };

  const handleDelete = (logId: string) => {
    dispatch({ type: "DELETE_LOG", payload: logId });
  };

  const getTypeName = (typeId: string) => {
    return state.types.find((t) => t.id === typeId)?.name ?? "Unknown";
  };

  const getTypeColor = (typeId: string) => {
    return state.types.find((t) => t.id === typeId)?.color ?? "#1a1b41";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>Exercise Type</CardHeader>
        <TypeSelector
          selectedTypeId={selectedTypeId}
          onSelect={setSelectedTypeId}
        />
      </Card>

      <Card>
        <CardHeader>Quick Add</CardHeader>
        <QuickActions onAdd={handleLog} disabled={!selectedTypeId} />
      </Card>

      <Card>
        <CardHeader>Custom Amount</CardHeader>
        <CountInput onSubmit={handleLog} disabled={!selectedTypeId} />
      </Card>

      {logsForDate.length > 0 && (
        <Card>
          <CardHeader>Today&apos;s Entries</CardHeader>
          <ul className="space-y-2">
            {logsForDate.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-navy/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3"
                    style={{ backgroundColor: getTypeColor(log.typeId) }}
                  />
                  <span className="text-navy">{getTypeName(log.typeId)}</span>
                  <span className="text-blue font-bold tabular-nums">
                    {log.count > 0 ? "+" : ""}
                    {log.count}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(log.id)}
                  aria-label={`Delete ${log.count} ${getTypeName(log.typeId)}`}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
