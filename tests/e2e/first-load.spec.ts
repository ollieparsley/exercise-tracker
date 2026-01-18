import { test, expect } from "@playwright/test";

test.describe("First Load", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("./");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Wait for app to be ready
    await page.waitForLoadState("networkidle");
  });

  test("should show default daily goal of 50", async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("networkidle");

    // Check for the goal display on dashboard
    await expect(page.getByText("/ 50")).toBeVisible();
  });

  test("should show default exercise types", async ({ page }) => {
    await page.goto("./log");
    await page.waitForLoadState("networkidle");

    // Check for default types using text content
    await expect(page.getByText("Standard")).toBeVisible();
    await expect(page.getByText("Chair Dips")).toBeVisible();
  });

  test("should update daily goal in settings", async ({ page }) => {
    await page.goto("./settings");
    await page.waitForLoadState("networkidle");

    // Find the goal input and change it
    const goalInput = page.getByRole("textbox", { name: "Daily Goal" });
    await goalInput.clear();
    await goalInput.fill("75");

    // Click save
    await page.getByRole("button", { name: "Save" }).first().click();

    // Navigate to dashboard and verify
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("/ 75")).toBeVisible();
  });

  test("should navigate between pages", async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("networkidle");

    // Check dashboard is visible
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();

    // Navigate to Log
    await page.getByRole("link", { name: /Log/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Log Exercise")).toBeVisible();

    // Navigate to History
    await page.getByRole("link", { name: /History/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("History")).toBeVisible();

    // Navigate to Settings
    await page.getByRole("link", { name: /Settings/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Settings")).toBeVisible();
  });
});
