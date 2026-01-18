import { type ChangeEvent, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/hooks/useApp";

export function GoalSettings() {
  const { state, dispatch } = useApp();
  const [goalInput, setGoalInput] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState<string | null>(null);

  // Use input state if user has modified, otherwise use stored state
  const goal = goalInput ?? state.settings.dailyGoal.toString();
  const startDate = dateInput ?? state.settings.startDate;

  const handleGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setGoalInput(val);
    }
  };

  const handleGoalSave = () => {
    const value = parseInt(goal, 10);
    if (!isNaN(value) && value >= 0) {
      dispatch({ type: "SET_DAILY_GOAL", payload: value });
      setGoalInput(null); // Reset to use stored state
    }
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
  };

  const handleStartDateSave = () => {
    if (startDate) {
      dispatch({ type: "SET_START_DATE", payload: startDate });
      setDateInput(null); // Reset to use stored state
    }
  };

  const goalChanged = goal !== state.settings.dailyGoal.toString();
  const dateChanged = startDate !== state.settings.startDate;

  return (
    <Card>
      <CardHeader>Goal Settings</CardHeader>

      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Daily Goal"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={goal}
              onChange={handleGoalChange}
            />
          </div>
          <Button
            onClick={handleGoalSave}
            disabled={!goalChanged || !goal}
            variant={goalChanged ? "primary" : "secondary"}
          >
            Save
          </Button>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Tracking Start Date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <Button
            onClick={handleStartDateSave}
            disabled={!dateChanged || !startDate}
            variant={dateChanged ? "primary" : "secondary"}
          >
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
