import { expect, test } from "@playwright/test";

// Site-level path behaviour as GitHub Pages will serve it (preview server or BASE_URL).
test("home responds with a heading", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).not.toBeEmpty();
});

test("unknown paths render the not-found page with status 404", async ({ page }) => {
  for (const path of ["/missing/", "/missing", "/projects/omacanvas/"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  }
});

test("the not-found page links back home", async ({ page }) => {
  await page.goto("/missing/");
  await page.getByRole("link", { name: "Go to the home page" }).click();
  await expect(page).toHaveURL(/\/$/);
});
