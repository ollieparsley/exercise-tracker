import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

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

    // Clean up
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
