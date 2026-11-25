import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

// No sideways scrolling at any width, including 320px, and the header always fits.
// Widths are set explicitly, so this runs once (desktop project).
const WIDTHS = [320, 375, 768, 1024, 1440];

test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "sets its own viewport widths"));

for (const path of [...ROUTES, "/missing/"]) {
  test(`no horizontal overflow on ${path}`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
      expect(scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(innerWidth);
      const overflowingHeaderItems = await page.locator("body > header a").evaluateAll((els, w) => els.filter((el) => el.getBoundingClientRect().right > w).length, width);
      expect(overflowingHeaderItems, `header at ${width}px`).toBe(0);
    }
  });
}
