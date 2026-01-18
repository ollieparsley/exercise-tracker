import { describe, it, expect } from "vitest";
import {
  validateSettings,
  validateExerciseType,
  validateLogEntry,
  validateAppState,
  isAppState,
  isExerciseType,
  isLogEntry,
  isSettings,
} from "@/lib/validation";

describe("validation", () => {
  describe("validateSettings", () => {
    it("should validate valid settings", () => {
      const result = validateSettings({
        dailyGoal: 50,
        startDate: "2024-01-15",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-object input", () => {
      expect(validateSettings(null).valid).toBe(false);
      expect(validateSettings("string").valid).toBe(false);
      expect(validateSettings(123).valid).toBe(false);
    });

    it("should reject negative dailyGoal", () => {
      const result = validateSettings({
        dailyGoal: -5,
        startDate: "2024-01-15",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "dailyGoal must be a non-negative number"
      );
    });

    it("should reject invalid startDate format", () => {
      const result = validateSettings({
        dailyGoal: 50,
        startDate: "01/15/2024",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "startDate must be a valid date string (YYYY-MM-DD)"
      );
    });

    it("should reject missing dailyGoal", () => {
      const result = validateSettings({
        startDate: "2024-01-15",
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("validateExerciseType", () => {
    it("should validate valid exercise type", () => {
      const result = validateExerciseType({
        id: "type-1",
        name: "Standard",
        color: "#87F5FB",
        isArchived: false,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject empty id", () => {
      const result = validateExerciseType({
        id: "",
        name: "Standard",
        color: "#87F5FB",
        isArchived: false,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("id must be a non-empty string");
    });

    it("should reject empty name", () => {
      const result = validateExerciseType({
        id: "type-1",
        name: "",
        color: "#87F5FB",
        isArchived: false,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("name must be a non-empty string");
    });

    it("should reject invalid color format", () => {
      const result = validateExerciseType({
        id: "type-1",
        name: "Standard",
        color: "blue",
        isArchived: false,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "color must be a valid hex color (e.g., #FFFFFF)"
      );
    });

    it("should reject 3-digit hex colors", () => {
      const result = validateExerciseType({
        id: "type-1",
        name: "Standard",
        color: "#FFF",
        isArchived: false,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject non-boolean isArchived", () => {
      const result = validateExerciseType({
        id: "type-1",
        name: "Standard",
        color: "#87F5FB",
        isArchived: "false",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("isArchived must be a boolean");
    });
  });

  describe("validateLogEntry", () => {
    it("should validate valid log entry", () => {
      const result = validateLogEntry({
        id: "log-1",
        timestamp: Date.now(),
        dateKey: "2024-01-15",
        typeId: "type-1",
        count: 10,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject empty id", () => {
      const result = validateLogEntry({
        id: "",
        timestamp: Date.now(),
        dateKey: "2024-01-15",
        typeId: "type-1",
        count: 10,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject negative timestamp", () => {
      const result = validateLogEntry({
        id: "log-1",
        timestamp: -1,
        dateKey: "2024-01-15",
        typeId: "type-1",
        count: 10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "timestamp must be a non-negative number"
      );
    });

    it("should reject invalid dateKey format", () => {
      const result = validateLogEntry({
        id: "log-1",
        timestamp: Date.now(),
        dateKey: "2024/01/15",
        typeId: "type-1",
        count: 10,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject negative count", () => {
      const result = validateLogEntry({
        id: "log-1",
        timestamp: Date.now(),
        dateKey: "2024-01-15",
        typeId: "type-1",
        count: -5,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("count must be a non-negative number");
    });
  });

  describe("validateAppState", () => {
    const validState = {
      settings: {
        dailyGoal: 50,
        startDate: "2024-01-15",
      },
      types: [
        {
          id: "type-1",
          name: "Standard",
          color: "#87F5FB",
          isArchived: false,
        },
      ],
      logs: [
        {
          id: "log-1",
          timestamp: Date.now(),
          dateKey: "2024-01-15",
          typeId: "type-1",
          count: 10,
        },
      ],
    };

    it("should validate valid app state", () => {
      const result = validateAppState(validState);
      expect(result.valid).toBe(true);
    });

    it("should reject non-object input", () => {
      expect(validateAppState(null).valid).toBe(false);
      expect(validateAppState([]).valid).toBe(false);
    });

    it("should reject invalid settings", () => {
      const result = validateAppState({
        ...validState,
        settings: { dailyGoal: -1, startDate: "invalid" },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("settings:"))).toBe(true);
    });

    it("should reject non-array types", () => {
      const result = validateAppState({
        ...validState,
        types: "not an array",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("types must be an array");
    });

    it("should reject invalid type in array", () => {
      const result = validateAppState({
        ...validState,
        types: [{ id: "", name: "", color: "bad", isArchived: false }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("types[0]:"))).toBe(true);
    });

    it("should reject invalid log in array", () => {
      const result = validateAppState({
        ...validState,
        logs: [
          { id: "", timestamp: -1, dateKey: "bad", typeId: "", count: -1 },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("logs[0]:"))).toBe(true);
    });
  });

  describe("type guards", () => {
    it("isAppState should return correct boolean", () => {
      expect(
        isAppState({
          settings: { dailyGoal: 50, startDate: "2024-01-15" },
          types: [],
          logs: [],
        })
      ).toBe(true);
      expect(isAppState({ invalid: true })).toBe(false);
    });

    it("isExerciseType should return correct boolean", () => {
      expect(
        isExerciseType({
          id: "1",
          name: "Test",
          color: "#FFFFFF",
          isArchived: false,
        })
      ).toBe(true);
      expect(isExerciseType({ id: "" })).toBe(false);
    });

    it("isLogEntry should return correct boolean", () => {
      expect(
        isLogEntry({
          id: "1",
          timestamp: 1000,
          dateKey: "2024-01-15",
          typeId: "1",
          count: 10,
        })
      ).toBe(true);
      expect(isLogEntry({ id: "" })).toBe(false);
    });

    it("isSettings should return correct boolean", () => {
      expect(isSettings({ dailyGoal: 50, startDate: "2024-01-15" })).toBe(true);
      expect(isSettings({ dailyGoal: -1 })).toBe(false);
    });
  });
});
