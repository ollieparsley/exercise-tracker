import { Card, CardHeader } from "@/components/ui/Card";
import { useApp } from "@/hooks/useApp";
import { calculateDebt } from "@/lib/calculations";
import { getTodayKey } from "@/lib/date-utils";

export function TotalDebt() {
  const { state } = useApp();
  const todayKey = getTodayKey();
  const debt = calculateDebt(
    state.logs,
    state.settings.dailyGoal,
    state.settings.startDate,
    todayKey
  );

  const isPositive = debt >= 0;
  const displayValue = Math.abs(debt);

  return (
    <Card>
      <CardHeader>Cumulative Balance</CardHeader>

      <div className="flex items-baseline gap-2">
        <span
          className={`text-4xl font-bold tabular-nums ${
            isPositive ? "text-lime" : "text-coral-red"
          }`}
        >
          {isPositive ? "+" : "-"}
          {displayValue}
        </span>
        <span className="text-navy/60 text-sm">
          {isPositive ? "surplus" : "debt"}
        </span>
      </div>

      <p className="text-navy/50 text-sm mt-2">
        {isPositive
          ? "You're ahead of your goals!"
          : "Keep pushing to catch up!"}
      </p>
    </Card>
  );
}
