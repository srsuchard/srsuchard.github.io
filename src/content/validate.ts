import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Collaboration, ISODate, Link, Media, Person, Profile, Project, SiteConfig } from "./schema";

// Honesty and privacy rules for published content. Unit-tested rule by rule (tests/unit/validate.test.ts)
// and run against the real registry by tests/unit/content.gate.test.ts.

export type RuleId = "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9" | "R10" | "R11" | "R12" | "R13" | "R14";
export type ContentIssue = { rule: RuleId; where: string; message: string; severity: "error" | "warning" };

export type ContentInput = {
  projects: Project[];
  people: Person[];
  collaborations: Collaboration[];
  site: SiteConfig;
  profile: Profile;
  /** Absolute path of public/, used to check that media files exist. */
  publicDir: string;
  today: ISODate;
  /** Names that must never appear (whole word, case-insensitive). */
  blockedNames: string[];
  /** `live` link URLs approved at the content review. */
  liveAllowlist: string[];
};

export const PROFILE_URL = "https://github.com/srsuchard";
export const ALLOWED_GITHUB = [PROFILE_URL, "https://github.com/srsuchard/agentsafe"] as const;
const EXCLUDED_SLUGS = ["omacanvas", "surftrainer"];
const STALE_DAYS = 180;

const HEARTH_SECURITY = /encrypt|zero.?knowledge|end.to.end|\bauth|\bmfa\b|secure storage|vault (?:lock|unlock)/i;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[A-Za-z]{2,}\b/;
const PHONE = /(?:\+\d{1,3}[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b|\+\d{1,3}[\s-]\d[\d\s-]{6,}\d/;
const HOME_DIR = /\/Users\//;
const EXCLUDED_TERMS = /OmaCanvas|seawolf/i;
const UNVERIFIABLE =
  /\b\d[\d,]*\+?\s*(?:users|customers|downloads)\b|\brevenue\b|production[- ]ready|military[- ]grade|unhackable|bank[- ]level|fully secure/i;
const DEPLOY_CLAIM = /\b(?:live|deployed|launched|available at)\b/gi;
const NEGATION_BEFORE = /\b(?:not|never|no|isn't|is not|un)\s*$/i;
const GITHUB_URL = /https?:\/\/(?:www\.)?github\.com[^\s"'()<>]*/gi;

const issue = (rule: RuleId, where: string, message: string, severity: ContentIssue["severity"] = "error"): ContentIssue => ({
  rule,
  where,
  message,
  severity,
});

/** Every string in a value, with a readable path. */
function* strings(value: unknown, path: string): Generator<[string, string]> {
  if (typeof value === "string") yield [path, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${path}[${i}]`);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) yield* strings(v, path ? `${path}.${k}` : k);
}

const projectPath = (p: Project) => `projects[${p.slug}]`;

/** All media in a project, including variants and case-study sections. */
function projectMedia(p: Project): [string, Media][] {
  const base = projectPath(p);
  return [
    ...p.media.map((m, i): [string, Media] => [`${base}.media[${i}]`, m]),
    ...(p.variants ?? []).flatMap((v) => v.media.map((m, i): [string, Media] => [`${base}.variants[${v.id}].media[${i}]`, m])),
    ...(p.sections ?? []).flatMap((s) => (s.media ?? []).map((m, i): [string, Media] => [`${base}.sections[${s.id}].media[${i}]`, m])),
  ];
}

function allLinks(input: ContentInput): [string, Link, Project | undefined][] {
  return [
    ...input.projects.flatMap((p) => p.links.map((l, i): [string, Link, Project] => [`${projectPath(p)}.links[${i}]`, l, p])),
    ...input.collaborations.flatMap((c) => c.links.map((l, i): [string, Link, undefined] => [`collaborations[${c.id}].links[${i}]`, l, undefined])),
    ...input.site.contact.map((l, i): [string, Link, undefined] => [`site.contact[${i}]`, l, undefined]),
  ];
}

const contentStrings = (input: ContentInput) => [
  ...strings(input.projects, "projects"),
  ...strings(input.people, "people"),
  ...strings(input.collaborations, "collaborations"),
  ...strings(input.site, "site"),
  ...strings(input.profile, "profile"),
];

const allowedGithub = (url: string) => (ALLOWED_GITHUB as readonly string[]).includes(url.replace(/\/$/, ""));

function r1GithubAllowlist(input: ContentInput): ContentIssue[] {
  const out: ContentIssue[] = [];
  for (const [where, link, project] of allLinks(input)) {
    if ((link.kind === "github" || link.kind === "profile") && !allowedGithub(link.url))
      out.push(issue("R1", where, `GitHub URL not on the allowlist: ${link.url}`));
    if (link.kind === "github" && project && project.source.visibility !== "public")
      out.push(issue("R1", where, `Repository link on a project whose source is ${project.source.visibility}`));
  }
  for (const [where, s] of contentStrings(input))
    for (const m of s.matchAll(GITHUB_URL))
      if (!allowedGithub(m[0])) out.push(issue("R1", where, `GitHub URL not on the allowlist: ${m[0]}`));
  const c = input.site.contact;
  if (c.length !== 1 || c[0]?.kind !== "profile" || c[0].url !== PROFILE_URL)
    out.push(issue("R1", "site.contact", `Contact must be exactly the GitHub profile (${PROFILE_URL})`));
  return out;
}

function r2PrototypeCaveat(input: ContentInput): ContentIssue[] {
  return allLinks(input)
    .filter(([, l]) => l.kind === "prototype" && !l.caveat?.trim())
    .map(([where]) => issue("R2", where, "Prototype link needs a caveat"));
}

function r3HearthPlannedOnly(input: ContentInput): ContentIssue[] {
  const out: ContentIssue[] = [];
  for (const p of input.projects.filter((x) => x.slug === "hearth")) {
    const features = [
      ...p.features.map((f, i) => [`${projectPath(p)}.features[${i}]`, f] as const),
      ...(p.variants ?? []).flatMap((v) => v.features.map((f, i) => [`${projectPath(p)}.variants[${v.id}].features[${i}]`, f] as const)),
    ];
    for (const [where, f] of features)
      if (f.state !== "planned" && HEARTH_SECURITY.test(f.text))
        out.push(issue("R3", where, `Hearth security feature must be "planned", not "${f.state}": ${f.text}`));
  }
  return out;
}

function r4MediaExists(input: ContentInput): ContentIssue[] {
  const media: [string, Media][] = [
    ...input.projects.flatMap(projectMedia),
    ...input.collaborations.flatMap((c) => c.media.map((m, i): [string, Media] => [`collaborations[${c.id}].media[${i}]`, m])),
  ];
  const out: ContentIssue[] = [];
  for (const [where, m] of media) {
    if (m.kind !== "screenshot") continue;
    for (const w of m.widths) {
      const file = join(input.publicDir, `${m.src}-${w}.webp`);
      if (!existsSync(file)) out.push(issue("R4", where, `Missing image file: ${m.src}-${w}.webp`));
    }
    if (/^(?:image|screenshot|picture|photo) of\b/i.test(m.alt.trim()))
      out.push(issue("R4", where, `Alt text should describe the content, not say "${m.alt.split(" ").slice(0, 2).join(" ")}"`));
  }
  return out;
}

function r5Team(input: ContentInput): ContentIssue[] {
  const ids = new Set(input.people.map((p) => p.id));
  const out: ContentIssue[] = [];
  for (const p of input.projects) {
    const where = `${projectPath(p)}.team`;
    const members = p.team.members;
    for (const m of members) if (!ids.has(m.personId)) out.push(issue("R5", where, `Unknown person: ${m.personId}`));
    if (p.team.mode === "collaborative" && members.length < 2)
      out.push(issue("R5", where, "A collaborative project needs at least two members"));
    if (p.team.mode === "solo" && (members.length !== 1 || members[0]?.personId !== "samuel"))
      out.push(issue("R5", where, "A solo project has exactly one member: samuel"));
  }
  return out;
}

function r6Privacy(input: ContentInput): ContentIssue[] {
  const out: ContentIssue[] = [];
  for (const [where, s] of contentStrings(input)) {
    if (EMAIL.test(s)) out.push(issue("R6", where, "Contains an email address"));
    if (PHONE.test(s)) out.push(issue("R6", where, "Contains something that looks like a phone number"));
    if (HOME_DIR.test(s)) out.push(issue("R6", where, "Contains a local home-directory path"));
    if (EXCLUDED_TERMS.test(s)) out.push(issue("R6", where, "Mentions an excluded project or account"));
  }
  return out;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function r7BlockedNames(input: ContentInput): ContentIssue[] {
  const patterns = input.blockedNames
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(n)}(?![\\p{L}\\p{N}])`, "iu"));
  const out: ContentIssue[] = [];
  for (const [where, s] of contentStrings(input))
    if (patterns.some((re) => re.test(s))) out.push(issue("R7", where, "Contains a blocked name"));
  return out;
}

function r8Unverifiable(input: ContentInput): ContentIssue[] {
  return contentStrings(input)
    .filter(([, s]) => UNVERIFIABLE.test(s))
    .map(([where, s]) => issue("R8", where, `Unverifiable claim: "${s.match(UNVERIFIABLE)?.[0]}"`));
}

const daysBetween = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86_400_000;

function r9Dates(input: ContentInput): ContentIssue[] {
  const out: ContentIssue[] = [];
  const check = (where: string, date: string, staleCheck = false) => {
    if (date > input.today) out.push(issue("R9", where, `Date ${date} is later than today (${input.today})`));
    else if (staleCheck && daysBetween(date, input.today) > STALE_DAYS)
      out.push(issue("R9", where, `Status from ${date} is older than ${STALE_DAYS} days; re-verify it`, "warning"));
  };
  for (const p of input.projects) {
    check(`${projectPath(p)}.status.asOf`, p.status.asOf, true);
    for (const v of p.variants ?? []) check(`${projectPath(p)}.variants[${v.id}].status.asOf`, v.status.asOf, true);
    for (const [where, m] of projectMedia(p)) if (m.kind === "terminal") check(`${where}.capturedOn`, m.capturedOn);
  }
  for (const [where, l] of allLinks(input)) check(`${where}.verifiedOn`, l.verifiedOn);
  for (const c of input.collaborations) check(`collaborations[${c.id}].approval.approvedOn`, c.approval.approvedOn);
  return out;
}

function r10Slugs(input: ContentInput): ContentIssue[] {
  const out: ContentIssue[] = [];
  const seen = new Set<string>();
  for (const p of input.projects) {
    if (seen.has(p.slug)) out.push(issue("R10", projectPath(p), `Duplicate slug: ${p.slug}`));
    seen.add(p.slug);
    if (!/^[a-z0-9-]+$/.test(p.slug)) out.push(issue("R10", projectPath(p), `Slug must be lowercase letters, digits and hyphens`));
    if (EXCLUDED_SLUGS.includes(p.slug)) out.push(issue("R10", projectPath(p), `Slug is excluded: ${p.slug}`));
  }
  return out;
}

function r11DemoLabel(input: ContentInput): ContentIssue[] {
  return input.projects
    .filter((p) => p.slug === "waveforge")
    .flatMap(projectMedia)
    .filter(([, m]) => m.kind === "screenshot" && !m.demoData)
    .map(([where]) => issue("R11", where, 'WaveForge screenshots must be marked demoData (shown as "Demo data")'));
}

function r12DeploymentClaims(input: ContentInput): ContentIssue[] {
  const out: ContentIssue[] = [];
  for (const p of input.projects) {
    if (p.links.some((l) => l.kind === "live" || l.kind === "prototype")) continue;
    const fields: [string, string][] = [
      [`${projectPath(p)}.tagline`, p.tagline],
      [`${projectPath(p)}.summary`, p.summary],
      [`${projectPath(p)}.status.label`, p.status.label],
      [`${projectPath(p)}.status.detail`, p.status.detail],
    ];
    for (const [where, s] of fields)
      for (const m of s.matchAll(DEPLOY_CLAIM))
        if (!NEGATION_BEFORE.test(s.slice(0, m.index)))
          out.push(issue("R12", where, `Deployment claim "${m[0]}" without a live or prototype link`));
  }
  return out;
}

function r13CollaborationApproval(input: ContentInput): ContentIssue[] {
  const byId = new Map(input.people.map((p) => [p.id, p]));
  const isPublic = (id: string) => byId.get(id)?.attribution.status === "public";
  const slugs = new Set(input.projects.map((p) => p.slug));
  const out: ContentIssue[] = [];
  for (const c of input.collaborations) {
    const where = `collaborations[${c.id}]`;
    if (!isPublic(c.approval.approvedBy)) out.push(issue("R13", where, "Must be approved by a person with public attribution"));
    for (const id of c.personIds) if (!isPublic(id)) out.push(issue("R13", where, `Credits a person without public attribution: ${id}`));
    if (c.projectSlug && !slugs.has(c.projectSlug)) out.push(issue("R13", where, `Unknown project: ${c.projectSlug}`));
  }
  return out;
}

function r14LiveAllowlist(input: ContentInput): ContentIssue[] {
  return allLinks(input)
    .filter(([, l]) => l.kind === "live" && !input.liveAllowlist.includes(l.url))
    .map(([where, l]) => issue("R14", where, `Live URL not approved at the content review: ${l.url}`));
}

export function validateContent(input: ContentInput): ContentIssue[] {
  return [
    r1GithubAllowlist,
    r2PrototypeCaveat,
    r3HearthPlannedOnly,
    r4MediaExists,
    r5Team,
    r6Privacy,
    r7BlockedNames,
    r8Unverifiable,
    r9Dates,
    r10Slugs,
    r11DemoLabel,
    r12DeploymentClaims,
    r13CollaborationApproval,
    r14LiveAllowlist,
  ].flatMap((rule) => rule(input));
}
