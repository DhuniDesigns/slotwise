import { expect, test } from "@playwright/test";
import { resetDemoData, waitForAppReady } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetDemoData(page);
});

test("invitee sees validation and completes the public booking flow", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/book/maya");
  await waitForAppReady(page);
  await expect(page.getByRole("heading", { name: "What would you like to schedule?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "← Back to Dashboard" })).toHaveAttribute("href", "/dashboard");

  await page.getByRole("button", { name: "Book Brand consultation, 30 minutes" }).click();
  await expect(page.getByRole("heading", { name: "July 2026" })).toBeVisible();
  await page.getByRole("button", { name: "10:30" }).click();
  await expect(page.getByRole("heading", { name: "Tell Maya a little about you." })).toBeVisible();

  await page.getByRole("button", { name: "Confirm Booking · 10:30" }).click();
  await expect(page).toHaveURL(/\/book\/maya$/);

  await page.getByLabel("Full Name").fill("Ada Client");
  await page.getByLabel("Email Address").fill("ada@example.com");
  await page.getByRole("button", { name: "Confirm Booking · 10:30" }).click();
  await expect(page).toHaveURL(/\/book\/maya$/);

  await page.getByRole("checkbox", { name: "I agree to receive emails about this appointment." }).check();
  await Promise.all([
    page.waitForURL(/\/book\/maya\/confirmation\//, { timeout: 30_000 }),
    page.getByRole("button", { name: "Confirm Booking · 10:30" }).click(),
  ]);
  await waitForAppReady(page);
  await expect(page.getByRole("heading", { name: "You’re all set, Ada." })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: "Open Dashboard" })).toHaveAttribute("href", "/dashboard/appointments");
  expect(consoleErrors).toEqual([]);
});
