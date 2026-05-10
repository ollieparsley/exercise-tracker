import type {
  LogEntry,
  ExerciseType,
  ChartDataPoint,
  Break,
  Measurement,
} from "@/types";
import { getLastNDays, formatDateLabel, getDateKey } from "./date-utils";

export type MeasurementField =
  | "weightKg"
  | "waistCm"
  | "thighCm"
  | "bicepCm"
  | "hipsCm"
  | "chestCm"
  | "neckCm"
  | "wristCm";

export const MEASUREMENT_FIELDS: readonly MeasurementField[] = [
  "weightKg",
  "waistCm",
  "thighCm",
  "bicepCm",
  "hipsCm",
  "chestCm",
  "neckCm",
  "wristCm",
] as const;

export interface MeasurementChartDataPoint {
  dateKey: string;
  label: string;
  weightKg?: number;
  waistCm?: number;
  thighCm?: number;
  bicepCm?: number;
  hipsCm?: number;
  chestCm?: number;
  neckCm?: number;
  wristCm?: number;
}

/**
 * Gets the total exercise count for a specific date
 */
export function getTotalForDate(logs: LogEntry[], dateKey: string): number {
  return logs
    .filter((log) => log.dateKey === dateKey)
    .reduce((sum, log) => sum + log.count, 0);
}

/**
 * Gets the breakdown of exercise counts by type for a specific date
 */
export function getBreakdownForDate(
  logs: LogEntry[],
  dateKey: string
): Map<string, number> {
  const breakdown = new Map<string, number>();

  logs
    .filter((log) => log.dateKey === dateKey)
    .forEach((log) => {
      const current = breakdown.get(log.typeId) ?? 0;
      breakdown.set(log.typeId, current + log.count);
    });

  return breakdown;
}

/**
 * Gets today's progress (total count vs goal)
 */
export function getTodayProgress(
  logs: LogEntry[],
  todayKey: string,
  dailyGoal: number
): { total: number; goal: number; percentage: number } {
  const total = getTotalForDate(logs, todayKey);
  const percentage =
    dailyGoal > 0 ? Math.min((total / dailyGoal) * 100, 100) : 0;

  return { total, goal: dailyGoal, percentage };
}

/**
 * Calculates cumulative debt/surplus from start date to today
 * Positive = surplus, Negative = debt
 * Days within a break period are excluded from the required total
 */
export function calculateDebt(
  logs: LogEntry[],
  dailyGoal: number,
  startDateKey: string,
  todayKey: string,
  breaks: Break[] = []
): number {
  // If start date is in the future, no debt yet
  if (startDateKey > todayKey) {
    return 0;
  }

  // Count active days (not within any break period)
  let activeDays = 0;
  const cursor = new Date(startDateKey + "T00:00:00");
  const end = new Date(todayKey + "T00:00:00");
  while (cursor <= end) {
    const key = getDateKey(cursor);
    const inBreak = breaks.some((b) => key >= b.startDate && key <= b.endDate);
    if (!inBreak) activeDays++;
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalRequired = activeDays * dailyGoal;

  // Sum all logs from start date to today (inclusive)
  const totalCompleted = logs
    .filter((log) => log.dateKey >= startDateKey && log.dateKey <= todayKey)
    .reduce((sum, log) => sum + log.count, 0);

  return totalCompleted - totalRequired;
}

/**
 * Aggregates logs into chart data for the last N days
 */
export function aggregateLogsForChart(
  logs: LogEntry[],
  types: ExerciseType[],
  dailyGoal: number,
  days: number = 14,
  endDate?: Date,
  breaks: Break[] = []
): ChartDataPoint[] {
  const dateKeys = getLastNDays(days, endDate);
  const activeTypes = types.filter((t) => !t.isArchived);

  return dateKeys.map((dateKey) => {
    const breakdown = getBreakdownForDate(logs, dateKey);
    const isBreak = breaks.some(
      (b) => dateKey >= b.startDate && dateKey <= b.endDate
    );

    const dataPoint: ChartDataPoint = {
      dateKey,
      label: formatDateLabel(dateKey, "short"),
      goal: dailyGoal,
      isBreak,
    };

    // Add counts for each type
    activeTypes.forEach((type) => {
      dataPoint[type.id] = breakdown.get(type.id) ?? 0;
    });

    return dataPoint;
  });
}

/**
 * Aggregates body measurements into chart-ready points for the last N days.
 * When multiple measurements share a dateKey, the one with the latest
 * timestamp wins. Days with no measurement get a point with every metric
 * left undefined so the line chart can connectNulls across gaps.
 */
export function aggregateMeasurementsForChart(
  measurements: Measurement[],
  days: number = 14,
  endDate?: Date
): MeasurementChartDataPoint[] {
  const dateKeys = getLastNDays(days, endDate);

  const latestByDate = new Map<string, Measurement>();
  for (const m of measurements) {
    const existing = latestByDate.get(m.dateKey);
    if (!existing || m.timestamp > existing.timestamp) {
      latestByDate.set(m.dateKey, m);
    }
  }

  return dateKeys.map((dateKey) => {
    const m = latestByDate.get(dateKey);
    return {
      dateKey,
      label: formatDateLabel(dateKey, "short"),
      weightKg: m?.weightKg,
      waistCm: m?.waistCm,
      thighCm: m?.thighCm,
      bicepCm: m?.bicepCm,
      hipsCm: m?.hipsCm,
      chestCm: m?.chestCm,
      neckCm: m?.neckCm,
      wristCm: m?.wristCm,
    };
  });
}

/**
 * Returns the subset of measurement fields that have at least one numeric
 * value across the supplied chart points. Used to hide lines/legend entries
 * for metrics the user has never logged in the current window.
 */
export function getPopulatedMeasurementFields(
  points: MeasurementChartDataPoint[]
): MeasurementField[] {
  return MEASUREMENT_FIELDS.filter((field) =>
    points.some((p) => typeof p[field] === "number")
  );
}

/**
 * Gets total count across all logs
 */
export function getTotalCount(logs: LogEntry[]): number {
  return logs.reduce((sum, log) => sum + log.count, 0);
}

/**
 * Gets logs for a specific date, sorted by timestamp (newest first)
 */
export function getLogsForDate(logs: LogEntry[], dateKey: string): LogEntry[] {
  return logs
    .filter((log) => log.dateKey === dateKey)
    .sort((a, b) => b.timestamp - a.timestamp);
}
