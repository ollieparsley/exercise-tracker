import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/hooks/useApp";
import { aggregateLogsForChart } from "@/lib/calculations";
import { getDaysInCurrentMonth } from "@/lib/date-utils";

type ChartRange = "7d" | "14d" | "30d" | "mtd";

const rangeOptions: { value: ChartRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "14d", label: "14 Days" },
  { value: "30d", label: "30 Days" },
  { value: "mtd", label: "This Month" },
];

interface TooltipPayloadItem {
  value?: number | string;
  name?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  const total = payload.reduce((sum: number, entry: TooltipPayloadItem) => {
    const value = entry.value;
    return sum + (typeof value === "number" ? value : 0);
  }, 0);

  return (
    <div className="bg-cream border border-navy/20 p-3 shadow-lg">
      <p className="text-navy text-sm font-medium mb-1">{label}</p>
      {payload.map((entry: TooltipPayloadItem, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3" style={{ backgroundColor: entry.color }} />
          <span className="text-navy/70">{entry.name}:</span>
          <span className="text-navy font-medium">{entry.value}</span>
        </div>
      ))}
      <div className="border-t border-navy/20 mt-2 pt-2">
        <span className="text-navy/70 text-sm">Total: </span>
        <span className="text-blue font-medium">{total}</span>
      </div>
    </div>
  );
}

function getDaysForRange(range: ChartRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "14d":
      return 14;
    case "30d":
      return 30;
    case "mtd":
      return getDaysInCurrentMonth();
  }
}

export function PerformanceChart() {
  const { state } = useApp();
  const [range, setRange] = useState<ChartRange>("14d");

  const activeTypes = state.types.filter((t) => !t.isArchived);
  const days = getDaysForRange(range);
  const chartData = aggregateLogsForChart(
    state.logs,
    state.types,
    state.settings.dailyGoal,
    days
  );

  // Adjust x-axis interval based on range
  const xAxisInterval = days <= 7 ? 0 : days <= 14 ? 1 : 2;

  return (
    <Card noPadding className="pb-2">
      <div className="px-4 pt-4 flex items-center justify-between gap-2">
        <h3 className="text-navy font-medium">Performance</h3>
        <div className="flex gap-1">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`
                px-2 py-1 text-xs font-medium transition-colors
                ${
                  range === option.value
                    ? "bg-blue text-cream"
                    : "bg-mint text-navy/70 hover:text-navy"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="h-48"
        role="img"
        aria-label={`Bar chart showing exercise performance over ${days} days`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#1a1b41", fontSize: 10 }}
              interval={xAxisInterval}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#1a1b41", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <ReferenceLine
              y={state.settings.dailyGoal}
              stroke="#e63946"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            {activeTypes.map((type) => (
              <Bar
                key={type.id}
                dataKey={type.id}
                name={type.name}
                fill={type.color}
                stackId="stack"
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="px-4 pb-2 flex flex-wrap gap-4">
        {activeTypes.map((type) => (
          <div key={type.id} className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: type.color }} />
            <span className="text-navy/70 text-xs">{type.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-0.5 bg-coral-red"
            style={{ borderStyle: "dashed" }}
          />
          <span className="text-navy/70 text-xs">Daily Goal</span>
        </div>
      </div>
    </Card>
  );
}
