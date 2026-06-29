import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { env } from "./environments";

dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

/* Test directories — one per suite. */
const e2eDir = "tests/e2e";
const apiDir = "tests/api";

/* E2E (UI) suite — full desktop + mobile browser matrix. */
const e2eProjects = [
  { name: "chromium", testDir: e2eDir, use: { ...devices["Desktop Chrome"] } },
  { name: "firefox", testDir: e2eDir, use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", testDir: e2eDir, use: { ...devices["Desktop Safari"] } },
  /* Mobile viewports. */
  { name: "Mobile Chrome", testDir: e2eDir, use: { ...devices["Pixel 9"] } },
  { name: "Mobile Safari", testDir: e2eDir, use: { ...devices["iPhone 14"] } },
];

/* API suite — browserless (no device), so these run once, not per browser. */
const apiProjects = [{ name: "api", testDir: apiDir }];

/**
 * Named project sets. Select one with the SUITE env var; defaults to `all`
 * so plain `npm test` runs both the E2E and API suites.
 */
const suites = {
  e2e: e2eProjects,
  api: apiProjects,
  all: [...e2eProjects, ...apiProjects],
};

const suite = (process.env.SUITE ?? "all") as keyof typeof suites;

export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters
   * On CI, emit a blob report named after the suite (api.zip / e2e.zip) so the
   * separate jobs can be merged into one HTML report (see the merge-report job
   * in .github/workflows/playwright.yml). Locally, use the plain HTML report. */
  reporter: process.env.CI ? [["blob", { fileName: `${suite}.zip` }]] : "html",
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: env.baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    /* Headless in CI (no display server), headed locally for debugging. */
    headless: !!process.env.CI,
  },

  /* Projects chosen by the SUITE env var (see `suites` above). */
  projects: suites[suite] ?? suites.all,
});
