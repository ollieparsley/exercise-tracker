import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTotalForDate,
  getBreakdownForDate,
  getTodayProgress,
  calculateDebt,
  aggregateLogsForChart,
  getTotalCount,
  getLogsForDate,
} from "@/lib/calculations";
import type { LogEntry, ExerciseType } from "@/types";

const createLog = (
  id: string,
  dateKey: string,
  typeId: string,
  count: number,
  timestamp = Date.now()
): LogEntry => ({
  id,
  dateKey,
  typeId,
  count,
  timestamp,
});

const mockTypes: ExerciseType[] = [
  { id: "type-1", name: "Standard", color: "#87F5FB", isArchived: false },
  { id: "type-2", name: "Chair Dips", color: "#DE3C4B", isArchived: false },
];

describe("calculations", () => {
  describe("getTotalForDate", () => {
    it("should return 0 for empty logs", () => {
      expect(getTotalForDate([], "2024-01-15")).toBe(0);
    });

    it("should return 0 for non-matching date", () => {
      const logs = [createLog("1", "2024-01-14", "type-1", 10)];
      expect(getTotalForDate(logs, "2024-01-15")).toBe(0);
    });

    it("should sum all counts for matching date", () => {
      const logs = [
        createLog("1", "2024-01-15", "type-1", 10),
        createLog("2", "2024-01-15", "type-2", 20),
        createLog("3", "2024-01-14", "type-1", 30),
      ];
      expect(getTotalForDate(logs, "2024-01-15")).toBe(30);
    });
  });

  describe("getBreakdownForDate", () => {
    it("should return empty map for no logs", () => {
      const breakdown = getBreakdownForDate([], "2024-01-15");
      expect(breakdown.size).toBe(0);
    });

    it("should group counts by type", () => {
      const logs = [
        createLog("1", "2024-01-15", "type-1", 10),
        createLog("2", "2024-01-15", "type-1", 5),
        createLog("3", "2024-01-15", "type-2", 20),
      ];
      const breakdown = getBreakdownForDate(logs, "2024-01-15");
      expect(breakdown.get("type-1")).toBe(15);
      expect(breakdown.get("type-2")).toBe(20);
    });
  });

  describe("getTodayProgress", () => {
    it("should return zero progress for no logs", () => {
      const progress = getTodayProgress([], "2024-01-15", 50);
      expect(progress.total).toBe(0);
      expect(progress.goal).toBe(50);
      expect(progress.percentage).toBe(0);
    });

    it("should calculate percentage correctly", () => {
      const logs = [createLog("1", "2024-01-15", "type-1", 25)];
      const progress = getTodayProgress(logs, "2024-01-15", 50);
      expect(progress.total).toBe(25);
      expect(progress.percentage).toBe(50);
    });

    it("should cap percentage at 100", () => {
      const logs = [createLog("1", "2024-01-15", "type-1", 75)];
      const progress = getTodayProgress(logs, "2024-01-15", 50);
      expect(progress.percentage).toBe(100);
    });

    it("should handle zero goal", () => {
      const logs = [createLog("1", "2024-01-15", "type-1", 10)];
      const progress = getTodayProgress(logs, "2024-01-15", 0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe("calculateDebt", () => {
    it("should return 0 when start date is in future", () => {
      const debt = calculateDebt([], 50, "2024-01-20", "2024-01-15");
      expect(debt).toBe(0);
    });

    it("should return negative debt when behind", () => {
      const logs = [createLog("1", "2024-01-15", "type-1", 30)];
      const debt = calculateDebt(logs, 50, "2024-01-15", "2024-01-15");
      expect(debt).toBe(-20); // 30 done, 50 required
    });

    it("should return positive surplus when ahead", () => {
      const logs = [createLog("1", "2024-01-15", "type-1", 70)];
      const debt = calculateDebt(logs, 50, "2024-01-15", "2024-01-15");
      expect(debt).toBe(20); // 70 done, 50 required
    });

    it("should calculate debt across multiple days", () => {
      const logs = [
        createLog("1", "2024-01-15", "type-1", 50),
        createLog("2", "2024-01-16", "type-1", 30),
      ];
      // 2 days * 50 = 100 required, 80 done = -20 debt
      const debt = calculateDebt(logs, 50, "2024-01-15", "2024-01-16");
      expect(debt).toBe(-20);
    });

    it("should return 0 when exactly on target", () => {
      const logs = [createLog("1", "2024-01-15", "type-1", 50)];
      const debt = calculateDebt(logs, 50, "2024-01-15", "2024-01-15");
      expect(debt).toBe(0);
    });

    it("should ignore logs outside date range", () => {
      const logs = [
        createLog("1", "2024-01-14", "type-1", 100), // before start
        createLog("2", "2024-01-15", "type-1", 30),
        createLog("3", "2024-01-17", "type-1", 100), // after end
      ];
      const debt = calculateDebt(logs, 50, "2024-01-15", "2024-01-16");
      expect(debt).toBe(-70); // 2 days * 50 = 100 required, 30 done
    });
  });

  describe("aggregateLogsForChart", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 15)); // January 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return empty data points for no logs", () => {
      const data = aggregateLogsForChart(
        [],
        mockTypes,
        50,
        3,
        new Date(2024, 0, 15)
      );
      expect(data.length).toBe(3);
      expect(data[2]["type-1"]).toBe(0);
      expect(data[2]["type-2"]).toBe(0);
    });

    it("should aggregate logs by date and type", () => {
      const logs = [
        createLog("1", "2024-01-15", "type-1", 30),
        createLog("2", "2024-01-15", "type-2", 20),
        createLog("3", "2024-01-14", "type-1", 10),
      ];
      const data = aggregateLogsForChart(
        logs,
        mockTypes,
        50,
        3,
        new Date(2024, 0, 15)
      );

      // Last day (2024-01-15)
      expect(data[2]["type-1"]).toBe(30);
      expect(data[2]["type-2"]).toBe(20);

      // Previous day (2024-01-14)
      expect(data[1]["type-1"]).toBe(10);
      expect(data[1]["type-2"]).toBe(0);
    });

    it("should exclude archived types", () => {
      const typesWithArchived: ExerciseType[] = [
        { id: "type-1", name: "Standard", color: "#87F5FB", isArchived: false },
        {
          id: "type-2",
          name: "Chair Dips",
          color: "#DE3C4B",
          isArchived: true,
        },
      ];
      const logs = [
        createLog("1", "2024-01-15", "type-1", 30),
        createLog("2", "2024-01-15", "type-2", 20),
      ];
      const data = aggregateLogsForChart(
        logs,
        typesWithArchived,
        50,
        1,
        new Date(2024, 0, 15)
      );
      expect(data[0]["type-1"]).toBe(30);
      expect(data[0]["type-2"]).toBeUndefined();
    });

    it("should include goal in each data point", () => {
      const data = aggregateLogsForChart(
        [],
        mockTypes,
        75,
        1,
        new Date(2024, 0, 15)
      );
      expect(data[0].goal).toBe(75);
    });
  });

  describe("getTotalCount", () => {
    it("should return 0 for empty logs", () => {
      expect(getTotalCount([])).toBe(0);
    });

    it("should sum all log counts", () => {
      const logs = [
        createLog("1", "2024-01-15", "type-1", 10),
        createLog("2", "2024-01-14", "type-2", 20),
        createLog("3", "2024-01-13", "type-1", 30),
      ];
      expect(getTotalCount(logs)).toBe(60);
    });
  });

  describe("getLogsForDate", () => {
    it("should return empty array for no matching logs", () => {
      const logs = [createLog("1", "2024-01-14", "type-1", 10)];
      expect(getLogsForDate(logs, "2024-01-15")).toEqual([]);
    });

    it("should return logs sorted by timestamp (newest first)", () => {
      const logs = [
        createLog("1", "2024-01-15", "type-1", 10, 1000),
        createLog("2", "2024-01-15", "type-2", 20, 3000),
        createLog("3", "2024-01-15", "type-1", 30, 2000),
      ];
      const result = getLogsForDate(logs, "2024-01-15");
      expect(result.map((l) => l.id)).toEqual(["2", "3", "1"]);
    });
  });
});
