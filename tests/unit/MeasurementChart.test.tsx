import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppProvider } from "@/context/AppContext";
import { MeasurementChart } from "@/components/dashboard/MeasurementChart";
import { DEFAULT_STATE } from "@/lib/storage";
import type { Measurement } from "@/types";

const STORAGE_KEY = "exercise-tracker-state";

function seedMeasurements(measurements: Measurement[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...DEFAULT_STATE, measurements })
  );
}

function renderChart() {
  return render(
    <AppProvider>
      <MeasurementChart />
    </AppProvider>
  );
}

// Recharts measures its container before drawing. jsdom reports 0×0, so we
// force a real size to make Lines/YAxes mount.
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () =>
      ({
        width: 600,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

describe("MeasurementChart", () => {
  it("renders nothing when no measurements have ever been logged", () => {
    const { container } = renderChart();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the 'no data in this period' hint when measurements exist but fall outside the range", () => {
    // 31 days ago — outside the default 30-day window
    const old = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const oldDate = new Date(old).toISOString().split("T")[0];
    seedMeasurements([
      {
        id: "m-1",
        timestamp: old,
        dateKey: oldDate,
        weightKg: 80,
      },
    ]);
    renderChart();
    expect(
      screen.getByText(/No measurements recorded in this period/i)
    ).toBeInTheDocument();
    // Time-range buttons should be present so the user can widen the window.
    expect(screen.getByRole("radio", { name: "7 Days" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "30 Days" })).toBeInTheDocument();
  });

  it("renders the chart and a legend entry per populated metric when data is present", () => {
    const today = new Date().toISOString().split("T")[0];
    seedMeasurements([
      {
        id: "m-1",
        timestamp: Date.now(),
        dateKey: today,
        weightKg: 82.5,
        waistCm: 88,
      },
    ]);
    renderChart();
    expect(
      screen.queryByText(/No measurements recorded in this period/i)
    ).not.toBeInTheDocument();

    // Legend shows the two populated fields with their axis units, and not the
    // un-populated ones.
    expect(screen.getByText("Weight (kg)")).toBeInTheDocument();
    expect(screen.getByText("Waist (cm)")).toBeInTheDocument();
    expect(screen.queryByText("Thigh (cm)")).not.toBeInTheDocument();
    expect(screen.queryByText("Bicep (cm)")).not.toBeInTheDocument();
  });

  it("clicking a time-range button switches the active selection", () => {
    // Time-range buttons only render once at least one measurement exists.
    const today = new Date().toISOString().split("T")[0];
    seedMeasurements([
      {
        id: "m-1",
        timestamp: Date.now(),
        dateKey: today,
        weightKg: 82.5,
      },
    ]);
    renderChart();
    const sevenDays = screen.getByRole("radio", { name: "7 Days" });
    const thirtyDays = screen.getByRole("radio", { name: "30 Days" });
    // Default is 30 Days for this chart.
    expect(thirtyDays).toHaveAttribute("aria-checked", "true");
    expect(sevenDays).toHaveAttribute("aria-checked", "false");

    fireEvent.click(sevenDays);

    expect(sevenDays).toHaveAttribute("aria-checked", "true");
    expect(thirtyDays).toHaveAttribute("aria-checked", "false");
  });
});
