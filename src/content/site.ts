import type { SiteConfig } from "./schema";

// Approved 2026-11-24. Contact is the GitHub profile only: no email, no LinkedIn, no form.
export const site: SiteConfig = {
  name: "Samuel Suchard",
  roles: ["Software developer", "Technology builder", "Founder of Hearth"],
  hero: "I build software, solve difficult problems, and turn ambitious ideas into working products.",
  secondary: "I care about software that can prove what it claims, and about saying plainly what isn't finished.",
  contact: [{ kind: "profile", url: "https://github.com/srsuchard", label: "GitHub profile", verifiedOn: "2026-11-24" }],
};

/** Canonical origin for metadata, sitemap and JSON-LD. Defaults to the GitHub Pages address. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://srsuchard.github.io").replace(/\/$/, "");
}

/** Search indexing is off unless explicitly enabled (only the production Pages workflow sets this). */
export function isIndexable(): boolean {
  return process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
}
