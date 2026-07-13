import { expect, test } from "@playwright/test";

test("invitee can complete the public booking flow", async ({ page }) => {
  await page.goto("/book/maya");
  await expect(page.getByRole("heading", { name: "What would you like to schedule?" })).toBeVisible();
  await page.locator("button.service-card").filter({ hasText: "Brand consultation" }).click();
  await page.getByRole("button", { name: "10:30", exact: true }).click();
  await page.getByLabel("Full name").fill("Ada Client");
  await page.getByLabel("Email address").fill("ada@example.com");
  await page.getByRole("checkbox", { name: "I agree to receive emails about this appointment." }).check();
  await page.getByRole("button", { name: "Confirm booking · 10:30" }).click();
  await expect(page.getByRole("heading", { name: "You’re all set, Ada." })).toBeVisible();
});

