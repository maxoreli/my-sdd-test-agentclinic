import { defineConfig, devices } from "@playwright/test";

const PORT = 3007;

/** The end-to-end tests' own database, rebuilt before every run. */
const E2E_DATABASE = "data/e2e.db";

const mobile = { width: 360, height: 740 };
const tablet = { width: 768, height: 1024 };
const desktop = { width: 1280, height: 800 };

export default defineConfig({
  testDir: "e2e",
  // Tests share one database and server, so run them one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // Serves the production build: run `npm run build` first (`npm run validate` does).
  webServer: {
    command: `tsx scripts/e2e-db.ts && next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    env: { DATABASE_URL: E2E_DATABASE },
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Desktop Chrome"], viewport: mobile, isMobile: true, hasTouch: true },
    },
    { name: "chromium-tablet", use: { ...devices["Desktop Chrome"], viewport: tablet } },
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: desktop } },
    // Smoke checks only: dark mode on a small screen, and the other browser engines.
    {
      name: "chromium-dark",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: mobile, isMobile: true, hasTouch: true, colorScheme: "dark" },
    },
    { name: "firefox-desktop", testMatch: /smoke\.spec\.ts/, use: { ...devices["Desktop Firefox"], viewport: desktop } },
    { name: "webkit-desktop", testMatch: /smoke\.spec\.ts/, use: { ...devices["Desktop Safari"], viewport: desktop } },
  ],
});
