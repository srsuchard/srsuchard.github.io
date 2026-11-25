import { z } from "zod";

// Content model for the portfolio. Every object is strict: unknown keys are rejected so that
// unreviewed fields (metrics, dates, locations) can't slip into published content.

export const ISODate = z.iso.date();
export type ISODate = z.infer<typeof ISODate>;

const text = z.string().trim().min(1);
const httpsUrl = z.url({ protocol: /^https$/ });

/** Technologies a project actually uses. The stack section is derived from these, so no skill appears without a project. */
export const TECH_LABELS = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  csharp: "C#",
  swift: "Swift",
  react: "React",
  nextjs: "Next.js",
  tailwind: "Tailwind CSS",
  threejs: "Three.js",
  vite: "Vite",
  webaudio: "Web Audio API",
  colyseus: "Colyseus",
  websockets: "WebSockets",
  postgres: "PostgreSQL",
  supabase: "Supabase",
  unity: "Unity",
  sqlite: "SQLite",
  docker: "Docker",
  zustand: "Zustand",
  zod: "Zod",
  vitest: "Vitest",
  playwright: "Playwright",
  pytest: "pytest",
  githubactions: "GitHub Actions",
  git: "Git",
  nodejs: "Node.js",
  gtk: "GTK",
} as const;
export const TechId = z.enum(Object.keys(TECH_LABELS) as [keyof typeof TECH_LABELS, ...(keyof typeof TECH_LABELS)[]]);
export type TechId = z.infer<typeof TechId>;

export const StatusSchema = z.strictObject({ label: text, detail: text, asOf: ISODate });
export type Status = z.infer<typeof StatusSchema>;

export const FeatureSchema = z.strictObject({ text, state: z.enum(["implemented", "partial", "planned"]) });
export type Feature = z.infer<typeof FeatureSchema>;

export const LinkSchema = z.strictObject({
  kind: z.enum(["github", "prototype", "profile", "live"]),
  url: httpsUrl,
  label: text,
  verifiedOn: ISODate,
  caveat: text.optional(),
});
export type Link = z.infer<typeof LinkSchema>;

export const IMAGE_WIDTHS = [640, 1280, 1920] as const;

export const MediaSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("screenshot"),
    // Base path without extension; files are `${src}-${width}.webp` under public/.
    src: z.string().regex(/^\/media\/[a-z0-9-]+\/[a-z0-9-]+$/),
    // Available WebP widths: the standard IMAGE_WIDTHS up to the source width, plus the source width itself.
    widths: z.array(z.int().min(320).max(3840)).min(1),
    alt: text,
    caption: text,
    width: z.int().positive(),
    height: z.int().positive(),
    demoData: z.boolean(),
  }),
  z.strictObject({
    kind: z.literal("terminal"),
    title: text,
    text,
    provenance: z.enum(["captured", "readme"]),
    capturedOn: ISODate,
    caption: text,
  }),
  z.strictObject({
    kind: z.literal("diagram"),
    diagram: z.enum(["agentsafe-restore", "patchproof-fail-to-pass", "strike-netcode", "foreman-lifecycle", "threadline-engine"]),
    caption: text,
  }),
]);
export type Media = z.infer<typeof MediaSchema>;

export const PersonSchema = z.strictObject({
  id: text,
  title: text,
  responsibilities: z.array(text),
  attribution: z.discriminatedUnion("status", [
    z.strictObject({ status: z.literal("public"), name: text, url: httpsUrl.optional() }),
    z.strictObject({ status: z.literal("pending") }),
  ]),
});
export type Person = z.infer<typeof PersonSchema>;

export const VariantSchema = z.strictObject({
  id: text,
  name: text,
  status: StatusSchema,
  stack: z.array(TechId),
  features: z.array(FeatureSchema),
  limitations: z.array(text),
  media: z.array(MediaSchema),
});
export type Variant = z.infer<typeof VariantSchema>;

export const CaseStudySectionSchema = z.strictObject({
  id: text,
  heading: text,
  body: z.array(text).min(1),
  media: z.array(MediaSchema).optional(),
});
export type CaseStudySection = z.infer<typeof CaseStudySectionSchema>;

export const CollaborationSchema = z.strictObject({
  id: text,
  title: text,
  summary: text,
  personIds: z.array(text).min(1),
  projectSlug: text.optional(),
  media: z.array(MediaSchema),
  links: z.array(LinkSchema),
  approval: z.strictObject({ approvedBy: text, approvedOn: ISODate, scope: text }),
});
export type Collaboration = z.infer<typeof CollaborationSchema>;

export const ProjectSchema = z.strictObject({
  slug: text,
  name: text,
  tagline: text,
  summary: text,
  tier: z.enum(["case-study", "standard", "brief"]),
  category: z.enum(["developer-tool", "game", "app", "venture", "engine", "hardware", "web"]),
  origin: z.enum(["current", "legacy-site"]),
  status: StatusSchema,
  team: z.strictObject({
    mode: z.enum(["solo", "collaborative"]),
    members: z.array(z.strictObject({ personId: text, role: text })).min(1),
  }),
  source: z.strictObject({ visibility: z.enum(["public", "private", "local-only"]) }),
  links: z.array(LinkSchema),
  stack: z.array(TechId),
  platforms: z.array(text),
  features: z.array(FeatureSchema),
  limitations: z.array(text),
  media: z.array(MediaSchema),
  variants: z.array(VariantSchema).optional(),
  sections: z.array(CaseStudySectionSchema).optional(),
  verifiedFrom: z.array(text).min(1),
});
export type Project = z.infer<typeof ProjectSchema>;

export const SiteConfigSchema = z.strictObject({
  name: text,
  roles: z.array(text).min(1),
  hero: text,
  secondary: text,
  contact: z.array(LinkSchema),
});
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export const ProfileSchema = z.strictObject({
  about: z.array(text),
  interests: z.array(text),
  education: z.array(z.strictObject({ school: text })),
  principles: z.array(
    z.strictObject({
      title: text,
      body: text,
      evidence: z.array(z.strictObject({ slug: text, label: text })),
    }),
  ),
});
export type Profile = z.infer<typeof ProfileSchema>;
