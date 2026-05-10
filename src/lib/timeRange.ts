import { getDaysInCurrentMonth } from "./date-utils";

export type ChartRange = "7d" | "14d" | "30d" | "60d" | "mtd";

export const rangeOptions: { value: ChartRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "14d", label: "14 Days" },
  { value: "30d", label: "30 Days" },
  { value: "60d", label: "60 Days" },
  { value: "mtd", label: "This Month" },
];

export function getDaysForRange(range: ChartRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "14d":
      return 14;
    case "30d":
      return 30;
    case "60d":
      return 60;
    case "mtd":
      return getDaysInCurrentMonth();
  }
}
