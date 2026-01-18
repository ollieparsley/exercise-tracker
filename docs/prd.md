# Product Requirements Document: Exercise Tracker

| **Project Name** | Exercise Tracker |
| :--- | :--- |
| **Version** | 2.1 (Color-Coded & High Assurance) |
| **Status** | Approved for Development |
| **Platform** | Mobile Web (PWA Capable) |
| **Deployment** | GitHub Pages (Static Site) |
| **Engine** | React 19+ / Vite / TypeScript |

---

## 1. Executive Summary
The Exercise Tracker is a client-side, offline-first web application designed to help users track daily push-up volume against a set target. The application operates entirely in the browser using LocalStorage. It features a cumulative "Debt" tracker, 14-day performance visualization, and allows users to define custom push-up types with specific color coding for rich data breakdown.

The project adheres to "2026 Engineering Standards," requiring high test coverage (Unit & E2E), strict linting, and a standardized Makefile-driven CI/CD pipeline.

## 2. Core User Flow
1.  **Onboarding:** User visits the site. Default settings (Goal: 50/day) and Types ("Standard" [Blue], "Chair Dips" [Orange]) are auto-populated.
2.  **Configuration:** User navigates to Settings to add a new type (e.g., "Diamond") and selects a specific color (e.g., Pink) via a color picker.
3.  **Dashboard:** User views "Total Debt" (Deficit) and a 14-day stacked bar chart showing the composition of their workouts by type color.
4.  **Logging (Today):** User selects a type (buttons reflect the type's color), enters a count, and logs the session.
5.  **Backfill (History):** User realizes they missed logging yesterday. They open the History view, select the past date, and enter a total sum for that day.
6.  **Data Safety:** User periodically exports a JSON backup or CSV for external analysis.

## 3. Functional Requirements

### 3.1. Global Settings & Defaults
* **Daily Goal:** Integer (Default: 50).
* **Start Date:** Date string (Default: Today). Used to calculate cumulative expected volume.
* **Push-Up Types:** A configurable list of exercise types.
    * **Default 1:** Name: "Standard", Color: `#3B82F6` (Blue).
    * **Default 2:** Name: "Chair Dips", Color: `#F97316` (Orange).

### 3.2. Type Management (Settings)
Users must be able to manage the list of push-up variants:
* **Add Type:** Input Name + Select Color (Browser native color picker).
* **Edit Type:** Modify Name or Color.
* **Delete/Archive:** Soft delete capabilities so historical charts don't break if a type is removed from the input list.

### 3.3. Dashboard & Visualization
* **Metric: Today's Progress:** `[Sum of Today's Logs] / [Daily Goal]`
* **Metric: Total Debt:** `((Days Since Start * Daily Goal) - Total All-Time Pushups)`
    * *Visual:* Red text if Debt > 0; Green text if Debt <= 0.
* **Chart: 14-Day Performance:**
    * **Type:** Stacked Bar Chart.
    * **Scope:** Rolling window of the last 14 days.
    * **X-Axis:** Date (e.g., "Mon 12").
    * **Y-Axis:** Total Count.
    * **Segments:** Bars must be stacked based on the `color` of the push-up type used.
    * **Reference:** Horizontal line indicating `Daily Goal`.

### 3.4. Input Mechanisms
**A. Session Logger (Current Day)**
* **Type Selector:** Pill or Radio buttons styled with the type's assigned `color`.
* **Count Input:** Numeric text field.
* **Quick Actions:** Large tap targets for `-10`, `-1`, `+1`, `+10`.
* **Submit:** Log button (Disabled if count is 0).

**B. Historical Backfill**
* **Access:** Via "History" or "Missed Day" link.
* **Inputs:** Date Picker + Type Selector + Total Count.
* **Logic:** Inserts a log entry with the selected past date.

### 3.5. Data Management (Import/Export)
* **Export CSV:** Generates `pushups_export_YYYY-MM-DD.csv`.
    * Columns: `ISO Timestamp`, `Date`, `Type Name`, `Count`.
* **Backup (JSON):** Downloads full application state (Settings + Logs + Types).
* **Restore (JSON):** Uploads and validates schema before overwriting LocalStorage.

## 4. Technical Specifications

### 4.1. Core Stack
* **Language:** TypeScript 6.x (Strict Mode).
* **Framework:** React 19+ (Client-Side).
* **Build Tool:** Vite.
* **Styling:** Tailwind CSS v4.
* **Charts:** `Recharts` or `Chart.js` (Must support stacking).
* **State Persistence:** `window.localStorage`.
* **Routing:** `TanStack Router` or `React Router`.

### 4.2. Data Model (Schema)

```typescript
// Definition of a specific exercise type
interface ExerciseType {
  id: string;          // UUID
  name: string;        // e.g., "Standard"
  color: string;       // Hex Code e.g., "#3B82F6"
  isArchived: boolean; // Soft delete flag
}

// A single workout session
interface LogEntry {
  id: string;          // UUID
  timestamp: string;   // ISO 8601 (Full date-time)
  dateKey: string;     // "YYYY-MM-DD" (Indexed for aggregation)
  typeId: string;      // Foreign Key to ExerciseType.id
  count: number;
}

// The Global State
interface AppState {
  settings: {
    dailyGoal: number;
    startDate: string; // ISO Date String
  };
  types: ExerciseType[];
  logs: LogEntry[];
}
```

### 4.3. Quality Assurance (The "2026 Standard")
* **Linter:** ESLint (Flat Config) with strict accessibility (`jsx-a11y`) and React Hooks rules.
* **Formatter:** Prettier.
* **Unit Tests:** `Vitest`.
    * **Target:** 90%+ Branch Coverage on utilities (Date math, Debt calculation, Reducers).
* **E2E Tests:** `Playwright`.
    * **Scenarios:**
        1.  First-time load -> Set Goal.
        2.  Create new Type (Pink) -> Log Entry -> Verify Chart.
        3.  Export JSON -> Clear Data -> Import JSON -> Verify Data.

## 5. DevOps & Automation

### 5.1. Makefile Interface
The project root must contain a `Makefile` to standardize operations:
* `make install`: Clean dependency install.
* `make lint`: Run ESLint and Type Checks.
* `make format`: Check Prettier compliance.
* `make test`: Run Unit Tests (Vitest).
* `make test-e2e`: Run Playwright tests.
* `make build`: Produce production assets in `/dist`.
* `make ci`: Run `install -> lint -> format -> test -> build`.

### 5.2. CI Workflow (GitHub Actions)
A workflow `.github/workflows/ci.yml` must:
1.  Trigger on Push/PR.
2.  Execute `make ci`.
3.  Deploy `/dist` to `gh-pages` branch only on successful `main` branch builds.

## 6. Non-Functional Requirements
* **Mobile Responsiveness:** Touch targets must be minimum 44x44px. Layout must adapt to iPhone SE size (small screens).
* **Performance:** Lighthouse score > 95 for Performance and Best Practices.
* **Accessibility:** Proper ARIA labels on all inputs and chart elements.