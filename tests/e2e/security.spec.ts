import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

// The CSP meta tag must not break the page, and the site must make no third-party requests.
for (const path of [...ROUTES, "/missing/"]) {
  test(`no CSP violations and only same-origin requests on ${path}`, async ({ page, baseURL }) => {
    const violations: string[] = [];
    const foreign: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on("console", (msg) => {
      if (/Content Security Policy|Refused to (execute|load|apply|connect)/i.test(msg.text())) violations.push(msg.text());
    });
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (url.protocol !== "data:" && url.origin !== origin) foreign.push(req.url());
    });
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => console.error(`Content Security Policy violation: ${e.violatedDirective} ${e.blockedURI}`));
    });
    await page.goto(path, { waitUntil: "networkidle" });
    expect(violations).toEqual([]);
    expect(foreign).toEqual([]);
  });
}

test("client-side navigation still works under the CSP", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/missing/");
  await page.getByRole("link", { name: "Go to the home page" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Samuel Suchard");
  expect(errors).toEqual([]);
});
