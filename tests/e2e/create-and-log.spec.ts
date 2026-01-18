import { test, expect } from "@playwright/test";

test.describe("Create and Log", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("./");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("should log exercise with default type", async ({ page }) => {
    await page.goto("./log");
    await page.waitForLoadState("networkidle");

    // Standard should be visible (it's selected by default)
    await expect(page.getByText("Standard")).toBeVisible();

    // Click +10 button (accessible name is "Add 10")
    await page.getByRole("button", { name: "Add 10" }).click();

    // Check entry appears in the list
    await expect(page.getByRole("listitem").getByText("+10")).toBeVisible();

    // Navigate to dashboard and verify progress
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("span").filter({ hasText: /^10$/ })
    ).toBeVisible();
  });

  test("should log exercise with custom amount", async ({ page }) => {
    await page.goto("./log");
    await page.waitForLoadState("networkidle");

    // Enter custom amount in the text input
    const input = page.locator('input[placeholder="Enter count"]');
    await input.fill("25");

    // Click Log button
    await page.getByRole("button", { name: "Log" }).click();

    // Check entry appears
    await expect(page.getByText("+25")).toBeVisible();
  });

  test("should create new exercise type with color", async ({ page }) => {
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");

    // Click add exercise type
    await page.getByRole("button", { name: /Add Exercise Type/i }).click();

    // Fill in the name
    const nameInput = page.locator('input[placeholder="e.g., Push-ups"]');
    await nameInput.fill("Burpees");

    // Create the type
    await page.getByRole("button", { name: "Create" }).click();

    // Verify it appears in the list
    await expect(page.getByText("Burpees")).toBeVisible();

    // Navigate to log and verify new type is available
    await page.goto("./log");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Burpees")).toBeVisible();
  });

  test("should switch exercise types when logging", async ({ page }) => {
    await page.goto("./log");
    await page.waitForLoadState("networkidle");

    // Log with Standard (default)
    await page.getByRole("button", { name: "Add 10" }).click();

    // Switch to Chair Dips by clicking on it
    await page.getByText("Chair Dips").click();
    await page.getByRole("button", { name: "Add 10" }).click();

    // Verify both entries exist in the entries list
    const entriesList = page.locator("ul");
    await expect(entriesList.getByText("Standard")).toBeVisible();
    await expect(entriesList.getByText("Chair Dips")).toBeVisible();
  });

  test("should delete a log entry", async ({ page }) => {
    await page.goto("./log");
    await page.waitForLoadState("networkidle");

    // Log an entry
    await page.getByRole("button", { name: "Add 10" }).click();

    // Verify entry exists in the list
    await expect(page.getByRole("listitem").getByText("+10")).toBeVisible();

    // Delete the entry
    await page.getByRole("button", { name: /Delete/i }).click();

    // Verify entry is gone from the list
    await expect(page.getByRole("listitem")).not.toBeVisible();
  });

  test("should show progress on chart after logging", async ({ page }) => {
    await page.goto("./log");
    await page.waitForLoadState("networkidle");

    // Log some exercises
    await page.getByRole("button", { name: "Add 10" }).click();
    await page.getByRole("button", { name: "Add 10" }).click();

    // Navigate to dashboard
    await page.goto("./");
    await page.waitForLoadState("networkidle");

    // Verify progress - use specific locator to avoid chart values
    await expect(
      page.locator("span").filter({ hasText: /^20$/ }).first()
    ).toBeVisible();
    await expect(page.getByText("40%")).toBeVisible();
  });
});
