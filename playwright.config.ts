import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Local-only settings such as PORTFOLIO_BLOCKED_NAMES (git-ignored).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// Tests run against the exported site served by the GitHub Pages mimic (scripts/serve-out.mjs),
// or against a deployed site when BASE_URL is set. `pnpm test:e2e` builds out/ first.
const BASE_URL = process.env.BASE_URL;
const PORT = 3200;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL ?? `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  ...(BASE_URL
    ? {}
    : {
        webServer: {
          command: `node scripts/serve-out.mjs --port ${PORT}`,
          url: `http://127.0.0.1:${PORT}/`,
          reuseExistingServer: false,
        },
      }),
});
