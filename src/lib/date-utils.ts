/**
 * Returns a date key in YYYY-MM-DD format for a given date
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date key in YYYY-MM-DD format
 */
export function getTodayKey(): string {
  return getDateKey(new Date());
}

/**
 * Calculates the number of days between two date keys (inclusive)
 */
export function daysBetween(startKey: string, endKey: string): number {
  const start = new Date(startKey);
  const end = new Date(endKey);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // inclusive
}

/**
 * Returns an array of the last N days' date keys, ending with today
 */
export function getLastNDays(n: number, endDate?: Date): string[] {
  const end = endDate ?? new Date();
  const days: string[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);
    days.push(getDateKey(date));
  }

  return days;
}

/**
 * Formats a date key for display (e.g., "Jan 15" or "Mon")
 */
export function formatDateLabel(
  dateKey: string,
  format: "short" | "weekday" = "short"
): string {
  const date = new Date(dateKey);

  if (format === "weekday") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Parses a date key string into a Date object
 */
export function parseDate(dateKey: string): Date {
  return new Date(dateKey);
}

/**
 * Checks if a date key is today
 */
export function isToday(dateKey: string): boolean {
  return dateKey === getTodayKey();
}

/**
 * Checks if a date key is in the past
 */
export function isPast(dateKey: string): boolean {
  return dateKey < getTodayKey();
}

/**
 * Checks if a date key is in the future
 */
export function isFuture(dateKey: string): boolean {
  return dateKey > getTodayKey();
}

/**
 * Returns the number of days from start of month to today (inclusive)
 */
export function getDaysInCurrentMonth(): number {
  const today = new Date();
  return today.getDate();
}

/**
 * Returns an array of date keys from start of current month to today
 */
export function getMonthToDateKeys(): string[] {
  const today = new Date();
  const daysInMonth = today.getDate();
  return getLastNDays(daysInMonth);
}
