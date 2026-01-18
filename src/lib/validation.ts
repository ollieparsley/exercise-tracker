import type { AppState, ExerciseType, LogEntry, Settings } from "@/types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a Settings object
 */
export function validateSettings(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Settings must be an object"] };
  }

  const settings = data as Record<string, unknown>;

  if (typeof settings.dailyGoal !== "number" || settings.dailyGoal < 0) {
    errors.push("dailyGoal must be a non-negative number");
  }

  if (
    typeof settings.startDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(settings.startDate)
  ) {
    errors.push("startDate must be a valid date string (YYYY-MM-DD)");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an ExerciseType object
 */
export function validateExerciseType(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["ExerciseType must be an object"] };
  }

  const type = data as Record<string, unknown>;

  if (typeof type.id !== "string" || type.id.length === 0) {
    errors.push("id must be a non-empty string");
  }

  if (typeof type.name !== "string" || type.name.length === 0) {
    errors.push("name must be a non-empty string");
  }

  if (typeof type.color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(type.color)) {
    errors.push("color must be a valid hex color (e.g., #FFFFFF)");
  }

  if (typeof type.isArchived !== "boolean") {
    errors.push("isArchived must be a boolean");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a LogEntry object
 */
export function validateLogEntry(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["LogEntry must be an object"] };
  }

  const log = data as Record<string, unknown>;

  if (typeof log.id !== "string" || log.id.length === 0) {
    errors.push("id must be a non-empty string");
  }

  if (typeof log.timestamp !== "number" || log.timestamp < 0) {
    errors.push("timestamp must be a non-negative number");
  }

  if (
    typeof log.dateKey !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(log.dateKey)
  ) {
    errors.push("dateKey must be a valid date string (YYYY-MM-DD)");
  }

  if (typeof log.typeId !== "string" || log.typeId.length === 0) {
    errors.push("typeId must be a non-empty string");
  }

  if (typeof log.count !== "number" || log.count < 0) {
    errors.push("count must be a non-negative number");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates the entire AppState object
 */
export function validateAppState(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["AppState must be an object"] };
  }

  const state = data as Record<string, unknown>;

  // Validate settings
  const settingsValidation = validateSettings(state.settings);
  if (!settingsValidation.valid) {
    errors.push(...settingsValidation.errors.map((e) => `settings: ${e}`));
  }

  // Validate types array
  if (!Array.isArray(state.types)) {
    errors.push("types must be an array");
  } else {
    state.types.forEach((type, index) => {
      const typeValidation = validateExerciseType(type);
      if (!typeValidation.valid) {
        errors.push(
          ...typeValidation.errors.map((e) => `types[${index}]: ${e}`)
        );
      }
    });
  }

  // Validate logs array
  if (!Array.isArray(state.logs)) {
    errors.push("logs must be an array");
  } else {
    state.logs.forEach((log, index) => {
      const logValidation = validateLogEntry(log);
      if (!logValidation.valid) {
        errors.push(...logValidation.errors.map((e) => `logs[${index}]: ${e}`));
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Type guard for AppState
 */
export function isAppState(data: unknown): data is AppState {
  return validateAppState(data).valid;
}

/**
 * Type guard for ExerciseType
 */
export function isExerciseType(data: unknown): data is ExerciseType {
  return validateExerciseType(data).valid;
}

/**
 * Type guard for LogEntry
 */
export function isLogEntry(data: unknown): data is LogEntry {
  return validateLogEntry(data).valid;
}

/**
 * Type guard for Settings
 */
export function isSettings(data: unknown): data is Settings {
  return validateSettings(data).valid;
}
