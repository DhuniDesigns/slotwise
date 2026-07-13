import { expect, test } from "@playwright/test";

test("dashboard switches between schedule views", async ({ page }) => {
  await page.goto("/dashboard/calendar");
  await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
  await page.getByRole("button", { name: "Month" }).click();
  await expect(page.locator(".month-calendar")).toBeVisible();
  await page.getByRole("button", { name: "Agenda" }).click();
  await expect(page.locator(".agenda-view")).toBeVisible();
});

test("host must explain a cancellation", async ({ page }) => {
  await page.goto("/dashboard/appointments");
  await page.locator("button.table-row").filter({ hasText: "Ife Adeyemi" }).click();
  await page.getByRole("button", { name: "Cancel appointment" }).click();
  const confirm = page.getByRole("button", { name: "Cancel appointment" });
  await expect(confirm).toBeDisabled();
  await page.getByLabel("Reason for cancellation").fill("Schedule conflict");
  await expect(confirm).toBeEnabled();
});
