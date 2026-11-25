import { shot } from "../media";
import type { Project } from "../schema";

export const HEARTH_PROTOTYPE_CAVEAT =
  "Design prototype built on Base44. It is not the Hearth product, and none of Hearth's planned security features are implemented.";

export const hearth: Project = {
  slug: "hearth",
  name: "Hearth",
  tagline: "One private, organised place for the documents, passwords, photos and memories that matter to you.",
  summary:
    "Important digital information is scattered across many different services. Hearth aims to bring it into one organised place, with more privacy and control. It's early: the repository foundation and an in-memory interface prototype exist; the vault, encryption and accounts don't yet.",
  tier: "case-study",
  category: "venture",
  origin: "current",
  status: {
    label: "Early stage",
    detail: "Phase 0 approved with conditions (23 Nov 2026); interface prototype on main; Phase 1 (cryptography) not approved",
    asOf: "2026-11-24",
  },
  team: {
    mode: "collaborative",
    members: [
      { personId: "samuel", role: "Founder" },
      { personId: "hearth-cofounder", role: "Co-founder" },
    ],
  },
  source: { visibility: "private" },
  links: [
    {
      kind: "prototype",
      url: "https://keept-safe-space.base44.app",
      label: "Hearth design prototype",
      verifiedOn: "2026-11-24",
      caveat: HEARTH_PROTOTYPE_CAVEAT,
    },
  ],
  stack: ["nextjs", "react", "typescript", "vitest", "playwright", "githubactions"],
  platforms: ["Web"],
  features: [
    { text: "A pnpm monorepo in strict TypeScript, with package boundaries enforced by lint rules and tests", state: "implemented" },
    { text: "Repository-policy tests: a dependency allow-list, environment rules and no third-party scripts", state: "implemented" },
    { text: "Continuous integration on every pull request", state: "implemented" },
    {
      text: "An in-memory interface prototype for six categories (Documents, Passwords, Photos, Notes, Health and Money), using sample data that resets on reload",
      state: "implemented",
    },
    { text: "Client-side encryption: everything encrypted in the browser, so the service stores only ciphertext", state: "planned" },
    { text: "Signing in (verified email plus TOTP MFA) kept separate from unlocking the vault", state: "planned" },
    { text: "Argon2id key derivation, a vault master key wrapped by the passphrase and a recovery key, and per-item keys", state: "planned" },
    { text: "Keys held only in memory inside a crypto Web Worker; the vault locks on reload", state: "planned" },
    { text: "Search that runs in the browser after unlock", state: "planned" },
    { text: "Two independent security reviews before any security claim is made", state: "planned" },
  ],
  limitations: [
    "There is no vault, encryption or account system yet. The interface prototype holds sample data in memory only.",
    "The security design is a design goal, not a security claim.",
  ],
  media: [
    shot(
      "/media/hearth/prototype-landing",
      "Hearth landing page headline reading 'Your whole life, kept in one safe place', with buttons to join a private beta or explore the product",
      "Samuel's Base44 design prototype for Hearth. It isn't the Hearth product, and the beta it advertises is a waitlist.",
    ),
  ],
  sections: [
    {
      id: "why",
      heading: "Why Hearth",
      body: [
        "People's important digital information is fragmented across many different services: documents in one place, passwords in another, photos and records scattered everywhere else.",
        "Hearth aims to bring it into one organised place where people can manage what matters to them with greater privacy and control.",
      ],
    },
    {
      id: "role",
      heading: "What I'm working on",
      body: [
        "As founder, I work on the product vision, the technical direction and the early development foundation. Hearth's co-founder leads UI/UX and product innovation.",
      ],
    },
    {
      id: "stage",
      heading: "Where it stands",
      body: [
        "Phase 0 · Repository and architecture: approved with conditions (23 Nov 2026)",
        "Phase 1 · Cryptographic foundation and first security review: not approved",
        "Phase 2 · Backend: not started",
        "Phase 3 · Core app: vault lifecycle, recovery and encrypted items: not started",
        "Phase 4 · Product experience: not started",
        "Phase 5 · Private beta preparation and second security review: not started",
      ],
    },
  ],
  verifiedFrom: [
    "hearth/README.md#Development status (phase table), #Security, #Architecture",
    "hearth origin/main docs/reports/ui-milestone-1.md (in-memory prototype; no encryption, storage or server)",
    "hearth docs/reports/deferred-work.md DW-1 (README status lags the UI prototype)",
    "Prototype site text read 2026-11-24: states encryption is not running today",
    "Samuel confirmed he designed the Base44 prototype (2026-11-24)",
  ],
};
