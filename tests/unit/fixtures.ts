import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Person, Profile, Project, SiteConfig } from "@/content/schema";
import type { ContentInput } from "@/content/validate";

// Fictional values only. Real blocked names never appear in source; see .env.example.
export const FIXTURE_BLOCKED_NAME = "Zed Fixture";
export const TODAY = "2026-11-24";

export function validProject(overrides: Partial<Project> = {}): Project {
  return structuredClone({
    slug: "demo",
    name: "Demo",
    tagline: "A small demo tool.",
    summary: "A command-line tool used only in tests.",
    tier: "brief",
    category: "developer-tool",
    origin: "current",
    status: { label: "Alpha", detail: "Runs locally", asOf: "2026-11-01" },
    team: { mode: "solo", members: [{ personId: "samuel", role: "Sole developer" }] },
    source: { visibility: "public" },
    links: [{ kind: "github", url: "https://github.com/srsuchard/agentsafe", label: "Source", verifiedOn: "2026-11-20" }],
    stack: ["typescript"],
    platforms: ["macOS"],
    features: [{ text: "Takes snapshots", state: "implemented" }],
    limitations: ["macOS only"],
    media: [],
    verifiedFrom: ["Demo/README.md#Intro"],
    ...overrides,
  } satisfies Project);
}

export const people = (): Person[] => [
  {
    id: "samuel",
    title: "Founder",
    responsibilities: ["Product vision"],
    attribution: { status: "public", name: "Samuel Suchard" },
  },
  { id: "cofounder", title: "Co-founder", responsibilities: ["Leads UI/UX"], attribution: { status: "pending" } },
];

export const site = (): SiteConfig => ({
  name: "Samuel Suchard",
  roles: ["Software developer"],
  hero: "I build software.",
  secondary: "Secondary line.",
  contact: [{ kind: "profile", url: "https://github.com/srsuchard", label: "GitHub", verifiedOn: "2026-11-24" }],
});

export const profile = (): Profile => ({
  about: ["About text."],
  interests: ["Software engineering"],
  education: [{ school: "A School" }],
  principles: [],
});

/** A temp public/ dir containing the given files (paths relative to public/). */
export function publicDirWith(files: string[] = []): string {
  const dir = mkdtempSync(join(tmpdir(), "public-"));
  for (const f of files) {
    mkdirSync(dirname(join(dir, f)), { recursive: true });
    writeFileSync(join(dir, f), "x");
  }
  return dir;
}

export function validInput(overrides: Partial<ContentInput> = {}): ContentInput {
  return {
    projects: [validProject()],
    people: people(),
    collaborations: [],
    site: site(),
    profile: profile(),
    publicDir: publicDirWith(),
    today: TODAY,
    blockedNames: [FIXTURE_BLOCKED_NAME],
    liveAllowlist: [],
    ...overrides,
  };
}
