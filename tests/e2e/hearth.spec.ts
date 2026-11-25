import { expect, test } from "@playwright/test";

const CAVEAT = "Design prototype built on Base44. It is not the Hearth product, and none of Hearth's planned security features are implemented.";
const SECURITY = /encrypt|zero.?knowledge|end.to.end/i;
const NEGATION = /\b(no|not|none|isn't|aren't|doesn't|don't|never)\b|n't\b/i;
const blockedNames = (process.env.PORTFOLIO_BLOCKED_NAMES ?? "").split(",").map((s) => s.trim()).filter(Boolean);

test.beforeEach(async ({ page }) => {
  const res = await page.goto("/hearth/");
  expect(res?.status()).toBe(200);
});

test("has the Hearth heading and title", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hearth");
  await expect(page).toHaveTitle("Hearth · Samuel Suchard");
});

test("every planned design item is labelled 'Planned:'", async ({ page }) => {
  const section = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Planned design · not implemented", exact: true }) });
  const items = section.getByRole("listitem");
  expect(await items.count()).toBeGreaterThan(0);
  for (const text of await items.allTextContents()) expect(text.trim()).toMatch(/^Planned: /);
});

test("outside the planned section, encryption is only ever mentioned as not existing", async ({ page }) => {
  const blocks = await page.locator("main p, main li, main dd, main h1, main h2, main h3").evaluateAll((els) =>
    els.filter((el) => !el.closest("[data-planned-design]")).map((el) => (el as HTMLElement).innerText.trim()),
  );
  const offenders = blocks.filter((t) => SECURITY.test(t) && !NEGATION.test(t));
  expect(offenders).toEqual([]);
});

test("the prototype link carries the caveat as its accessible description", async ({ page }) => {
  const link = page.getByRole("link", { name: /Hearth design prototype/ });
  await expect(link).toHaveAttribute("href", "https://keept-safe-space.base44.app");
  const id = await link.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${id}"]`)).toHaveText(CAVEAT);
  await expect(page.locator("main figure img")).toHaveCount(1);
});

test("the team credits Samuel by name and the co-founder by role only", async ({ page }) => {
  const team = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Team", exact: true }) });
  await expect(team).toContainText("Samuel Suchard");
  await expect(team).toContainText("Co-founder");
  await expect(team).toContainText("Leads UI/UX");
  expect(blockedNames.length, "Set PORTFOLIO_BLOCKED_NAMES in .env.local").toBeGreaterThan(0);
  const text = await page.locator("html").innerText();
  for (const name of blockedNames) expect(new RegExp(`(?<![\\p{L}\\p{N}])${name}(?![\\p{L}\\p{N}])`, "iu").test(text), "blocked name on page").toBe(false);
});

test("the collaborators section is absent while there are no approved entries", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Collaborators & selected work" })).toHaveCount(0);
});

test("the phases are listed with their real status", async ({ page }) => {
  const stage = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Where it stands", exact: true }) });
  await expect(stage.getByRole("listitem")).toHaveCount(6);
  await expect(stage).toContainText("approved with conditions");
  await expect(stage).toContainText("not approved");
});
