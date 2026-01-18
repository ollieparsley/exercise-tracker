import { createContext, type Dispatch } from "react";
import type { AppState, ActionType } from "@/types";

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<ActionType>;
}

export const AppContext = createContext<AppContextValue | null>(null);
