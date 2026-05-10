import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, clearState, DEFAULT_STATE } from "@/lib/storage";

const STORAGE_KEY = "exercise-tracker-state";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadState", () => {
    it("returns default state when localStorage is empty", () => {
      const state = loadState();
      expect(state.measurements).toEqual([]);
      expect(state.breaks).toEqual([]);
      expect(state.types.length).toBe(DEFAULT_STATE.types.length);
    });

    it("migrates legacy state missing the measurements array", () => {
      const legacy = {
        settings: { dailyGoal: 50, startDate: "2024-01-15" },
        types: [
          {
            id: "t-1",
            name: "Standard",
            color: "#87F5FB",
            isArchived: false,
          },
        ],
        logs: [],
        breaks: [],
        // no measurements field
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

      const state = loadState();
      expect(state.measurements).toEqual([]);
      expect(state.settings.dailyGoal).toBe(50);
    });

    it("migrates legacy state missing both breaks and measurements", () => {
      const legacy = {
        settings: { dailyGoal: 50, startDate: "2024-01-15" },
        types: [],
        logs: [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

      const state = loadState();
      expect(state.measurements).toEqual([]);
      expect(state.breaks).toEqual([]);
    });

    it("normalises a non-array measurements field to an empty array", () => {
      const corrupt = {
        settings: { dailyGoal: 50, startDate: "2024-01-15" },
        types: [],
        logs: [],
        breaks: [],
        measurements: null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(corrupt));

      const state = loadState();
      expect(state.measurements).toEqual([]);
    });

    it("preserves a valid measurements array", () => {
      const valid = {
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
            wristCm: 17.25,
          },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));

      const state = loadState();
      expect(state.measurements).toHaveLength(1);
      expect(state.measurements[0].weightKg).toBe(82.55);
      expect(state.measurements[0].wristCm).toBe(17.25);
    });

    it("falls back to default state when stored JSON is corrupt", () => {
      localStorage.setItem(STORAGE_KEY, "{ not valid json");
      const state = loadState();
      expect(state.measurements).toEqual([]);
    });

    it("falls back to default when stored state fails validation", () => {
      const invalid = {
        settings: { dailyGoal: -1, startDate: "bad" },
        types: [],
        logs: [],
        breaks: [],
        measurements: [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const state = loadState();
      // should fall back to default (which has dailyGoal: 50)
      expect(state.settings.dailyGoal).toBe(50);
    });
  });

  describe("saveState + clearState", () => {
    it("round-trips measurements through localStorage", () => {
      const state = {
        ...DEFAULT_STATE,
        measurements: [
          {
            id: "m-1",
            timestamp: 1700000000000,
            dateKey: "2024-01-15",
            weightKg: 82.55,
          },
        ],
      };
      saveState(state);

      const reloaded = loadState();
      expect(reloaded.measurements).toHaveLength(1);
      expect(reloaded.measurements[0].weightKg).toBe(82.55);
    });

    it("clearState wipes persisted state", () => {
      saveState({ ...DEFAULT_STATE, measurements: [] });
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      clearState();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
