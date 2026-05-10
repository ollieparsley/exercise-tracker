import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/hooks/useApp";
import {
  aggregateMeasurementsForChart,
  getPopulatedMeasurementFields,
  type MeasurementField,
} from "@/lib/calculations";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { getDaysForRange, type ChartRange } from "@/lib/timeRange";

type Axis = "kg" | "cm";

interface FieldDef {
  key: MeasurementField;
  label: string;
  axis: Axis;
  color: string;
}

const FIELD_DEFS: FieldDef[] = [
  { key: "weightKg", label: "Weight", axis: "kg", color: "#6290C3" },
  { key: "waistCm", label: "Waist", axis: "cm", color: "#F39C12" },
  { key: "thighCm", label: "Thigh", axis: "cm", color: "#27AE60" },
  { key: "bicepCm", label: "Bicep", axis: "cm", color: "#9B59B6" },
  { key: "hipsCm", label: "Hips", axis: "cm", color: "#E91E63" },
  { key: "chestCm", label: "Chest", axis: "cm", color: "#E74C3C" },
  { key: "neckCm", label: "Neck", axis: "cm", color: "#1ABC9C" },
  { key: "wristCm", label: "Wrist", axis: "cm", color: "#7F8C8D" },
];

const FIELD_DEFS_BY_KEY: Record<MeasurementField, FieldDef> = FIELD_DEFS.reduce(
  (acc, def) => {
    acc[def.key] = def;
    return acc;
  },
  {} as Record<MeasurementField, FieldDef>
);

interface TooltipPayloadItem {
  value?: number | string;
  name?: string;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-cream border border-navy/20 p-3 shadow-lg">
      <p className="text-navy text-sm font-medium mb-1">{label}</p>
      {payload.map((entry, index) => {
        if (typeof entry.value !== "number") return null;
        const def = FIELD_DEFS_BY_KEY[entry.dataKey as MeasurementField];
        const unit = def?.axis ?? "";
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3" style={{ backgroundColor: entry.color }} />
            <span className="text-navy/70">{entry.name}:</span>
            <span className="text-navy font-medium tabular-nums">
              {entry.value.toFixed(2)} {unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MeasurementChart() {
  const { state } = useApp();
  const [range, setRange] = useState<ChartRange>("30d");

  // No card at all until the user has saved at least one measurement.
  // The MeasurementLogger on /log surfaces the "where to add data" hint;
  // rendering an empty placeholder here was bloating the mobile dashboard
  // and intercepting bottom-nav clicks in Playwright.
  if (state.measurements.length === 0) {
    return null;
  }

  const days = getDaysForRange(range);
  const chartData = aggregateMeasurementsForChart(state.measurements, days);
  const populated = getPopulatedMeasurementFields(chartData);
  const hasAnyData = populated.length > 0;

  const usesKg = populated.some((key) => FIELD_DEFS_BY_KEY[key].axis === "kg");
  const usesCm = populated.some((key) => FIELD_DEFS_BY_KEY[key].axis === "cm");

  const xAxisInterval = days <= 7 ? 0 : days <= 14 ? 1 : days <= 30 ? 2 : 4;

  return (
    <Card noPadding className="pb-2">
      <div className="px-4 pt-4 flex items-center justify-between gap-2">
        <h3 className="text-navy font-medium">Body Measurements</h3>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      {!hasAnyData ? (
        <div className="px-4 py-8 text-center text-navy/70 text-sm">
          No measurements recorded in this period. Try a longer time range, or
          log a new measurement on the Log page.
        </div>
      ) : (
        <div
          className="h-56"
          role="img"
          aria-label={`Line chart of body measurements over ${days} days`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#1a1b41", fontSize: 10 }}
                interval={xAxisInterval}
              />
              {usesKg && (
                <YAxis
                  yAxisId="kg"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#1a1b41", fontSize: 10 }}
                  domain={["auto", "auto"]}
                  width={36}
                  tickFormatter={(v: number) => `${v}kg`}
                />
              )}
              {usesCm && (
                <YAxis
                  yAxisId="cm"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#1a1b41", fontSize: 10 }}
                  domain={["auto", "auto"]}
                  width={40}
                  tickFormatter={(v: number) => `${v}cm`}
                />
              )}
              {/* Single fallback axis so the chart still renders if neither
                  unit appears (shouldn't happen because we guard above, but
                  keeps recharts happy if one of the booleans flips false). */}
              {!usesKg && !usesCm && <YAxis yAxisId="kg" hide />}
              <Tooltip content={<CustomTooltip />} />
              {populated.map((key) => {
                const def = FIELD_DEFS_BY_KEY[key];
                return (
                  <Line
                    key={key}
                    yAxisId={def.axis}
                    type="monotone"
                    dataKey={key}
                    name={def.label}
                    stroke={def.color}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasAnyData && (
        <div className="px-4 pb-2 flex flex-wrap gap-x-4 gap-y-1">
          {populated.map((key) => {
            const def = FIELD_DEFS_BY_KEY[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-0.5"
                  style={{ backgroundColor: def.color }}
                />
                <span className="text-navy/70 text-xs">
                  {def.label} ({def.axis})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
