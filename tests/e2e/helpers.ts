import { expect, type Page } from "@playwright/test";

export async function resetDemoData(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => localStorage.clear());
}

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).not.toHaveText(/Loading|Unhandled Runtime Error/i);
  await page.waitForFunction(() => document.readyState === "complete");
  await page.waitForTimeout(100);
}

