import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCSV, parseJSONFile } from "@/lib/export";
import type { LogEntry, ExerciseType, AppState } from "@/types";

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
  });
});
