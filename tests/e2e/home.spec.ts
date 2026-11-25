import { expect, test } from "@playwright/test";

const HERO = "I build software, solve difficult problems, and turn ambitious ideas into working products.";
const CAVEAT = "Design prototype built on Base44. It is not the Hearth product, and none of Hearth's planned security features are implemented.";
const ALLOWED_GITHUB = ["https://github.com/srsuchard", "https://github.com/srsuchard/agentsafe"];

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sections appear in the approved order", async ({ page }) => {
    const ids = await page.locator("main > section[id], main > header[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(["hero", "work", "hearth", "more", "principles", "stack", "contact"]);
  });

  test("the hero states the approved positioning", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Samuel Suchard");
    await expect(page.locator("#hero")).toContainText(HERO);
    await expect(page.locator("#hero")).toContainText("Software developer · Technology builder · Founder of Hearth");
  });

  test("selected work is AgentSafe, ProjectStrike and PatchProof, in that order", async ({ page }) => {
    const names = await page.locator("#work article h3").allTextContents();
    expect(names).toEqual(["AgentSafe", "ProjectStrike", "PatchProof"]);
    await expect(page.getByRole("link", { name: "Read case study for AgentSafe" })).toHaveAttribute("href", "/projects/agentsafe/");
  });

  test("the Hearth band separates what exists from what's planned and carries the prototype caveat", async ({ page }) => {
    const hearth = page.locator("#hearth");
    await expect(hearth.getByRole("list", { name: "Exists today" })).toBeVisible();
    await expect(hearth.getByRole("list", { name: "Planned · not built yet" })).toBeVisible();
    await expect(hearth).toContainText(CAVEAT);
    const proto = hearth.getByRole("link", { name: /Hearth design prototype/ });
    await expect(proto).toHaveAttribute("href", "https://keept-safe-space.base44.app");
    const describedBy = await proto.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(CAVEAT);
  });

  test("contact offers exactly one way to reach Samuel: the GitHub profile", async ({ page }) => {
    const links = page.locator("#contact a");
    await expect(links).toHaveCount(1);
    await expect(links.first()).toHaveAttribute("href", "https://github.com/srsuchard");
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  });

  test("every GitHub link is on the allowlist", async ({ page }) => {
    const hrefs = await page.locator('a[href*="github.com"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(ALLOWED_GITHUB, href!).toContain(href);
  });

  test("the header's Contact link lands on the contact section", async ({ page }) => {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
  });
});
