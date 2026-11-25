import { expect, test } from "@playwright/test";

const PROJECTS = [
  { slug: "agentsafe", name: "AgentSafe", public: true },
  { slug: "projectstrike", name: "ProjectStrike", public: false },
  { slug: "patchproof", name: "PatchProof", public: false },
  { slug: "foreman", name: "Foreman", public: false },
  { slug: "waveforge", name: "WaveForge", public: false },
  { slug: "threadline", name: "Threadline", public: false },
];

test("the projects index lists every project in tier groups, with Hearth linking to its own page", async ({ page }) => {
  await page.goto("/projects/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work");
  const groups = await page.locator("main h2").allTextContents();
  expect(groups).toEqual(["Case studies", "Projects", "Early stage"]);
  for (const p of PROJECTS) await expect(page.locator(`a[href="/projects/${p.slug}/"]`)).toHaveCount(1);
  await expect(page.locator('main a[href="/hearth/"]')).toHaveCount(1);
});

for (const p of PROJECTS) {
  test(`${p.name}: heading, spec line and source note`, async ({ page }) => {
    const res = await page.goto(`/projects/${p.slug}/`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.name);
    const spec = page.locator("main dl").first();
    for (const k of ["Status", "As of", "Team", "Source"]) await expect(spec).toContainText(k);
    if (p.public) await expect(page.getByRole("link", { name: /Source on GitHub/ })).toHaveAttribute("href", "https://github.com/srsuchard/agentsafe");
    else {
      await expect(spec).toContainText("Not public");
      await expect(page.locator('main a[href*="github.com/srsuchard/"]')).toHaveCount(0);
    }
    await expect(page).toHaveTitle(`${p.name} · Samuel Suchard`);
  });
}

test("ProjectStrike shows the web version and the Unity port separately, each with its own status", async ({ page }) => {
  await page.goto("/projects/projectstrike/");
  for (const [name, status] of [
    ["Web version", "Runs locally"],
    ["Unity port", "Milestone 1"],
  ] as const) {
    const section = page.locator("section", { has: page.getByRole("heading", { level: 2, name, exact: true }) });
    await expect(section).toContainText(status);
    await expect(section.getByRole("list", { name: "Built", exact: true })).toBeVisible();
  }
  await expect(page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Unity port", exact: true }) }).getByRole("list", { name: "Planned · not built yet" })).toContainText("Bot AI");
});

test("WaveForge labels every screenshot as demo data and makes no deployment claim", async ({ page }) => {
  await page.goto("/projects/waveforge/");
  const figures = page.locator("main figure:has(img)");
  const count = await figures.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) await expect(figures.nth(i)).toContainText("Demo data");
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/\bdeployed\b|\blive\b/i);
});

test("AgentSafe opens with the real demo transcript", async ({ page }) => {
  await page.goto("/projects/agentsafe/");
  const terminal = page.getByRole("region", { name: "agentsafe: five-minute demo: terminal output" });
  await expect(terminal).toContainText("$ agentsafe restore");
  await expect(page.getByText(/Captured output · 24 Nov 2026/)).toBeVisible();
});

test("excluded, renamed and Hearth project URLs return 404", async ({ page }) => {
  for (const path of ["/projects/omacanvas/", "/projects/surftrainer/", "/projects/hearth/"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  }
});

test("a project URL without the trailing slash redirects to the canonical one", async ({ page }) => {
  const res = await page.goto("/projects/agentsafe");
  expect(res?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/projects/agentsafe/");
  expect(res?.request().redirectedFrom()?.url()).toMatch(/\/projects\/agentsafe$/);
});
