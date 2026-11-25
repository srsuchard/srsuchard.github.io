import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const res = await page.goto("/about/");
  expect(res?.status()).toBe(200);
});

test("has the approved sections, in order, and nothing else", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
  const h2 = await page.locator("main h2").allTextContents();
  expect(h2).toEqual(["Interests", "Education", "What I've built", "Stack", "How I build"]);
});

test("education names only the school: no year, city or other details", async ({ page }) => {
  const education = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Education", exact: true }) });
  await expect(education).toContainText("Pacifica Christian High School");
  const text = (await education.innerText()).replace("Education", "").trim();
  expect(text).toBe("Pacifica Christian High School");
  expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
});

test("lists the four interests", async ({ page }) => {
  const interests = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Interests", exact: true }) });
  for (const i of ["Software engineering", "Cybersecurity", "AI", "Entrepreneurship"]) await expect(interests.getByRole("listitem").filter({ hasText: i })).toHaveCount(1);
});

test("what I've built links to every project, with Hearth at its own page", async ({ page }) => {
  const built = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "What I've built", exact: true }) });
  for (const slug of ["agentsafe", "projectstrike", "patchproof", "foreman", "waveforge", "threadline"]) await expect(built.locator(`a[href="/projects/${slug}/"]`)).toHaveCount(1);
  await expect(built.locator('a[href="/hearth/"]')).toHaveCount(1);
});

test("has no email, employment history or dates beyond the copyright line", async ({ page }) => {
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  const main = await page.locator("main").innerText();
  expect(main).not.toMatch(/\b(19|20)\d{2}\b/);
  expect(main).not.toMatch(/\b(intern(ship)?|employed|employer|worked at)\b/i);
});
