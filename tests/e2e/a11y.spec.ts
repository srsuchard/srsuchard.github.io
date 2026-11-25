import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Routes that exist so far. Later tasks add theirs to tests/e2e/routes.ts.
import { ROUTES } from "./routes";

// Checked in the settled state: with scroll-reveal running, elements still fading in near the
// bottom of the viewport are briefly semi-transparent, which axe would measure as low contrast.
test.describe("axe", () => {
  test.use({ reducedMotion: "reduce" });
  for (const path of [...ROUTES, "/missing/"]) {
  test(`no axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
  }
});

test("the first Tab focuses the skip link, which moves focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("focus is visible on header links", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // site name
  const focused = page.locator(":focus");
  await expect(focused).toHaveAttribute("href", "/");
  expect(await focused.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
});

test("the header has the site name and primary navigation", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const name of ["Work", "Hearth", "About", "Contact"]) await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  const gh = nav.getByRole("link", { name: /GitHub/ });
  await expect(gh).toHaveAttribute("href", "https://github.com/srsuchard");
  await expect(gh).toHaveAttribute("rel", "noopener noreferrer");
  await expect(gh).toContainText("(opens external site)");
});

test("the footer states no tracking and links only to GitHub", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("No tracking.");
  const hrefs = await footer.getByRole("link").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs).toEqual(["https://github.com/srsuchard"]);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("every image has meaningful alt text", async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    const missing = await page.locator("img").evaluateAll((imgs) => imgs.filter((i) => !(i.getAttribute("alt") ?? "").trim()).map((i) => i.getAttribute("src")));
    expect(missing, path).toEqual([]);
  }
});
