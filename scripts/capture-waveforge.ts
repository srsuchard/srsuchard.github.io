// Captures WaveForge screens for the portfolio, using the app's built-in demo data.
//
//   WAVEFORGE_URL=http://127.0.0.1:3300 OUT_DIR=<dir> pnpm tsx scripts/capture-waveforge.ts
//
// Run against a production build of a temporary clone (never the original repo). Onboarding uses a
// fictional name; Settings → Your data → Load demo data adds the sample records shown. Every capture
// is published with demoData: true and the visible label "Demo data".
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, expect, type Page } from "@playwright/test";

const BASE = process.env.WAVEFORGE_URL ?? "http://127.0.0.1:3300";
const OUT = process.env.OUT_DIR;
if (!OUT) throw new Error("Set OUT_DIR");

async function onboard(page: Page) {
  await page.goto(`${BASE}/`);
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByRole("button", { name: "Get started" }).click();
  await page.getByLabel("What should we call you?").fill("Kai");
  await page.getByText("Beginner", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Improve my pop-up", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  const today = await page.evaluate(() => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(new Date().getDay() + 6) % 7]!);
  const box = page.getByRole("checkbox", { name: today, exact: true });
  if (!(await box.isChecked())) await page.locator("label", { has: box }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Build my plan" }).click();
  await expect(page.getByRole("heading", { name: "Your plan is ready" })).toBeVisible();
  await page.goto(`${BASE}/settings`);
  await page.getByRole("button", { name: "Load demo data" }).click();
}

async function shot(page: Page, path: string, name: string) {
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT!, `${name}.png`) });
}

async function main() {
  mkdirSync(OUT!, { recursive: true });
  const browser = await chromium.launch();
  for (const [suffix, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["mobile", { width: 390, height: 844 }],
  ] as const) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: suffix === "mobile" ? 2 : 1, colorScheme: "dark" });
    await onboard(page);
    await shot(page, "/today", `today-${suffix}`);
    await shot(page, "/plan", `plan-${suffix}`);
    await shot(page, "/library", `library-${suffix}`);
    await shot(page, "/progress", `progress-${suffix}`);
    // Workout player: start today's session and capture the first exercise.
    await page.goto(`${BASE}/today`);
    await page.getByRole("button", { name: "Start workout" }).click();
    await expect(page).toHaveURL(/\/play/);
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT!, `player-${suffix}.png`) });
    await page.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
