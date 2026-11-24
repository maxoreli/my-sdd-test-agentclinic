import { release } from "node:os";
import { defineConfig, devices, type Project } from "@playwright/test";

const PORT = 3007;

/** The end-to-end tests' own database, rebuilt before every run. */
const E2E_DATABASE = "data/e2e.db";

const mobile = { width: 360, height: 740 };
const tablet = { width: 768, height: 1024 };
const desktop = { width: 1280, height: 800 };

/**
 * Playwright's Firefox build (159, Playwright 1.65) exits at launch on macOS 27
 * (Darwin 27) with "Could not find profile folder", even after a clean
 * reinstall. Skip it there until a Playwright release fixes it; it still runs
 * everywhere else (including Linux CI). Set PLAYWRIGHT_FORCE_FIREFOX=1 to try it.
 */
const firefoxBrokenHere =
  process.platform === "darwin" &&
  Number(release().split(".")[0]) === 27 &&
  process.env.PLAYWRIGHT_FORCE_FIREFOX !== "1";

if (firefoxBrokenHere && !process.env.TEST_WORKER_INDEX) {
  console.warn("Playwright: skipping the firefox-desktop project on macOS 27 (see playwright.config.ts).");
}

const firefoxProjects: Project[] = firefoxBrokenHere
  ? []
  : [{ name: "firefox-desktop", testMatch: /smoke\.spec\.ts/, use: { ...devices["Desktop Firefox"], viewport: desktop } }];

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
    ...firefoxProjects,
    { name: "webkit-desktop", testMatch: /smoke\.spec\.ts/, use: { ...devices["Desktop Safari"], viewport: desktop } },
  ],
});
