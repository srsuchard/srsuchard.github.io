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

    await page.goto("/");
    const intro = page.locator("[data-intro]");
    expect((await intro.evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName))).every((n) => n === "none")).toBe(true);
    expect((await intro.evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity))).every((o) => o === "1")).toBe(true);
  });
});

test.describe("with motion enabled", () => {
  test.use({ reducedMotion: "no-preference" });

  test("scroll reveals stay within the 250ms motion budget", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "true");

    const motionTimes = await page.locator("[data-reveal]").evaluateAll((els) =>
      els.flatMap((el) => {
        const style = getComputedStyle(el);
        const toMilliseconds = (value: string) => {
          const amount = Number.parseFloat(value.trim());
          return value.trim().endsWith("ms") ? amount : amount * 1000;
        };
        const durations = style.transitionDuration.split(",").map(toMilliseconds);
        const delays = style.transitionDelay.split(",").map(toMilliseconds);
        return durations.map((duration, index) => duration + (delays[index % delays.length] ?? 0));
      }),
    );
    expect(motionTimes.length).toBeGreaterThan(0);
    expect(Math.max(...motionTimes)).toBeLessThanOrEqual(250);
  });
});

test("without Intersection Observer support, the base styles leave everything visible", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", { configurable: true, value: undefined });
  });
  await page.goto("/");
  expect((await opacities(page)).every((o) => o === "1")).toBe(true);
});

test("if the reveal observer fails to initialize, content stays visible", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() => {
    const NativeObserver = window.IntersectionObserver;
    const BrokenObserver = class extends NativeObserver {
      observe(target: Element) {
        if (target.matches("[data-reveal]")) throw new Error("observer unavailable");
        super.observe(target);
      }
    };
    Object.defineProperty(window, "IntersectionObserver", { configurable: true, value: BrokenObserver });
  });
  await page.goto("/");

  expect((await opacities(page)).every((opacity) => opacity === "1")).toBe(true);
  await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready", "true");
  expect(errors.some((message) => message.includes("Scroll reveal initialization failed"))).toBe(true);
});
