import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { staticRoutes } from "@/content/index";
import { isIndexable, siteUrl } from "@/content/site";

const OUT = join(process.cwd(), "out");

describe("robots.txt and sitemap.xml", () => {
  it("lists every static route in the sitemap under the site URL", () => {
    const xml = readFileSync(join(OUT, "sitemap.xml"), "utf8");
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(staticRoutes().map((r) => `${siteUrl()}${r}`));
  });

  it("blocks crawlers unless the build is marked indexable", () => {
    const robots = readFileSync(join(OUT, "robots.txt"), "utf8");
    if (isIndexable()) {
      expect(robots).toMatch(/Allow: \//);
      expect(robots).toContain(`Sitemap: ${siteUrl()}/sitemap.xml`);
    } else {
      expect(robots).toMatch(/Disallow: \//);
      expect(robots).not.toMatch(/Allow: \/\n/);
    }
  });

  it("marks pages noindex unless the build is marked indexable", () => {
    const html = readFileSync(join(OUT, "index.html"), "utf8");
    const robotsMeta = /<meta name="robots" content="([^"]+)"/.exec(html)?.[1];
    expect(robotsMeta).toBe(isIndexable() ? "index, follow" : "noindex, nofollow");
  });

  it("uses the canonical title template", () => {
    expect(existsSync(join(OUT, "index.html"))).toBe(true);
    expect(readFileSync(join(OUT, "index.html"), "utf8")).toContain("<title>Samuel Suchard — Software developer and founder of Hearth</title>");
  });
});
