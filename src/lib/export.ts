import type { AppState, LogEntry, ExerciseType } from "@/types";
import { validateAppState } from "./validation";
import * as XLSX from "xlsx";

/**
 * Generates CSV content from logs
 */
export function generateCSV(logs: LogEntry[], types: ExerciseType[]): string {
  const typeMap = new Map(types.map((t) => [t.id, t.name]));
  const headers = ["Date", "Type", "Count", "Timestamp"];
  const rows = logs.map((log) => [
    log.dateKey,
    typeMap.get(log.typeId) ?? "Unknown",
    log.count.toString(),
    new Date(log.timestamp).toISOString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
}

/**
 * Triggers a download of a file
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads logs as CSV
 */
export function downloadCSV(logs: LogEntry[], types: ExerciseType[]): void {
  const csv = generateCSV(logs, types);
  const date = new Date().toISOString().split("T")[0];
  downloadFile(csv, `exercise-tracker-${date}.csv`, "text/csv");
}

/**
 * Formats a timestamp to time string (HH:MM:SS)
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Downloads logs as Excel file
 */
export function downloadExcel(logs: LogEntry[], types: ExerciseType[]): void {
  const typeMap = new Map(types.map((t) => [t.id, t.name]));

  // Prepare data for Excel
  const data = logs.map((log) => ({
    Date: log.dateKey,
    Time: formatTime(log.timestamp),
    Type: typeMap.get(log.typeId) ?? "Unknown",
    Count: log.count,
    Timestamp: new Date(log.timestamp).toISOString(),
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Exercise Logs");

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 15 }, // Type
    { wch: 8 }, // Count
    { wch: 25 }, // Timestamp
  ];

  // Generate and download
  const date = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `exercise-tracker-${date}.xlsx`);
}

/**
 * Downloads full state as JSON
 */
export function downloadJSON(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const date = new Date().toISOString().split("T")[0];
  downloadFile(
    json,
    `exercise-tracker-backup-${date}.json`,
    "application/json"
  );
}

/**
 * Parses a JSON file and validates it as AppState
 */
export async function parseJSONFile(
  file: File
): Promise<
  { success: true; data: AppState } | { success: false; error: string }
> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const validation = validateAppState(data);

    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid data: ${validation.errors.join(", ")}`,
      };
    }

    return { success: true, data: data as AppState };
  } catch {
    return { success: false, error: "Failed to parse JSON file" };
  }
}
