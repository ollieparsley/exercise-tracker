import { Card, CardHeader } from "@/components/ui/Card";
import { useApp } from "@/hooks/useApp";
import { getTodayProgress } from "@/lib/calculations";
import { getTodayKey } from "@/lib/date-utils";

export function TodayProgress() {
  const { state } = useApp();
  const todayKey = getTodayKey();
  const { total, goal, percentage } = getTodayProgress(
    state.logs,
    todayKey,
    state.settings.dailyGoal
  );

  const isComplete = total >= goal;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>Today&apos;s Progress</CardHeader>

      <div className="flex items-end justify-between mb-4">
        <div>
          <span
            className={`text-5xl font-bold tabular-nums ${
              isComplete ? "text-lime" : "text-navy"
            }`}
          >
            {total}
          </span>
          <span className="text-navy/60 text-2xl ml-1">/ {goal}</span>
        </div>
        <span
          className={`text-lg font-medium ${
            isComplete ? "text-lime" : "text-navy/60"
          }`}
        >
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-cream overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? "bg-lime" : "bg-blue"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={total}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label={`${total} of ${goal} completed`}
        />
      </div>

      {isComplete && (
        <div className="absolute top-4 right-4 text-lime text-sm font-medium">
          Complete
        </div>
      )}
    </Card>
  );
}
