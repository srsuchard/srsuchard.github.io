import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Every exported page must carry a CSP meta tag (GitHub Pages can't send CSP headers) whose
// script-src lists the hash of each of that page's inline scripts and nothing unsafe.
const OUT = join(process.cwd(), "out");
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const pages = walk(OUT).filter((f) => f.endsWith(".html"));
const sha = (s: string) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

describe("CSP meta in out/", () => {
  it("finds exported pages", () => expect(pages.length).toBeGreaterThan(0));

  for (const file of pages) {
    const rel = relative(OUT, file);
    it(`${rel}: has one CSP meta before any script or stylesheet`, () => {
      const html = readFileSync(file, "utf8");
      expect(html.match(/http-equiv="Content-Security-Policy"/g)).toHaveLength(1);
      const csp = html.indexOf('http-equiv="Content-Security-Policy"');
      const firstScript = html.indexOf("<script");
      const firstLink = html.indexOf("<link");
      if (firstScript > -1) expect(csp).toBeLessThan(firstScript);
      if (firstLink > -1) expect(csp).toBeLessThan(firstLink);
    });

    it(`${rel}: lists the hash of every inline script and no unsafe script sources`, () => {
      const html = readFileSync(file, "utf8");
      const policy = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)![1]!;
      const scriptSrc = policy.split(";").find((d) => d.trim().startsWith("script-src"))!;
      expect(scriptSrc).not.toMatch(/unsafe-inline|unsafe-eval|\*|https?:/);
      for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g))
        if (m[1]) expect(scriptSrc, rel).toContain(sha(m[1]));
    });

    it(`${rel}: has exactly one hash per inline script (counted independently of the script's regex)`, () => {
      const html = readFileSync(file, "utf8");
      // Count opening <script tags by plain string scanning; external ones carry a src attribute
      // before the tag closes. Deliberately not the implementation's regex.
      let inline = 0;
      for (let at = html.indexOf("<script"); at !== -1; at = html.indexOf("<script", at + 7)) {
        const tag = html.slice(at, html.indexOf(">", at) + 1);
        if (!/\ssrc=/.test(tag)) inline++;
      }
      const policy = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)![1]!;
      expect(policy.split("'sha256-").length - 1, rel).toBe(inline);
    });

    it(`${rel}: sets a strict referrer policy`, () => {
      expect(readFileSync(file, "utf8")).toContain('<meta name="referrer" content="strict-origin-when-cross-origin"/>');
    });
  }
});
