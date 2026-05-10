import { describe, it, expect } from "vitest";
import {
  validateSettings,
  validateExerciseType,
  validateLogEntry,
  validateMeasurement,
  validateAppState,
  isAppState,
  isExerciseType,
  isLogEntry,
  isMeasurement,
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

  describe("validateMeasurement", () => {
    const baseValid = {
      id: "m-1",
      timestamp: 1700000000000,
      dateKey: "2024-01-15",
    };

    it("should validate measurement with all eight values", () => {
      const result = validateMeasurement({
        ...baseValid,
        weightKg: 82.55,
        waistCm: 88.0,
        thighCm: 56.25,
        bicepCm: 35.0,
        hipsCm: 96.5,
        chestCm: 102.0,
        neckCm: 38.5,
        wristCm: 17.25,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate measurement with only one value", () => {
      const result = validateMeasurement({
        ...baseValid,
        weightKg: 82.5,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject when all eight measurement fields are undefined", () => {
      const result = validateMeasurement(baseValid);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("at least one of"))).toBe(
        true
      );
    });

    it("should reject empty id", () => {
      const result = validateMeasurement({
        ...baseValid,
        id: "",
        weightKg: 80,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("id must be a non-empty string");
    });

    it("should reject negative timestamp", () => {
      const result = validateMeasurement({
        ...baseValid,
        timestamp: -1,
        weightKg: 80,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject malformed dateKey", () => {
      const result = validateMeasurement({
        ...baseValid,
        dateKey: "01/15/2024",
        weightKg: 80,
      });
      expect(result.valid).toBe(false);
    });

    const boundsCases: ReadonlyArray<
      readonly [string, number, number, number]
    > = [
      ["weightKg", 20, 500, 80],
      ["waistCm", 30, 250, 88],
      ["thighCm", 20, 150, 56],
      ["bicepCm", 15, 80, 35],
      ["hipsCm", 40, 200, 96],
      ["chestCm", 40, 200, 102],
      ["neckCm", 20, 80, 38],
      ["wristCm", 10, 30, 17],
    ];

    for (const [field, min, max] of boundsCases) {
      it(`should reject ${field} below ${min}`, () => {
        const result = validateMeasurement({
          ...baseValid,
          [field]: min - 1,
        });
        expect(result.valid).toBe(false);
        expect(
          result.errors.some((e) => e.includes(field) && e.includes("between"))
        ).toBe(true);
      });

      it(`should reject ${field} above ${max}`, () => {
        const result = validateMeasurement({
          ...baseValid,
          [field]: max + 1,
        });
        expect(result.valid).toBe(false);
        expect(
          result.errors.some((e) => e.includes(field) && e.includes("between"))
        ).toBe(true);
      });
    }

    it("should reject string measurement value", () => {
      const result = validateMeasurement({
        ...baseValid,
        weightKg: "82",
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.includes("weightKg") && e.includes("finite number")
        )
      ).toBe(true);
    });

    it("should reject more than 2 decimal places", () => {
      const result = validateMeasurement({
        ...baseValid,
        weightKg: 82.555,
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.includes("weightKg") && e.includes("decimal")
        )
      ).toBe(true);
    });

    it("should accept exactly 2 decimal places at lower bound", () => {
      const result = validateMeasurement({
        ...baseValid,
        weightKg: 20.0,
      });
      expect(result.valid).toBe(true);
    });

    it("should accept 2 decimal places near upper bound", () => {
      const result = validateMeasurement({
        ...baseValid,
        weightKg: 499.99,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject NaN measurement value", () => {
      const result = validateMeasurement({
        ...baseValid,
        weightKg: NaN,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject NaN timestamp", () => {
      const result = validateMeasurement({
        ...baseValid,
        timestamp: NaN,
        weightKg: 80,
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.includes("timestamp") && e.includes("finite")
        )
      ).toBe(true);
    });

    it("should reject Infinity timestamp", () => {
      const result = validateMeasurement({
        ...baseValid,
        timestamp: Infinity,
        weightKg: 80,
      });
      expect(result.valid).toBe(false);
    });

    // Float-precision edge cases: values like 39.59 produce 39.59*100 ===
    // 3959.0000000000005 in IEEE-754. The check must tolerate this.
    const floatEdgeCases = [
      ["weightKg", 39.59],
      ["weightKg", 20.29],
      ["waistCm", 39.59],
      ["thighCm", 56.29],
      ["bicepCm", 35.29],
      ["hipsCm", 96.29],
      ["chestCm", 102.29],
      ["neckCm", 38.29],
      ["wristCm", 17.29],
    ] as const;

    for (const [field, value] of floatEdgeCases) {
      it(`should accept ${field} = ${value} despite IEEE-754 multiplication drift`, () => {
        const result = validateMeasurement({
          ...baseValid,
          [field]: value,
        });
        expect(result.valid).toBe(true);
      });
    }
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
      measurements: [],
    };

    const validStateNoMeasurements = {
      settings: validState.settings,
      types: validState.types,
      logs: validState.logs,
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

    it("should reject state without measurements (strict; callers normalise)", () => {
      const result = validateAppState(validStateNoMeasurements);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("measurements must be an array");
    });

    it("should accept state with valid measurements", () => {
      const result = validateAppState({
        ...validState,
        measurements: [
          {
            id: "m-1",
            timestamp: 1700000000000,
            dateKey: "2024-01-15",
            weightKg: 82.5,
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it("should reject state with invalid measurement", () => {
      const result = validateAppState({
        ...validState,
        measurements: [
          {
            id: "m-1",
            timestamp: 1700000000000,
            dateKey: "2024-01-15",
            weightKg: 5, // below min
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("measurements[0]:"))).toBe(
        true
      );
    });

    it("should reject non-array measurements", () => {
      const result = validateAppState({
        ...validState,
        measurements: "not an array",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("measurements must be an array");
    });
  });

  describe("type guards", () => {
    it("isAppState should return correct boolean", () => {
      expect(
        isAppState({
          settings: { dailyGoal: 50, startDate: "2024-01-15" },
          types: [],
          logs: [],
          measurements: [],
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

    it("isMeasurement should return correct boolean", () => {
      expect(
        isMeasurement({
          id: "m-1",
          timestamp: 1700000000000,
          dateKey: "2024-01-15",
          weightKg: 82.5,
        })
      ).toBe(true);
      expect(isMeasurement({ id: "" })).toBe(false);
    });
  });
});
