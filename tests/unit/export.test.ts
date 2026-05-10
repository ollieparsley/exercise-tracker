import { describe, it, expect, vi, beforeEach } from "vitest";
import * as XLSX from "xlsx";
import { buildExcelWorkbook, generateCSV, parseJSONFile } from "@/lib/export";
import type { LogEntry, ExerciseType, AppState, Measurement } from "@/types";

describe("export", () => {
  describe("generateCSV", () => {
    const mockTypes: ExerciseType[] = [
      { id: "type-1", name: "Standard", color: "#87F5FB", isArchived: false },
      { id: "type-2", name: "Chair Dips", color: "#DE3C4B", isArchived: false },
    ];

    it("should generate CSV with headers for empty logs", () => {
      const csv = generateCSV([], mockTypes);
      expect(csv).toBe('"Date","Type","Count","Timestamp"');
    });

    it("should generate CSV rows for logs", () => {
      const logs: LogEntry[] = [
        {
          id: "log-1",
          timestamp: new Date("2024-01-15T10:00:00Z").getTime(),
          dateKey: "2024-01-15",
          typeId: "type-1",
          count: 30,
        },
        {
          id: "log-2",
          timestamp: new Date("2024-01-15T14:00:00Z").getTime(),
          dateKey: "2024-01-15",
          typeId: "type-2",
          count: 20,
        },
      ];

      const csv = generateCSV(logs, mockTypes);
      const lines = csv.split("\n");

      expect(lines.length).toBe(3);
      expect(lines[0]).toBe('"Date","Type","Count","Timestamp"');
      expect(lines[1]).toContain('"2024-01-15"');
      expect(lines[1]).toContain('"Standard"');
      expect(lines[1]).toContain('"30"');
      expect(lines[2]).toContain('"Chair Dips"');
      expect(lines[2]).toContain('"20"');
    });

    it("should handle unknown type IDs", () => {
      const logs: LogEntry[] = [
        {
          id: "log-1",
          timestamp: Date.now(),
          dateKey: "2024-01-15",
          typeId: "unknown-type",
          count: 10,
        },
      ];

      const csv = generateCSV(logs, mockTypes);
      expect(csv).toContain('"Unknown"');
    });

    it("should escape quotes in type names", () => {
      const typesWithQuotes: ExerciseType[] = [
        {
          id: "type-1",
          name: 'Test "Type"',
          color: "#FFFFFF",
          isArchived: false,
        },
      ];
      const logs: LogEntry[] = [
        {
          id: "log-1",
          timestamp: Date.now(),
          dateKey: "2024-01-15",
          typeId: "type-1",
          count: 10,
        },
      ];

      const csv = generateCSV(logs, typesWithQuotes);
      expect(csv).toContain('"Test "Type""');
    });
  });

  describe("buildExcelWorkbook", () => {
    const types: ExerciseType[] = [
      { id: "type-1", name: "Standard", color: "#87F5FB", isArchived: false },
    ];
    const logs: LogEntry[] = [
      {
        id: "log-1",
        timestamp: new Date("2024-01-15T10:00:00Z").getTime(),
        dateKey: "2024-01-15",
        typeId: "type-1",
        count: 30,
      },
    ];

    const expectedHeaders = [
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
    ];

    it("creates a workbook with both expected sheets", () => {
      const workbook = buildExcelWorkbook(logs, types, []);
      expect(workbook.SheetNames).toEqual([
        "Exercise Logs",
        "Body Measurements",
      ]);
    });

    it("Body Measurements sheet header row contains units", () => {
      const workbook = buildExcelWorkbook(logs, types, []);
      const sheet = workbook.Sheets["Body Measurements"];
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      expect(rows[0]).toEqual(expectedHeaders);
    });

    it("appends Body Measurements sheet even when measurements are empty", () => {
      const workbook = buildExcelWorkbook(logs, types, []);
      expect(workbook.SheetNames).toContain("Body Measurements");
      const sheet = workbook.Sheets["Body Measurements"];
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      expect(rows.length).toBe(1); // header row only
    });

    it("leaves blank cells for missing measurement fields", () => {
      const measurements: Measurement[] = [
        {
          id: "m-1",
          timestamp: new Date("2024-01-15T07:00:00Z").getTime(),
          dateKey: "2024-01-15",
          weightKg: 82.55,
        },
      ];
      const workbook = buildExcelWorkbook(logs, types, measurements);
      const sheet = workbook.Sheets["Body Measurements"];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      expect(rows[0]["Weight (kg)"]).toBe(82.55);
      expect(rows[0]["Waist (cm)"]).toBeUndefined();
      expect(rows[0]["Thigh (cm)"]).toBeUndefined();
      expect(rows[0]["Bicep (cm)"]).toBeUndefined();
      expect(rows[0]["Hips (cm)"]).toBeUndefined();
      expect(rows[0]["Chest (cm)"]).toBeUndefined();
      expect(rows[0]["Neck (cm)"]).toBeUndefined();
      expect(rows[0]["Wrist (cm)"]).toBeUndefined();
    });

    it("round-trips 2-decimal numeric values", () => {
      const measurements: Measurement[] = [
        {
          id: "m-1",
          timestamp: new Date("2024-01-15T07:00:00Z").getTime(),
          dateKey: "2024-01-15",
          weightKg: 82.55,
          waistCm: 88.0,
          thighCm: 56.25,
          bicepCm: 35.0,
          hipsCm: 96.5,
          chestCm: 102.0,
          neckCm: 38.5,
          wristCm: 17.25,
        },
      ];
      const workbook = buildExcelWorkbook(logs, types, measurements);
      const sheet = workbook.Sheets["Body Measurements"];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      expect(rows[0]["Weight (kg)"]).toBe(82.55);
      expect(rows[0]["Waist (cm)"]).toBe(88.0);
      expect(rows[0]["Thigh (cm)"]).toBe(56.25);
      expect(rows[0]["Bicep (cm)"]).toBe(35.0);
      expect(rows[0]["Hips (cm)"]).toBe(96.5);
      expect(rows[0]["Chest (cm)"]).toBe(102.0);
      expect(rows[0]["Neck (cm)"]).toBe(38.5);
      expect(rows[0]["Wrist (cm)"]).toBe(17.25);
    });

    it("sorts measurements by timestamp ascending", () => {
      const measurements: Measurement[] = [
        {
          id: "m-late",
          timestamp: new Date("2024-01-15T18:00:00Z").getTime(),
          dateKey: "2024-01-15",
          weightKg: 82,
        },
        {
          id: "m-early",
          timestamp: new Date("2024-01-15T07:00:00Z").getTime(),
          dateKey: "2024-01-15",
          weightKg: 81,
        },
      ];
      const workbook = buildExcelWorkbook(logs, types, measurements);
      const sheet = workbook.Sheets["Body Measurements"];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      expect(rows[0]["Weight (kg)"]).toBe(81);
      expect(rows[1]["Weight (kg)"]).toBe(82);
    });
  });

  describe("parseJSONFile", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    // Create a mock file that works in jsdom environment
    const createMockFile = (content: string): File => {
      const file = new File([content], "test.json", {
        type: "application/json",
      });
      // Mock the text() method if it doesn't exist or doesn't work
      if (!file.text || typeof file.text !== "function") {
        file.text = () => Promise.resolve(content);
      }
      return file;
    };

    it("should parse valid JSON file", async () => {
      const validState: AppState = {
        settings: { dailyGoal: 50, startDate: "2024-01-15" },
        types: [
          {
            id: "type-1",
            name: "Standard",
            color: "#87F5FB",
            isArchived: false,
          },
        ],
        logs: [],
      };

      const content = JSON.stringify(validState);
      const file = createMockFile(content);
      const result = await parseJSONFile(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.settings.dailyGoal).toBe(50);
      }
    });

    it("should reject invalid JSON syntax", async () => {
      const file = createMockFile("{ invalid json }");
      const result = await parseJSONFile(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to parse JSON file");
      }
    });

    it("should reject invalid app state structure", async () => {
      const invalidState = {
        settings: { dailyGoal: -1 }, // invalid - missing startDate
        types: [],
        logs: [],
      };

      const file = createMockFile(JSON.stringify(invalidState));
      const result = await parseJSONFile(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid data:");
      }
    });

    it("should reject file with missing required fields", async () => {
      const incompleteState = {
        settings: { dailyGoal: 50 },
        // missing types and logs
      };

      const file = createMockFile(JSON.stringify(incompleteState));
      const result = await parseJSONFile(file);

      expect(result.success).toBe(false);
    });

    it("should round-trip measurements", async () => {
      const stateWithMeasurements: AppState = {
        settings: { dailyGoal: 50, startDate: "2024-01-15" },
        types: [],
        logs: [],
        breaks: [],
        measurements: [
          {
            id: "m-1",
            timestamp: 1700000000000,
            dateKey: "2024-01-15",
            weightKg: 82.55,
            waistCm: 88.0,
            thighCm: 56.25,
            bicepCm: 35.0,
            hipsCm: 96.5,
            chestCm: 102.0,
            neckCm: 38.5,
            wristCm: 17.25,
          },
        ],
      };

      const file = createMockFile(JSON.stringify(stateWithMeasurements));
      const result = await parseJSONFile(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.measurements).toHaveLength(1);
        expect(result.data.measurements[0].weightKg).toBe(82.55);
        expect(result.data.measurements[0].wristCm).toBe(17.25);
      }
    });

    it("should normalise missing measurements array to empty", async () => {
      const oldState = {
        settings: { dailyGoal: 50, startDate: "2024-01-15" },
        types: [],
        logs: [],
        // no measurements field
      };

      const file = createMockFile(JSON.stringify(oldState));
      const result = await parseJSONFile(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.measurements).toEqual([]);
      }
    });
  });
});
