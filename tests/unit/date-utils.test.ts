import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDateKey,
  getTodayKey,
  daysBetween,
  getLastNDays,
  formatDateLabel,
  parseDate,
  isToday,
  isPast,
  isFuture,
} from "@/lib/date-utils";

describe("date-utils", () => {
  describe("getDateKey", () => {
    it("should format date as YYYY-MM-DD", () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      expect(getDateKey(date)).toBe("2024-01-15");
    });

    it("should pad single-digit months and days", () => {
      const date = new Date(2024, 4, 5); // May 5, 2024
      expect(getDateKey(date)).toBe("2024-05-05");
    });

    it("should handle December correctly", () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      expect(getDateKey(date)).toBe("2024-12-31");
    });
  });

  describe("getTodayKey", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return today's date as YYYY-MM-DD", () => {
      vi.setSystemTime(new Date(2024, 5, 20)); // June 20, 2024
      expect(getTodayKey()).toBe("2024-06-20");
    });
  });

  describe("daysBetween", () => {
    it("should return 1 for the same day", () => {
      expect(daysBetween("2024-01-15", "2024-01-15")).toBe(1);
    });

    it("should return correct count for consecutive days", () => {
      expect(daysBetween("2024-01-15", "2024-01-16")).toBe(2);
    });

    it("should return correct count for a week", () => {
      expect(daysBetween("2024-01-01", "2024-01-07")).toBe(7);
    });

    it("should handle month boundaries", () => {
      expect(daysBetween("2024-01-30", "2024-02-02")).toBe(4);
    });

    it("should handle year boundaries", () => {
      expect(daysBetween("2023-12-30", "2024-01-02")).toBe(4);
    });
  });

  describe("getLastNDays", () => {
    it("should return array of N days ending with provided date", () => {
      const endDate = new Date(2024, 0, 15); // January 15, 2024
      const days = getLastNDays(3, endDate);
      expect(days).toEqual(["2024-01-13", "2024-01-14", "2024-01-15"]);
    });

    it("should handle month boundaries", () => {
      const endDate = new Date(2024, 1, 2); // February 2, 2024
      const days = getLastNDays(5, endDate);
      expect(days).toEqual([
        "2024-01-29",
        "2024-01-30",
        "2024-01-31",
        "2024-02-01",
        "2024-02-02",
      ]);
    });

    it("should return 14 days for default chart range", () => {
      const endDate = new Date(2024, 0, 20);
      const days = getLastNDays(14, endDate);
      expect(days.length).toBe(14);
      expect(days[0]).toBe("2024-01-07");
      expect(days[13]).toBe("2024-01-20");
    });
  });

  describe("formatDateLabel", () => {
    it("should format as short date by default", () => {
      const label = formatDateLabel("2024-01-15");
      expect(label).toBe("Jan 15");
    });

    it("should format as weekday when specified", () => {
      const label = formatDateLabel("2024-01-15", "weekday"); // Monday
      expect(label).toBe("Mon");
    });
  });

  describe("parseDate", () => {
    it("should parse date key string to Date object", () => {
      const date = parseDate("2024-01-15");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(15);
    });
  });

  describe("isToday, isPast, isFuture", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("isToday should return true for today", () => {
      expect(isToday("2024-06-15")).toBe(true);
      expect(isToday("2024-06-14")).toBe(false);
      expect(isToday("2024-06-16")).toBe(false);
    });

    it("isPast should return true for past dates", () => {
      expect(isPast("2024-06-14")).toBe(true);
      expect(isPast("2024-06-15")).toBe(false);
      expect(isPast("2024-06-16")).toBe(false);
    });

    it("isFuture should return true for future dates", () => {
      expect(isFuture("2024-06-16")).toBe(true);
      expect(isFuture("2024-06-15")).toBe(false);
      expect(isFuture("2024-06-14")).toBe(false);
    });
  });
});
