import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AppProvider } from "@/context/AppContext";
import { MeasurementLogger } from "@/components/measurements/MeasurementLogger";

function renderLogger(dateKey = "2026-05-10") {
  return render(
    <AppProvider>
      <MeasurementLogger dateKey={dateKey} />
    </AppProvider>
  );
}

function fillByLabel(label: string, value: string) {
  const input = screen.getByLabelText(label) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

function clickSave() {
  fireEvent.click(screen.getByRole("button", { name: /save measurements/i }));
}

describe("MeasurementLogger", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all eight measurement inputs with units in their labels", () => {
    renderLogger();
    for (const label of [
      "Weight (kg)",
      "Waist (cm)",
      "Thigh (cm)",
      "Bicep (cm)",
      "Hips (cm)",
      "Chest (cm)",
      "Neck (cm)",
      "Wrist (cm)",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("aligns each input's min/max with the validator bounds", () => {
    renderLogger();
    expect(screen.getByLabelText("Weight (kg)")).toHaveAttribute("min", "20");
    expect(screen.getByLabelText("Weight (kg)")).toHaveAttribute("max", "500");
    expect(screen.getByLabelText("Wrist (cm)")).toHaveAttribute("min", "10");
    expect(screen.getByLabelText("Wrist (cm)")).toHaveAttribute("max", "30");
    expect(screen.getByLabelText("Neck (cm)")).toHaveAttribute("min", "20");
    expect(screen.getByLabelText("Neck (cm)")).toHaveAttribute("max", "80");
  });

  it("uses step=0.01 on every input for 2-decimal precision", () => {
    renderLogger();
    for (const label of [
      "Weight (kg)",
      "Waist (cm)",
      "Thigh (cm)",
      "Bicep (cm)",
      "Hips (cm)",
      "Chest (cm)",
      "Neck (cm)",
      "Wrist (cm)",
    ]) {
      expect(screen.getByLabelText(label)).toHaveAttribute("step", "0.01");
    }
  });

  it("shows an error when save is clicked with no values entered", () => {
    renderLogger();
    clickSave();
    expect(
      screen.getByText(/enter at least one measurement/i)
    ).toBeInTheDocument();
  });

  it("dispatches a measurement and clears the inputs on save", () => {
    renderLogger();
    fillByLabel("Weight (kg)", "82.55");
    clickSave();

    expect(
      (screen.getByLabelText("Weight (kg)") as HTMLInputElement).value
    ).toBe("");
    expect(screen.getByText(/82\.55 kg/)).toBeInTheDocument();
  });

  it("uses human labels (not internal keys) in validation error messages", () => {
    renderLogger();
    // below the weightKg minimum (20)
    fillByLabel("Weight (kg)", "5");
    clickSave();

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/Weight/);
    expect(alert.textContent).not.toMatch(/weightKg/);
  });

  it("accepts the IEEE-754 edge case 39.59 without a precision error", () => {
    renderLogger();
    fillByLabel("Bicep (cm)", "39.59");
    clickSave();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(/39\.59 cm bicep/)).toBeInTheDocument();
  });

  it("formats saved measurements with two decimal places, omitting blank fields", () => {
    renderLogger();
    fillByLabel("Weight (kg)", "80");
    fillByLabel("Wrist (cm)", "17.5");
    clickSave();
    const row = screen.getByText(/80\.00 kg.*17\.50 cm wrist/);
    expect(row).toBeInTheDocument();
    expect(row.textContent).not.toMatch(/waist|thigh|bicep|hips|chest|neck/);
  });

  it("rejects a value with more than 2 decimal places", () => {
    renderLogger();
    fillByLabel("Weight (kg)", "82.555");
    clickSave();
    expect(screen.getByRole("alert").textContent).toMatch(/decimal/);
  });

  it("removes a measurement when Delete is clicked", () => {
    renderLogger();
    fillByLabel("Weight (kg)", "80");
    clickSave();
    expect(screen.getByText(/80\.00 kg/)).toBeInTheDocument();

    const list = screen.getByRole("list");
    fireEvent.click(
      within(list).getByRole("button", { name: /delete measurement/i })
    );
    expect(screen.queryByText(/80\.00 kg/)).not.toBeInTheDocument();
  });

  it("only lists measurements that belong to the target date", () => {
    const { unmount } = renderLogger("2026-05-10");
    fillByLabel("Weight (kg)", "80");
    clickSave();
    unmount();

    // Re-mount with a different date — the same provider would re-read the
    // persisted state, but the list filter should hide the prior date.
    renderLogger("2026-06-01");
    expect(screen.queryByText(/80\.00 kg/)).not.toBeInTheDocument();
  });
});
