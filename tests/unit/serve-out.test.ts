import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPagesServer } from "../../scripts/serve-out.mjs";

// The preview server must behave like GitHub Pages so e2e results carry over to the live site.
let root: string;
let outside: string;
let server: Server;
let base: string;

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "serve-out-"));
  writeFileSync(join(root, "index.html"), "<h1>home</h1>");
  writeFileSync(join(root, "404.html"), "<h1>Page not found</h1>");
  mkdirSync(join(root, "about"));
  writeFileSync(join(root, "about", "index.html"), "<h1>about</h1>");
  mkdirSync(join(root, "_next"));
  writeFileSync(join(root, "_next", "app.js"), "console.log(1)");
  writeFileSync(join(root, "page.html"), "<h1>flat</h1>");
  outside = mkdtempSync(join(tmpdir(), "serve-out-outside-"));
  writeFileSync(join(outside, "secret.txt"), "secret");
  symlinkSync(join(outside, "secret.txt"), join(root, "link.txt"));
  symlinkSync(outside, join(root, "linkdir"));
  server = createPagesServer(root);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

const get = (path: string, init?: RequestInit) => fetch(base + path, { redirect: "manual", ...init });

describe("serve-out (GitHub Pages mimic)", () => {
  it("serves index.html for the root", async () => {
    const res = await get("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^text\/html/);
    expect(await res.text()).toBe("<h1>home</h1>");
  });

  it("serves dir/index.html for a trailing-slash path", async () => {
    const res = await get("/about/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<h1>about</h1>");
  });

  it("redirects a directory path without a trailing slash with 301, keeping the query", async () => {
    const res = await get("/about?x=1");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("/about/?x=1");
  });

  it("serves name.html for an extensionless path, as Pages does", async () => {
    const res = await get("/page");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<h1>flat</h1>");
  });

  it("serves 404.html with status 404 for unknown paths", async () => {
    for (const path of ["/missing", "/missing/", "/projects/omacanvas/"]) {
      const res = await get(path);
      expect(res.status, path).toBe(404);
      expect(await res.text()).toBe("<h1>Page not found</h1>");
    }
  });

  it("sets content types by extension", async () => {
    const res = await get("/_next/app.js");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^text\/javascript/);
  });

  it("never serves files outside the root (path traversal)", async () => {
    for (const path of ["/../package.json", "/..%2f..%2fetc%2fpasswd", "/%2e%2e/%2e%2e/etc/hosts"]) {
      const res = await get(path);
      expect(res.status, path).toBe(404);
    }
  });

  it("never follows a symlink out of the root", async () => {
    for (const path of ["/link.txt", "/linkdir/secret.txt"]) {
      const res = await get(path);
      expect(res.status, path).toBe(404);
      expect(await res.text()).not.toContain("secret");
    }
  });

  it("rejects methods other than GET and HEAD", async () => {
    const res = await get("/", { method: "POST" });
    expect(res.status).toBe(405);
  });

  it("answers HEAD without a body", async () => {
    const res = await get("/", { method: "HEAD" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
  });
});
