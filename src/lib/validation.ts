import type {
  AppState,
  ExerciseType,
  LogEntry,
  Settings,
  Break,
  Measurement,
} from "@/types";

const MEASUREMENT_FIELDS = [
  "weightKg",
  "waistCm",
  "thighCm",
  "bicepCm",
  "hipsCm",
  "chestCm",
  "neckCm",
  "wristCm",
] as const;

type MeasurementField = (typeof MEASUREMENT_FIELDS)[number];

export const MEASUREMENT_BOUNDS: Record<
  MeasurementField,
  { min: number; max: number }
> = {
  weightKg: { min: 20, max: 500 },
  waistCm: { min: 30, max: 250 },
  thighCm: { min: 20, max: 150 },
  bicepCm: { min: 15, max: 80 },
  hipsCm: { min: 40, max: 200 },
  chestCm: { min: 40, max: 200 },
  neckCm: { min: 20, max: 80 },
  wristCm: { min: 10, max: 30 },
};

function hasAtMostTwoDecimals(value: number): boolean {
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
}

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
 * Validates a Break object
 */
export function validateBreak(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Break must be an object"] };
  }

  const b = data as Record<string, unknown>;

  if (typeof b.id !== "string" || b.id.length === 0) {
    errors.push("id must be a non-empty string");
  }

  if (
    typeof b.startDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.startDate)
  ) {
    errors.push("startDate must be a valid date string (YYYY-MM-DD)");
  }

  if (typeof b.endDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.endDate)) {
    errors.push("endDate must be a valid date string (YYYY-MM-DD)");
  }

  if (b.label !== undefined && typeof b.label !== "string") {
    errors.push("label must be a string if provided");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a Measurement object
 */
export function validateMeasurement(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Measurement must be an object"] };
  }

  const m = data as Record<string, unknown>;

  if (typeof m.id !== "string" || m.id.length === 0) {
    errors.push("id must be a non-empty string");
  }

  if (
    typeof m.timestamp !== "number" ||
    !Number.isFinite(m.timestamp) ||
    m.timestamp < 0
  ) {
    errors.push("timestamp must be a non-negative finite number");
  }

  if (typeof m.dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(m.dateKey)) {
    errors.push("dateKey must be a valid date string (YYYY-MM-DD)");
  }

  let presentCount = 0;
  for (const field of MEASUREMENT_FIELDS) {
    const value = m[field];
    if (value === undefined) continue;
    presentCount++;

    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} must be a finite number if provided`);
      continue;
    }

    const { min, max } = MEASUREMENT_BOUNDS[field];
    if (value < min || value > max) {
      errors.push(`${field} must be between ${min} and ${max}`);
    }

    if (!hasAtMostTwoDecimals(value)) {
      errors.push(`${field} must have at most 2 decimal places`);
    }
  }

  if (presentCount === 0) {
    errors.push(
      `Measurement requires at least one of ${MEASUREMENT_FIELDS.join(", ")}`
    );
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

  // Validate breaks array (optional for backwards compatibility)
  if (state.breaks !== undefined) {
    if (!Array.isArray(state.breaks)) {
      errors.push("breaks must be an array");
    } else {
      state.breaks.forEach((b, index) => {
        const breakValidation = validateBreak(b);
        if (!breakValidation.valid) {
          errors.push(
            ...breakValidation.errors.map((e) => `breaks[${index}]: ${e}`)
          );
        }
      });
    }
  }

  // Validate measurements array (required; callers must normalise legacy data
  // before validating — see loadState / parseJSONFile).
  if (!Array.isArray(state.measurements)) {
    errors.push("measurements must be an array");
  } else {
    state.measurements.forEach((m, index) => {
      const mValidation = validateMeasurement(m);
      if (!mValidation.valid) {
        errors.push(
          ...mValidation.errors.map((e) => `measurements[${index}]: ${e}`)
        );
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Type guard for Break
 */
export function isBreak(data: unknown): data is Break {
  return validateBreak(data).valid;
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

/**
 * Type guard for Measurement
 */
export function isMeasurement(data: unknown): data is Measurement {
  return validateMeasurement(data).valid;
}
