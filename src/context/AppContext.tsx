import { useReducer, useEffect, type ReactNode } from "react";
import type { AppState, ActionType } from "@/types";
import { loadState, saveState, DEFAULT_STATE } from "@/lib/storage";
import { getTodayKey } from "@/lib/date-utils";
import { AppContext } from "./context";

function appReducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case "SET_DAILY_GOAL":
      return {
        ...state,
        settings: { ...state.settings, dailyGoal: action.payload },
      };

    case "SET_START_DATE":
      return {
        ...state,
        settings: { ...state.settings, startDate: action.payload },
      };

    case "ADD_TYPE":
      return {
        ...state,
        types: [...state.types, action.payload],
      };

    case "UPDATE_TYPE":
      return {
        ...state,
        types: state.types.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case "ARCHIVE_TYPE":
      return {
        ...state,
        types: state.types.map((t) =>
          t.id === action.payload ? { ...t, isArchived: true } : t
        ),
      };

    case "ADD_LOG":
      return {
        ...state,
        logs: [...state.logs, action.payload],
      };

    case "DELETE_LOG":
      return {
        ...state,
        logs: state.logs.filter((l) => l.id !== action.payload),
      };

    case "IMPORT_STATE":
      return action.payload;

    case "RESET_STATE":
      return {
        ...DEFAULT_STATE,
        settings: { ...DEFAULT_STATE.settings, startDate: getTodayKey() },
      };

    default:
      return state;
  }
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  // Auto-persist to localStorage on state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
