import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/hooks/useApp";
import { getTodayKey } from "@/lib/date-utils";
import { validateMeasurement } from "@/lib/validation";
import type { Measurement } from "@/types";

type FieldKey =
  | "weightKg"
  | "waistCm"
  | "thighCm"
  | "bicepCm"
  | "hipsCm"
  | "chestCm"
  | "neckCm"
  | "wristCm";

interface FieldDef {
  key: FieldKey;
  label: string;
  unit: string;
}

const FIELDS: FieldDef[] = [
  { key: "weightKg", label: "Weight", unit: "kg" },
  { key: "waistCm", label: "Waist", unit: "cm" },
  { key: "thighCm", label: "Thigh", unit: "cm" },
  { key: "bicepCm", label: "Bicep", unit: "cm" },
  { key: "hipsCm", label: "Hips", unit: "cm" },
  { key: "chestCm", label: "Chest", unit: "cm" },
  { key: "neckCm", label: "Neck", unit: "cm" },
  { key: "wristCm", label: "Wrist", unit: "cm" },
];

const EMPTY_VALUES: Record<FieldKey, string> = {
  weightKg: "",
  waistCm: "",
  thighCm: "",
  bicepCm: "",
  hipsCm: "",
  chestCm: "",
  neckCm: "",
  wristCm: "",
};

interface MeasurementLoggerProps {
  dateKey?: string;
}

export function MeasurementLogger({ dateKey }: MeasurementLoggerProps) {
  const { state, dispatch } = useApp();
  const targetDate = dateKey ?? getTodayKey();
  const [values, setValues] = useState<Record<FieldKey, string>>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);

  const measurementsForDate = state.measurements.filter(
    (m) => m.dateKey === targetDate
  );

  const handleChange = (key: FieldKey, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw }));
  };

  const handleSave = () => {
    setError(null);

    const numericValues: Partial<Record<FieldKey, number>> = {};
    let anyEntered = false;
    for (const { key } of FIELDS) {
      const raw = values[key].trim();
      if (raw === "") continue;
      const parsed = parseFloat(raw);
      if (Number.isNaN(parsed)) {
        setError(`${key} is not a valid number`);
        return;
      }
      numericValues[key] = Math.round(parsed * 100) / 100;
      anyEntered = true;
    }

    if (!anyEntered) {
      setError("Enter at least one measurement");
      return;
    }

    const measurement: Measurement = {
      id: uuidv4(),
      timestamp: Date.now(),
      dateKey: targetDate,
      ...numericValues,
    };

    const validation = validateMeasurement(measurement);
    if (!validation.valid) {
      setError(validation.errors.join("; "));
      return;
    }

    dispatch({ type: "ADD_MEASUREMENT", payload: measurement });
    setValues(EMPTY_VALUES);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_MEASUREMENT", payload: id });
  };

  const formatMeasurement = (m: Measurement): string => {
    const parts: string[] = [];
    if (m.weightKg !== undefined) parts.push(`${m.weightKg.toFixed(2)} kg`);
    if (m.waistCm !== undefined) parts.push(`${m.waistCm.toFixed(2)} cm waist`);
    if (m.thighCm !== undefined) parts.push(`${m.thighCm.toFixed(2)} cm thigh`);
    if (m.bicepCm !== undefined) parts.push(`${m.bicepCm.toFixed(2)} cm bicep`);
    if (m.hipsCm !== undefined) parts.push(`${m.hipsCm.toFixed(2)} cm hips`);
    if (m.chestCm !== undefined) parts.push(`${m.chestCm.toFixed(2)} cm chest`);
    if (m.neckCm !== undefined) parts.push(`${m.neckCm.toFixed(2)} cm neck`);
    if (m.wristCm !== undefined) parts.push(`${m.wristCm.toFixed(2)} cm wrist`);
    return parts.join(" · ");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>Body Measurements</CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {FIELDS.map(({ key, label, unit }) => (
            <Input
              key={key}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              label={`${label} (${unit})`}
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              aria-label={`${label} in ${unit}`}
              placeholder="0.00"
            />
          ))}
        </div>
        {error && (
          <p className="text-coral-red text-sm mt-3" role="alert">
            {error}
          </p>
        )}
        <div className="mt-3">
          <Button onClick={handleSave}>Save Measurements</Button>
        </div>
      </Card>

      {measurementsForDate.length > 0 && (
        <Card>
          <CardHeader>Today&apos;s Measurements</CardHeader>
          <ul className="space-y-2">
            {measurementsForDate.map((m) => (
              <li
                key={m.id}
                className="flex items-start justify-between gap-3 py-2 border-b border-navy/10 last:border-0"
              >
                <span className="text-navy text-sm">
                  {formatMeasurement(m)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(m.id)}
                  aria-label="Delete measurement"
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
