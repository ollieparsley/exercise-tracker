import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/hooks/useApp";
import { aggregateLogsForChart } from "@/lib/calculations";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { getDaysForRange, type ChartRange } from "@/lib/timeRange";

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

export function PerformanceChart() {
  const { state } = useApp();
  const [range, setRange] = useState<ChartRange>("14d");

  const activeTypes = state.types.filter((t) => !t.isArchived);
  const days = getDaysForRange(range);
  const chartData = aggregateLogsForChart(
    state.logs,
    state.types,
    state.settings.dailyGoal,
    days,
    undefined,
    state.breaks
  );

  // Find visible break ranges within the current chart window
  const visibleBreaks = state.breaks
    .map((b) => {
      const start = chartData.find((d) => d.dateKey >= b.startDate);
      const end = [...chartData].reverse().find((d) => d.dateKey <= b.endDate);
      if (!start || !end) return null;
      return { id: b.id, label: b.label, x1: start.label, x2: end.label };
    })
    .filter(Boolean) as {
    id: string;
    label?: string;
    x1: string;
    x2: string;
  }[];

  // Adjust x-axis interval based on range
  const xAxisInterval = days <= 7 ? 0 : days <= 14 ? 1 : days <= 30 ? 2 : 4;

  return (
    <Card noPadding className="pb-2">
      <div className="px-4 pt-4 flex items-center justify-between gap-2">
        <h3 className="text-navy font-medium">Performance</h3>
        <TimeRangeSelector value={range} onChange={setRange} />
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
              domain={[
                0,
                (dataMax: number) =>
                  Math.max(dataMax, state.settings.dailyGoal, 10),
              ]}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <ReferenceLine
              y={state.settings.dailyGoal}
              stroke="#e63946"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            {visibleBreaks.map((vb) => (
              <ReferenceArea
                key={vb.id}
                x1={vb.x1}
                x2={vb.x2}
                fill="#e63946"
                fillOpacity={0.18}
                stroke="#e63946"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
                ifOverflow="extendDomain"
                label={{
                  value: vb.label ?? "Break",
                  position: "insideTopLeft",
                  fontSize: 9,
                  fontWeight: 600,
                  fill: "#e63946",
                  offset: 4,
                }}
              />
            ))}
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
        {visibleBreaks.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-coral-red/20 border border-coral-red/40" />
            <span className="text-navy/70 text-xs">Break</span>
          </div>
        )}
      </div>
    </Card>
  );
}
