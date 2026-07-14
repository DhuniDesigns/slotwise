import { expect, test } from "@playwright/test";
import { resetDemoData, waitForAppReady } from "./helpers";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile layout audit runs only in the mobile project.");
  await resetDemoData(page);
});

test("mobile dashboard navigation links back to booking and overview", async ({ page }) => {
  await page.goto("/dashboard/appointments");
  await waitForAppReady(page);
  await expect(page.getByRole("heading", { name: "Appointments" })).toBeVisible();

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Open Public Booking Page Connected to this workspace" }).click();
  await expect(page.getByRole("heading", { name: "What would you like to schedule?" })).toBeVisible();
  await page.getByRole("link", { name: "Back to Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Good afternoon, Maya." })).toBeVisible();
});

test("mobile booking and login layouts do not overflow horizontally", async ({ page }) => {
  for (const route of ["/book/maya", "/login"] as const) {
    await page.goto(route);
    await waitForAppReady(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  }

  await expect(page.getByLabel("Email Address")).toBeVisible();
  await expect(page.locator("input[name='password']")).toBeVisible();
  await page.getByRole("button", { name: "Forgot Password?" }).click();
  await expect(page.getByRole("heading", { name: "Reset your password." })).toBeVisible();
});
