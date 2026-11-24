import { expect, test, type Page } from "@playwright/test";

// Needs scripts/seed-demo.mjs against the same non-production database.
const handle = process.env.E2E_SHOP_HANDLE;
const email = process.env.E2E_OWNER_EMAIL;
const password = process.env.E2E_OWNER_PASSWORD;
test.skip(!handle || !email || !password, "Set E2E_SHOP_HANDLE, E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD (see scripts/seed-demo.mjs)");

async function login(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard/);
}

test("public booking page shows the shop and its services", async ({ page }) => {
  await page.goto(`/book/${handle}`);
  await expect(page.getByText("Demo Salon").first()).toBeVisible();
  await expect(page.getByText("Women's Cut").first()).toBeVisible();
});

test("owner sees the dashboard with live numbers", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText(/Complete your setup|Today's schedule/).first()).toBeVisible();
});

test("commissions report lists the team and booth renter", async ({ page }) => {
  await login(page);
  await page.goto("/dashboard/team/commissions");
  await expect(page.getByRole("heading", { name: "Commissions" })).toBeVisible();
  await expect(page.getByText("Ava Chen").first()).toBeVisible();
  await expect(page.getByText("Booth renter").first()).toBeVisible();
});

test("commission CSV downloads for the owner", async ({ page }) => {
  await login(page);
  const res = await page.request.get("/dashboard/team/commissions/export");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("Total owed");
});

test("team security settings are visible to the owner", async ({ page }) => {
  await login(page);
  await page.goto("/dashboard/settings/security");
  await expect(page.getByText("Require 2-step verification for every team member")).toBeVisible();
  await expect(page.getByText("Who can issue refunds")).toBeVisible();
});

test("client import page loads", async ({ page }) => {
  await login(page);
  await page.goto("/dashboard/migrate");
  await expect(page.getByRole("heading", { name: "Switch to Flow" })).toBeVisible();
});
