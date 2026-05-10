import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

test.describe("Export and Import", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("./");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("should export and import data", async ({ page }) => {
    // First, create some data
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");

    // Change daily goal
    const goalInput = page.getByRole("textbox", { name: "Daily Goal" });
    await goalInput.clear();
    await goalInput.fill("100");
    await page.getByRole("button", { name: "Save" }).first().click();

    // Log some exercises
    await page.goto("./log");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Add 10" }).click();
    await page.getByRole("button", { name: "Add 10" }).click();

    // Log a body measurement (with 2-decimal value)
    await page.getByLabel("Weight (kg)").fill("82.55");
    await page.getByLabel("Waist (cm)").fill("88");
    await page.getByLabel("Wrist (cm)").fill("17.25");
    await page.getByRole("button", { name: "Save Measurements" }).click();
    await expect(
      page.getByText(/82\.55 kg.*88\.00 cm waist.*17\.25 cm wrist/)
    ).toBeVisible();

    // Verify data exists
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("span").filter({ hasText: /^20$/ }).first()
    ).toBeVisible();
    await expect(page.getByText("/ 100")).toBeVisible();

    // Export the data
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Backup JSON/i }).click();
    const download = await downloadPromise;

    // Save the downloaded file
    const downloadPath = path.join("/tmp", download.suggestedFilename());
    await download.saveAs(downloadPath);

    // Read the file content
    const fileContent = fs.readFileSync(downloadPath, "utf-8");
    const exportedData = JSON.parse(fileContent);

    // Verify exported data structure
    expect(exportedData.settings.dailyGoal).toBe(100);
    expect(exportedData.logs.length).toBe(2);
    expect(exportedData.measurements.length).toBe(1);
    expect(exportedData.measurements[0].weightKg).toBe(82.55);
    expect(exportedData.measurements[0].wristCm).toBe(17.25);

    // Reset all data
    await page.getByRole("button", { name: /Reset All Data/i }).click();
    await page.getByRole("button", { name: /Yes, Reset/i }).click();

    // Verify data is cleared
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("/ 50")).toBeVisible(); // Back to default

    // Import the exported data
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");

    // Upload the file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(downloadPath);

    // Verify data is restored
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("span").filter({ hasText: /^20$/ }).first()
    ).toBeVisible();
    await expect(page.getByText("/ 100")).toBeVisible();

    // Verify measurements survived the round-trip
    await page.goto("./log");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/82\.55 kg.*88\.00 cm waist.*17\.25 cm wrist/)
    ).toBeVisible();

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test("Excel export contains a Body Measurements sheet", async ({ page }) => {
    // Log a measurement
    await page.goto("./log");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Weight (kg)").fill("82.55");
    await page.getByLabel("Bicep (cm)").fill("35.25");
    await page.getByRole("button", { name: "Save Measurements" }).click();
    // Wait for the measurement to render (and therefore be persisted) before
    // navigating away — guards against a race between the dispatch effect and
    // the SPA reload triggered by page.goto.
    await expect(page.getByText(/82\.55 kg.*35\.25 cm bicep/)).toBeVisible();

    // Trigger Excel download from the settings page
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Export Excel/i }).click();
    const download = await downloadPromise;

    const downloadPath = path.join("/tmp", download.suggestedFilename());
    await download.saveAs(downloadPath);

    const workbook = XLSX.readFile(downloadPath);
    expect(workbook.SheetNames).toContain("Exercise Logs");
    expect(workbook.SheetNames).toContain("Body Measurements");

    const measurementSheet = workbook.Sheets["Body Measurements"];
    const headers = XLSX.utils.sheet_to_json<string[]>(measurementSheet, {
      header: 1,
    })[0];
    expect(headers).toContain("Weight (kg)");
    expect(headers).toContain("Waist (cm)");
    expect(headers).toContain("Thigh (cm)");
    expect(headers).toContain("Bicep (cm)");
    expect(headers).toContain("Hips (cm)");
    expect(headers).toContain("Chest (cm)");
    expect(headers).toContain("Neck (cm)");
    expect(headers).toContain("Wrist (cm)");

    const rows =
      XLSX.utils.sheet_to_json<Record<string, unknown>>(measurementSheet);
    expect(rows).toHaveLength(1);
    expect(rows[0]["Weight (kg)"]).toBe(82.55);
    expect(rows[0]["Bicep (cm)"]).toBe(35.25);

    fs.unlinkSync(downloadPath);
  });

  test("should show error for invalid import file", async ({ page }) => {
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");

    // Create an invalid JSON file
    const invalidPath = path.join("/tmp", "invalid.json");
    fs.writeFileSync(invalidPath, "{ invalid json }");

    // Try to import it
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidPath);

    // Should show error
    await expect(page.getByText(/Failed to parse/i)).toBeVisible();

    // Clean up
    fs.unlinkSync(invalidPath);
  });

  test("should reset data correctly", async ({ page }) => {
    // Create some data first
    await page.goto("./log");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Add 10" }).click();

    // Verify data exists in the list
    await expect(page.getByRole("listitem").getByText("+10")).toBeVisible();

    // Reset
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Reset All Data/i }).click();
    await page.getByRole("button", { name: /Yes, Reset/i }).click();

    // Verify reset - no list items should exist
    await page.goto("./log");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("listitem")).not.toBeVisible();
  });
});
