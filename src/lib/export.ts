import type { AppState, LogEntry, ExerciseType, Measurement } from "@/types";
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

const MEASUREMENT_HEADERS = [
  "Date",
  "Time",
  "Weight (kg)",
  "Waist (cm)",
  "Thigh (cm)",
  "Bicep (cm)",
  "Hips (cm)",
  "Chest (cm)",
  "Neck (cm)",
  "Wrist (cm)",
  "Timestamp",
] as const;

/**
 * Builds an Excel workbook with two sheets: Exercise Logs and Body Measurements.
 * Extracted from downloadExcel so unit tests can assert structure without
 * triggering a file download.
 */
export function buildExcelWorkbook(
  logs: LogEntry[],
  types: ExerciseType[],
  measurements: Measurement[]
): XLSX.WorkBook {
  const typeMap = new Map(types.map((t) => [t.id, t.name]));
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Exercise Logs
  const logData = logs.map((log) => ({
    Date: log.dateKey,
    Time: formatTime(log.timestamp),
    Type: typeMap.get(log.typeId) ?? "Unknown",
    Count: log.count,
    Timestamp: new Date(log.timestamp).toISOString(),
  }));

  const logSheet = XLSX.utils.json_to_sheet(logData);
  logSheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 15 }, // Type
    { wch: 8 }, // Count
    { wch: 25 }, // Timestamp
  ];
  XLSX.utils.book_append_sheet(workbook, logSheet, "Exercise Logs");

  // Sheet 2: Body Measurements
  const sortedMeasurements = [...measurements].sort(
    (a, b) => a.timestamp - b.timestamp
  );
  const measurementData = sortedMeasurements.map((m) => ({
    Date: m.dateKey,
    Time: formatTime(m.timestamp),
    "Weight (kg)": m.weightKg,
    "Waist (cm)": m.waistCm,
    "Thigh (cm)": m.thighCm,
    "Bicep (cm)": m.bicepCm,
    "Hips (cm)": m.hipsCm,
    "Chest (cm)": m.chestCm,
    "Neck (cm)": m.neckCm,
    "Wrist (cm)": m.wristCm,
    Timestamp: new Date(m.timestamp).toISOString(),
  }));

  const measurementSheet = XLSX.utils.json_to_sheet(measurementData, {
    header: [...MEASUREMENT_HEADERS],
  });
  measurementSheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 12 }, // Weight (kg)
    { wch: 11 }, // Waist (cm)
    { wch: 11 }, // Thigh (cm)
    { wch: 11 }, // Bicep (cm)
    { wch: 10 }, // Hips (cm)
    { wch: 11 }, // Chest (cm)
    { wch: 10 }, // Neck (cm)
    { wch: 10 }, // Wrist (cm)
    { wch: 25 }, // Timestamp
  ];

  // Apply 2-decimal number format to measurement value cells
  for (let row = 1; row <= sortedMeasurements.length; row++) {
    for (let col = 2; col <= 9; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = measurementSheet[cellRef];
      if (cell && typeof cell.v === "number") {
        cell.z = "0.00";
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, measurementSheet, "Body Measurements");

  return workbook;
}

/**
 * Downloads logs and measurements as an Excel file
 */
export function downloadExcel(
  logs: LogEntry[],
  types: ExerciseType[],
  measurements: Measurement[]
): void {
  const workbook = buildExcelWorkbook(logs, types, measurements);
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

    if (!data || typeof data !== "object") {
      return { success: false, error: "Invalid data: not an object" };
    }

    // Normalise legacy backups (missing optional arrays) BEFORE validating so
    // the strict validateAppState contract holds for older files.
    const normalised = data as Record<string, unknown>;
    if (normalised.breaks === undefined) {
      normalised.breaks = [];
    }
    if (normalised.measurements === undefined) {
      normalised.measurements = [];
    }

    const validation = validateAppState(normalised);

    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid data: ${validation.errors.join(", ")}`,
      };
    }

    return { success: true, data: normalised as unknown as AppState };
  } catch {
    return { success: false, error: "Failed to parse JSON file" };
  }
}
