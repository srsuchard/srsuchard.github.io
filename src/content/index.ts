import { join } from "node:path";
import { collaborations } from "./collaborations";
import { people } from "./people";
import { profile } from "./profile";
import { agentsafe } from "./projects/agentsafe";
import { foreman } from "./projects/foreman";
import { hearth } from "./projects/hearth";
import { patchproof } from "./projects/patchproof";
import { projectstrike } from "./projects/projectstrike";
import { threadline } from "./projects/threadline";
import { waveforge } from "./projects/waveforge";
import { TECH_LABELS, type Project, type TechId } from "./schema";
import { site } from "./site";
import type { ContentInput } from "./validate";

/** Every project, in display order: case studies, then standard pages, then brief entries. */
export const projects: Project[] = [agentsafe, projectstrike, patchproof, hearth, foreman, waveforge, threadline];

/** Homepage "Selected work", in this order. Hearth has its own section and page. */
export const FEATURED = ["agentsafe", "projectstrike", "patchproof"] as const;

/** `live` link URLs approved at the M3 content review. Empty until then. */
export const LIVE_ALLOWLIST: string[] = [];

export { collaborations, people, profile, site };

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function byTier(tier: Project["tier"]): Project[] {
  return projects.filter((p) => p.tier === tier);
}

/** Projects that get a page under /projects/ (Hearth lives at /hearth/). */
export function projectPages(): Project[] {
  return projects.filter((p) => p.slug !== "hearth");
}

/** The stack section, derived from what projects actually use: most-used first, then alphabetical. */
export function deriveStack(): { tech: TechId; label: string; projects: string[] }[] {
  const uses = new Map<TechId, Set<string>>();
  for (const p of projects)
    for (const tech of [...p.stack, ...(p.variants ?? []).flatMap((v) => v.stack)]) {
      if (!uses.has(tech)) uses.set(tech, new Set());
      uses.get(tech)!.add(p.slug);
    }
  return [...uses.entries()]
    .map(([tech, slugs]) => ({ tech, label: TECH_LABELS[tech], projects: [...slugs] }))
    .sort((a, b) => b.projects.length - a.projects.length || a.label.localeCompare(b.label));
}

/**
 * Every exported route, as served with `trailingSlash: true`. Used by the sitemap and export tests.
 * Pages are added here only once they're built (M4, after the content review).
 */
export function staticRoutes(): string[] {
  return ["/"];
}

/** The routes the finished site will have; staticRoutes() switches to this in Task 10. */
export function plannedRoutes(): string[] {
  return ["/", "/projects/", "/hearth/", "/about/", ...projectPages().map((p) => `/projects/${p.slug}/`)];
}

/** The real content, shaped for validateContent(). */
export function contentInput(options: { blockedNames: string[]; today: string; publicDir?: string }): ContentInput {
  return {
    projects,
    people,
    collaborations,
    site,
    profile,
    publicDir: options.publicDir ?? join(process.cwd(), "public"),
    today: options.today,
    blockedNames: options.blockedNames,
    liveAllowlist: LIVE_ALLOWLIST,
  };
}
