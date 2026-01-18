import type { AppState } from "@/types";
import { getTodayKey } from "./date-utils";
import { validateAppState } from "./validation";

const STORAGE_KEY = "exercise-tracker-state";

export const DEFAULT_STATE: AppState = {
  settings: {
    dailyGoal: 50,
    startDate: getTodayKey(),
  },
  types: [
    {
      id: "default-standard",
      name: "Standard",
      color: "#6290C3",
      isArchived: false,
    },
    {
      id: "default-chair-dips",
      name: "Chair Dips",
      color: "#BAFF29",
      isArchived: false,
    },
  ],
  logs: [],
};

/**
 * Loads app state from localStorage
 */
export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        ...DEFAULT_STATE,
        settings: { ...DEFAULT_STATE.settings, startDate: getTodayKey() },
      };
    }

    const parsed = JSON.parse(stored);
    const validation = validateAppState(parsed);

    if (!validation.valid) {
      console.warn("Invalid stored state, using default:", validation.errors);
      return {
        ...DEFAULT_STATE,
        settings: { ...DEFAULT_STATE.settings, startDate: getTodayKey() },
      };
    }

    return parsed as AppState;
  } catch (error) {
    console.error("Failed to load state:", error);
    return {
      ...DEFAULT_STATE,
      settings: { ...DEFAULT_STATE.settings, startDate: getTodayKey() },
    };
  }
}

/**
 * Saves app state to localStorage
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

/**
 * Clears all app state from localStorage
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear state:", error);
  }
}
