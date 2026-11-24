import { expect, test } from "@playwright/test";

// No data or login needed: pages render and private routes stay private.
test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Flow/);
});

test("login form renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test("signup page renders", async ({ page }) => {
  const res = await page.goto("/signup");
  expect(res?.status()).toBeLessThan(400);
});

test("unknown booking page is a 404", async ({ page }) => {
  const res = await page.goto("/book/this-shop-does-not-exist-e2e");
  expect(res?.status()).toBe(404);
});

test("dashboard sends logged-out visitors to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("admin pages send logged-out visitors to admin login", async ({ page }) => {
  await page.goto("/admin/messages");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("a forged resume-signup link goes to login", async ({ page }) => {
  await page.goto("/signup/resume?t=forged.token");
  await expect(page).toHaveURL(/\/login/);
});

test("cron endpoints reject callers without the secret", async ({ request }) => {
  for (const path of ["/api/cron/jobs", "/api/cron/lifecycle", "/api/cron/billing", "/api/cron/autopilot"]) {
    expect((await request.get(path)).status(), path).toBe(401);
  }
  expect((await request.get("/api/cron/jobs", { headers: { Authorization: "Bearer jobs:wrong" } })).status()).toBe(401);
});

test("commission CSV export needs an owner session", async ({ request }) => {
  expect((await request.get("/dashboard/team/commissions/export")).status()).toBe(401);
});
