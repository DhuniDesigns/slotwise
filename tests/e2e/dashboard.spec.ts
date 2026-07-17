import { expect, test } from "@playwright/test";
import { resetDemoData, waitForAppReady } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetDemoData(page);
});

test("major routes render without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const routes = [
    ["/", "Appointments without the back-and-forth."],
    ["/login", "Sign in to Slotwise"],
    ["/privacy", "Your scheduling data stays intentionally limited."],
    ["/terms", "Use Slotwise to manage bookings responsibly."],
    ["/book/maya", "What would you like to schedule?"],
    ["/dashboard", "Good afternoon, Maya."],
    ["/dashboard/calendar", "Calendar"],
    ["/dashboard/appointments", "Appointments"],
    ["/dashboard/availability", "Availability"],
    ["/dashboard/appointment-types", "Appointment types"],
    ["/dashboard/settings", "Settings"],
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
});

test("login supports email/password, show password, forgot password, and legal links", async ({ page }) => {
  await page.goto("/login");
  await waitForAppReady(page);

  await expect(page.getByLabel("Email Address")).toBeVisible();
  await expect(page.locator("input[name='password']")).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  await expect(page.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");

  await page.getByRole("button", { name: "Show" }).click();
  await expect(page.locator("input[name='password']")).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide" }).click();
  await expect(page.locator("input[name='password']")).toHaveAttribute("type", "password");

  await page.route("**/auth/v1/recover**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.getByRole("button", { name: "Forgot Password?" }).click();
  await expect(page.getByRole("heading", { name: "Reset your password." })).toBeVisible();
  await page.getByLabel("Email Address").fill("maya@studio.co");
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  await page.getByRole("button", { name: "Back to Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Sign in to Slotwise" })).toBeVisible();
});

test("forgot password shows a clear error when Supabase Auth is unreachable", async ({ page }) => {
  await page.route("**/auth/v1/recover**", async (route) => {
    await route.abort("failed");
  });

  await page.goto("/login");
  await waitForAppReady(page);

  await page.getByRole("button", { name: "Forgot Password?" }).click();
  await page.getByLabel("Email Address").fill("maya@studio.co");
  await page.getByRole("button", { name: "Send Reset Link" }).click();

  await expect(page.locator(".auth-message[role='alert']")).toContainText("Could not reach Supabase Auth");
  await expect(page.getByRole("button", { name: "Send Reset Link" })).toBeEnabled();
});

test("dashboard calendar switches between schedule views", async ({ page }) => {
  await page.goto("/dashboard/calendar");
  await waitForAppReady(page);
  await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();

  await page.getByRole("button", { name: "Month" }).click();
  await expect(page.locator(".month-calendar")).toBeVisible();
  await page.getByRole("button", { name: "Agenda" }).click();
  await expect(page.locator(".agenda-view")).toBeVisible();
  await page.getByRole("button", { name: "Week", exact: true }).click();
  await expect(page.locator(".week-calendar")).toBeVisible();
});

test("host can reschedule an appointment", async ({ page }) => {
  await page.goto("/dashboard/appointments");
  await waitForAppReady(page);

  await page.locator("button.table-row").filter({ hasText: "Ife Adeyemi" }).click();
  await expect(page.getByRole("dialog", { name: "Appointment details" })).toBeVisible();
  await page.getByRole("button", { name: "Reschedule" }).click();
  await expect(page.getByRole("heading", { name: "Reschedule appointment" })).toBeVisible();
  await page.getByLabel("New date").selectOption("2026-07-14");
  await page.getByLabel("New time").selectOption("11:30");
  await page.getByRole("button", { name: "Confirm new time" }).click();
  await expect(page.getByRole("status")).toContainText("Appointment rescheduled");
  await expect(page.locator("button.table-row").filter({ hasText: "Ife Adeyemi" })).toContainText("11:30");
});

test("host must explain a cancellation and can cancel", async ({ page }) => {
  await page.goto("/dashboard/appointments");
  await waitForAppReady(page);

  await page.locator("button.table-row").filter({ hasText: "Ife Adeyemi" }).click();
  await expect(page.getByRole("dialog", { name: "Appointment details" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel appointment" }).click();
  const confirm = page.getByRole("button", { name: "Cancel appointment" });
  await expect(confirm).toBeDisabled();
  await page.getByLabel("Reason for cancellation").fill("Schedule conflict");
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole("status")).toContainText("Appointment cancelled");
  await page.getByRole("button", { name: "Cancelled" }).click();
  await expect(page.locator("button.table-row").filter({ hasText: "Ife Adeyemi" })).toContainText("cancelled");
});

test("availability, appointment types, and settings controls respond", async ({ page }) => {
  await page.goto("/dashboard/availability");
  await waitForAppReady(page);
  await page.getByLabel("Saturday availability").setChecked(true, { force: true });
  await page.getByRole("button", { name: "+ Add override" }).click();
  await expect(page.locator(".override-row")).toHaveCount(2);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("button", { name: /Saved/ })).toBeVisible();

  await page.goto("/dashboard/appointment-types");
  await waitForAppReady(page);
  await page.getByRole("button", { name: "New appointment type" }).click();
  await expect(page.getByRole("heading", { name: "Create a session" })).toBeVisible();
  await page.getByLabel("Name").fill("Advisory call");
  await page.getByLabel("Description").fill("A focused advisory session.");
  await page.getByRole("button", { name: "Save appointment type" }).click();
  await expect(page.getByRole("heading", { name: "Advisory call" })).toBeVisible();

  await page.goto("/dashboard/settings");
  await waitForAppReady(page);
  await page.getByLabel("Display name").fill("Maya Studio");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("button", { name: "Changes saved" })).toBeVisible();
});
