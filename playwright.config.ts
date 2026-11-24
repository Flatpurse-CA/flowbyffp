import { defineConfig, devices } from "@playwright/test";

/**
 * E2E. Runs against E2E_BASE_URL if set (e.g. a Vercel preview), otherwise starts
 * `next dev` on port 3100. Seeded tests need scripts/seed-demo.mjs run against the
 * same (non-production) database, and E2E_SHOP_HANDLE / E2E_OWNER_* set.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: "npx next dev -p 3100", url: baseURL, reuseExistingServer: true, timeout: 180_000,
  },
});
