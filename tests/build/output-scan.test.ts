import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { ALLOWED_GITHUB } from "@/content/constants";
import { staticRoutes } from "@/content/index";
import { siteUrl } from "@/content/site";
import { blockedNamesFromEnv } from "../unit/env";

// Everything in out/ is what GitHub Pages will serve. Scan all of it, not just the visible HTML:
// RSC payloads (.txt), JS chunks, metadata and generated images can leak too.
const OUT = join(process.cwd(), "out");
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const files = walk(OUT);
const TEXT = /\.(html|txt|js|json|xml|css|svg|webmanifest)$/;
const textFiles = files.filter((f) => TEXT.test(f)).map((f) => [relative(OUT, f), readFileSync(f, "utf8")] as const);
const pages = textFiles.filter(([f]) => f.endsWith(".html") || f.endsWith(".txt"));
const HOME_DIR = new RegExp(["", "Users", ""].join("/"));

describe("built output leak scan", () => {
  it("contains no local home-directory paths", () => {
    expect(textFiles.filter(([, t]) => HOME_DIR.test(t)).map(([f]) => f)).toEqual([]);
  });

  it("contains no personal email address or mailto link", () => {
    expect(textFiles.filter(([, t]) => /@gmail\.com|mailto:/i.test(t)).map(([f]) => f)).toEqual([]);
  });

  it("does not mention the excluded project", () => {
    expect(textFiles.filter(([, t]) => /omacanvas|seawolf/i.test(t)).map(([f]) => f)).toEqual([]);
  });

  it("contains no blocked names", () => {
    const names = blockedNamesFromEnv();
    expect(names.length, "Set PORTFOLIO_BLOCKED_NAMES").toBeGreaterThan(0);
    const patterns = names.map((n) => new RegExp(`(?<![\\p{L}\\p{N}])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu"));
    expect(textFiles.filter(([, t]) => patterns.some((re) => re.test(t))).map(([f]) => f)).toEqual([]);
  });

  it("links only to allowlisted GitHub addresses (any GitHub host, with or without a scheme) from pages and page data", () => {
    const own = new URL(siteUrl()).hostname;
    const found = pages.flatMap(([f, t]) =>
      [...t.matchAll(/\b(?:https?:\/\/)?(?:[\w-]+\.)*(?:github\.com|githubusercontent\.com|github\.io)\b[^\s"'\\<>)]*/gi)]
        .map((m) => m[0].replace(/[.,;:!?]+$/, ""))
        .filter((raw) => {
          const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
          if (url.hostname === own) return false;
          return !(ALLOWED_GITHUB as readonly string[]).includes(`https://${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`);
        })
        .map((u) => `${f}: ${u}`),
    );
    expect(found).toEqual([]);
  });
});

describe("metadata in the built pages", () => {
  for (const route of staticRoutes()) {
    const file = join(OUT, route, "index.html");
    it(`${route}: canonical and og:url point at the site URL`, () => {
      const html = readFileSync(file, "utf8");
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
      expect(canonical, "canonical").toBe(`${siteUrl()}${route}`);
      const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
      expect(ogImage?.startsWith(`${siteUrl()}/`), `og:image ${ogImage}`).toBe(true);
    });
  }

  it("has Person and Organization structured data with no contact details", () => {
    const html = readFileSync(join(OUT, "index.html"), "utf8");
    const raw = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(raw).toBeTruthy();
    const data = JSON.parse(raw!);
    const graph: Record<string, unknown>[] = data["@graph"];
    const person = graph.find((n) => n["@type"] === "Person")!;
    expect(person.name).toBe("Samuel Suchard");
    expect(person.sameAs).toEqual(["https://github.com/srsuchard"]);
    for (const key of ["email", "telephone", "address", "birthDate", "homeLocation", "alumniOf", "worksFor"]) expect(person[key], key).toBeUndefined();
    const org = graph.find((n) => n["@type"] === "Organization")!;
    expect(org.name).toBe("Hearth");
    expect(org.url).toBeUndefined();
  });

  it("every Open Graph image referenced by a page exists in out/ and is a PNG", () => {
    const refs = new Set(
      staticRoutes().flatMap((r) => {
        const html = readFileSync(join(OUT, r, "index.html"), "utf8");
        return [...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map((m) => new URL(m[1]!).pathname);
      }),
    );
    expect(refs.size).toBeGreaterThan(0);
    for (const path of refs) {
      // GitHub Pages sets Content-Type from the extension; an extensionless image is served as octet-stream.
      expect(path, "og:image needs a .png extension").toMatch(/\.png$/);
      const bytes = readFileSync(join(OUT, decodeURIComponent(path)));
      expect(bytes.subarray(0, 8).toString("hex"), path).toBe("89504e470d0a1a0a");
    }
  });
});
