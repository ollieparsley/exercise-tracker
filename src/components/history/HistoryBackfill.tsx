import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SessionLogger } from "@/components/session/SessionLogger";
import { useApp } from "@/hooks/useApp";
import {
  getTodayKey,
  formatDateLabel,
  isPast,
  isToday,
} from "@/lib/date-utils";
import { getTotalForDate } from "@/lib/calculations";

export function HistoryBackfill() {
  const { state } = useApp();
  const todayKey = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const isSelectedToday = isToday(selectedDate);
  const isSelectedPast = isPast(selectedDate);
  const total = getTotalForDate(state.logs, selectedDate);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>Select Date</CardHeader>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={todayKey}
          aria-label="Select date to backfill"
        />
        {selectedDate && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-navy">
              {formatDateLabel(selectedDate)}
              {isSelectedToday && " (Today)"}
            </span>
            <span className="text-blue font-bold">Total: {total}</span>
          </div>
        )}
      </Card>

      {selectedDate && (isSelectedToday || isSelectedPast) && (
        <SessionLogger dateKey={selectedDate} />
      )}
    </div>
  );
}
