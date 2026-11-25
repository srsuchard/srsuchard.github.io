import { expect, test, type Page } from "@playwright/test";
import { ROUTES } from "./routes";

// Content must never depend on JavaScript or on motion. These run once (desktop project).
test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "viewport-independent"));

async function opacities(page: Page) {
  return page.locator("[data-reveal]").evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
}

test.describe("with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  // One test per page: each walks every block on a long page, which can exceed the default timeout on a loaded machine.
  for (const path of ["/", "/projects/projectstrike/", "/hearth/"]) {
    test(`every revealed block on ${path} becomes fully visible when scrolled into view`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto(path);
      const blocks = page.locator("[data-reveal]");
      const n = await blocks.count();
      expect(n, path).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        await blocks.nth(i).evaluate((el) => el.scrollIntoView({ block: "start" }));
        await expect.poll(() => blocks.nth(i).evaluate((el) => getComputedStyle(el).opacity), { message: `${path} block ${i}` }).toBe("1");
      }
    });
  }

  test("navigation works without JavaScript", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work");
    await page.getByRole("link", { name: /AgentSafe/ }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("AgentSafe");
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing animates and everything is visible without scrolling", async ({ page }) => {
    for (const path of ROUTES) {
      await page.goto(path);
      const names = await page.locator("[data-reveal]").evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
      expect(names.every((n) => n === "none"), path).toBe(true);
      expect((await opacities(page)).every((o) => o === "1"), path).toBe(true);
    }
  });
});

test("without scroll-driven animation support, the base styles leave everything visible", async ({ page }) => {
  // Simulate an unsupporting browser by removing the animation; the base state must not be hidden.
  await page.goto("/");
  await page.addStyleTag({ content: "[data-reveal]{animation:none !important}" });
  expect((await opacities(page)).every((o) => o === "1")).toBe(true);
});
