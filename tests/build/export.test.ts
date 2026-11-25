import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { staticRoutes } from "@/content/index";

// Runs after `next build` (see `pnpm test:build`). Checks that out/ is a valid GitHub Pages site.
const OUT = join(process.cwd(), "out");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = existsSync(OUT) ? walk(OUT) : [];
const htmlFiles = files.filter((f) => f.endsWith(".html"));

describe("static export in out/", () => {
  it("exists and contains files", () => {
    expect(existsSync(OUT), "run `next build` first").toBe(true);
    expect(files.length).toBeGreaterThan(0);
  });

  it("has the files GitHub Pages needs at the root", () => {
    for (const f of ["index.html", "404.html", ".nojekyll"]) {
      expect(existsSync(join(OUT, f)), f).toBe(true);
    }
  });

  it("has an index.html for every static route", () => {
    for (const route of staticRoutes()) {
      const file = join(OUT, route, "index.html");
      expect(existsSync(file), `${route} -> ${relative(OUT, file)}`).toBe(true);
    }
  });

  it("resolves every root-relative asset reference to a file in out/", () => {
    const missing: string[] = [];
    for (const html of htmlFiles) {
      const text = readFileSync(html, "utf8");
      for (const m of text.matchAll(/(?:src|href)="(\/(?:_next|media|og)\/[^"?#]+)/g)) {
        const ref = decodeURIComponent(m[1]!);
        if (!existsSync(join(OUT, ref))) missing.push(`${relative(OUT, html)} -> ${ref}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("contains no localhost or file:// references in documents and payloads", () => {
    const offenders = files
      .filter((f) => /\.(html|txt|json|xml|css|webmanifest)$/.test(f))
      .filter((f) => /localhost|127\.0\.0\.1|file:\/\//.test(readFileSync(f, "utf8")))
      .map((f) => relative(OUT, f));
    expect(offenders).toEqual([]);
  });

  it("contains no localhost URLs in JavaScript", () => {
    // Framework code legitimately contains the bare string "localhost" (URL parser) and a
    // `file:///ROOT` module-path helper (Turbopack runtime); neither is a URL the site loads.
    // A build-time origin leaking into a bundle would appear as a full http(s) URL.
    const offenders = files
      .filter((f) => f.endsWith(".js"))
      .filter((f) => /https?:\/\/(localhost|127\.0\.0\.1)/.test(readFileSync(f, "utf8")))
      .map((f) => relative(OUT, f));
    expect(offenders).toEqual([]);
  });
});
