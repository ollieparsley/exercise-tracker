export interface ExerciseType {
  id: string;
  name: string;
  color: string;
  isArchived: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  dateKey: string; // YYYY-MM-DD format
  typeId: string;
  count: number;
}

export interface Settings {
  dailyGoal: number;
  startDate: string; // YYYY-MM-DD format
}

export interface AppState {
  settings: Settings;
  types: ExerciseType[];
  logs: LogEntry[];
}

export type ActionType =
  | { type: "SET_DAILY_GOAL"; payload: number }
  | { type: "SET_START_DATE"; payload: string }
  | { type: "ADD_TYPE"; payload: ExerciseType }
  | { type: "UPDATE_TYPE"; payload: ExerciseType }
  | { type: "ARCHIVE_TYPE"; payload: string }
  | { type: "ADD_LOG"; payload: LogEntry }
  | { type: "DELETE_LOG"; payload: string }
  | { type: "IMPORT_STATE"; payload: AppState }
  | { type: "RESET_STATE" };

export interface ChartDataPoint {
  dateKey: string;
  label: string;
  goal: number;
  [typeId: string]: string | number; // Dynamic type counts
}
