import { join } from "node:path";
import { collaborations } from "./collaborations";
import { people } from "./people";
import { profile } from "./profile";
import type { Project } from "./schema";
import { site } from "./site";
import type { ContentInput } from "./validate";

// Content registry. Task 7 adds the verified projects.
export const projects: Project[] = [];

/** `live` link URLs approved at the M3 content review. Empty until then. */
export const LIVE_ALLOWLIST: string[] = [];

export { collaborations, people, profile, site };

/** Every exported route, as served with `trailingSlash: true`. Used by the sitemap and export tests. */
export function staticRoutes(): string[] {
  return ["/"];
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
