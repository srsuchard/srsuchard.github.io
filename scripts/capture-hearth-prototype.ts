// Captures the public landing view of Samuel's Base44 design prototype for Hearth.
//
//   OUT_DIR=<dir> pnpm tsx scripts/capture-hearth-prototype.ts
//
// Only the public landing page; nothing behind sign-in. Published with the caveat that it is a
// design prototype, not the Hearth product.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const URL = "https://keept-safe-space.base44.app";
const OUT = process.env.OUT_DIR;
if (!OUT) throw new Error("Set OUT_DIR");

async function main() {
  mkdirSync(OUT!, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // The app keeps a connection open, so "networkidle" never fires: wait for load plus visible text.
  await page.goto(URL, { waitUntil: "load", timeout: 60_000 });
  await page.waitForFunction(() => (document.body?.innerText ?? "").trim().length > 40, undefined, { timeout: 30_000 });
  await page.waitForTimeout(3000); // let entrance animations settle
  console.log("final URL:", page.url());
  console.log("title:", await page.title());
  await page.screenshot({ path: join(OUT!, "landing.png") });
  await page.screenshot({ path: join(OUT!, "landing-full.png"), fullPage: true });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
