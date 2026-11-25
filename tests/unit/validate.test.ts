import { describe, expect, it } from "vitest";
import type { Collaboration, Media, Project } from "@/content/schema";
import { validateContent, type ContentIssue, type RuleId } from "@/content/validate";
import { FIXTURE_BLOCKED_NAME, people, publicDirWith, site, validInput, validProject } from "./fixtures";

const errorRules = (issues: ContentIssue[]) => [...new Set(issues.filter((i) => i.severity === "error").map((i) => i.rule))];
const expectOnly = (issues: ContentIssue[], rule: RuleId) => expect(errorRules(issues)).toEqual([rule]);

const shot = (over: Partial<Extract<Media, { kind: "screenshot" }>> = {}): Media => ({
  kind: "screenshot",
  src: "/media/demo/menu",
  widths: [640, 1280],
  alt: "Main menu listing three game modes",
  caption: "The main menu.",
  width: 1600,
  height: 900,
  demoData: false,
  ...over,
});

const collab = (over: Partial<Collaboration> = {}): Collaboration => ({
  id: "c1",
  title: "Joint work",
  summary: "Something built together.",
  personIds: ["samuel"],
  media: [],
  links: [],
  approval: { approvedBy: "samuel", approvedOn: "2026-11-20", scope: "Title, summary and screenshots" },
  ...over,
});

// Strings the repo-hygiene scan would flag are assembled at runtime so this file stays clean.
const HOME_PATH = ["", "Users", "someone", "project"].join("/");

describe("validateContent", () => {
  it("returns no issues for the valid fixture", () => {
    expect(validateContent(validInput())).toEqual([]);
  });

  describe("R1 github-allowlist", () => {
    it("rejects a GitHub link that is not on the allowlist", () => {
      const p = validProject({ links: [{ kind: "github", url: "https://github.com/srsuchard/patchproof", label: "Source", verifiedOn: "2026-11-20" }] });
      expectOnly(validateContent(validInput({ projects: [p] })), "R1");
    });
    it("rejects an allowlisted repo link on a project whose source is not public", () => {
      const p = validProject({ source: { visibility: "private" } });
      expectOnly(validateContent(validInput({ projects: [p] })), "R1");
    });
    it("rejects a GitHub URL mentioned in prose", () => {
      const p = validProject({ summary: "See https://github.com/someone-else/repo for details." });
      expectOnly(validateContent(validInput({ projects: [p] })), "R1");
    });
    it("rejects GitHub URLs without a scheme or on other GitHub hosts", () => {
      for (const text of ["See github.com/someone/repo", "gist.github.com/someone/abc", "https://raw.githubusercontent.com/someone/repo/main/x", "someone.github.io/site", "https://api.github.com/repos/someone/repo"]) {
        const p = validProject({ summary: text });
        expect(errorRules(validateContent(validInput({ projects: [p] }))), text).toEqual(["R1"]);
      }
    });
    it("accepts the allowlisted repo without a scheme and the site's own address", () => {
      const p = validProject({ summary: "Installed from github.com/srsuchard/agentsafe; the portfolio lives at srsuchard.github.io." });
      expect(validateContent(validInput({ projects: [p] }))).toEqual([]);
    });
    it("rejects a contact list other than exactly the GitHub profile", () => {
      const s = site();
      s.contact.push({ kind: "github", url: "https://github.com/srsuchard/agentsafe", label: "Issues", verifiedOn: "2026-11-24" });
      expectOnly(validateContent(validInput({ site: s })), "R1");
    });
  });

  it("R2 prototype-caveat: rejects a prototype link without a caveat", () => {
    const p = validProject({ links: [{ kind: "prototype", url: "https://example.com", label: "Prototype", verifiedOn: "2026-11-20" }], source: { visibility: "private" } });
    expectOnly(validateContent(validInput({ projects: [p], liveAllowlist: [] })), "R2");
  });

  describe("R3 hearth-planned-only", () => {
    it("rejects an implemented Hearth security feature", () => {
      const p = validProject({ slug: "hearth", links: [], source: { visibility: "private" }, features: [{ text: "Client-side encryption of every item", state: "implemented" }] });
      expectOnly(validateContent(validInput({ projects: [p] })), "R3");
    });
    it("rejects a partial Hearth auth feature inside a variant", () => {
      const p = validProject({
        slug: "hearth",
        links: [],
        source: { visibility: "private" },
        variants: [{ id: "v", name: "V", status: { label: "x", detail: "y", asOf: "2026-11-01" }, stack: [], features: [{ text: "TOTP MFA sign-in", state: "partial" }], limitations: [], media: [] }],
      });
      expectOnly(validateContent(validInput({ projects: [p] })), "R3");
    });
    it("rejects a security claim in Hearth's summary or case-study text", () => {
      const summary = validProject({ slug: "hearth", links: [], source: { visibility: "private" }, summary: "Hearth encrypts your vault end-to-end." });
      expect(errorRules(validateContent(validInput({ projects: [summary] })))).toEqual(["R3"]);
      const section = validProject({ slug: "hearth", links: [], source: { visibility: "private" }, sections: [{ id: "s", heading: "Security", body: ["Your data is zero-knowledge."] }] });
      expect(errorRules(validateContent(validInput({ projects: [section] })))).toEqual(["R3"]);
    });
    it("allows Hearth text that states security features don't exist yet or are planned", () => {
      const p = validProject({
        slug: "hearth",
        links: [],
        source: { visibility: "private" },
        summary: "The vault, encryption and accounts don't exist yet.",
        limitations: ["There is no encryption yet."],
        sections: [{ id: "s", heading: "Stage", body: ["Phase 3 · Core app: vault lifecycle, recovery and encrypted items: not started"] }],
      });
      expect(validateContent(validInput({ projects: [p] }))).toEqual([]);
    });
    it("allows the same features when planned", () => {
      const p = validProject({ slug: "hearth", links: [], source: { visibility: "private" }, features: [{ text: "Client-side encryption", state: "planned" }] });
      expect(validateContent(validInput({ projects: [p] }))).toEqual([]);
    });
  });

  describe("R4 media-exists", () => {
    it("rejects a screenshot whose width variant file is missing", () => {
      const p = validProject({ media: [shot()] });
      const dir = publicDirWith(["media/demo/menu-640.webp"]); // 1280 missing
      expectOnly(validateContent(validInput({ projects: [p], publicDir: dir })), "R4");
    });
    it("rejects alt text that starts with 'screenshot of'", () => {
      const p = validProject({ media: [shot({ alt: "Screenshot of the menu" })] });
      const dir = publicDirWith(["media/demo/menu-640.webp", "media/demo/menu-1280.webp"]);
      expectOnly(validateContent(validInput({ projects: [p], publicDir: dir })), "R4");
    });
    it("accepts a screenshot whose variants all exist", () => {
      const p = validProject({ media: [shot()] });
      const dir = publicDirWith(["media/demo/menu-640.webp", "media/demo/menu-1280.webp"]);
      expect(validateContent(validInput({ projects: [p], publicDir: dir }))).toEqual([]);
    });
  });

  describe("R5 team", () => {
    it("rejects a collaborative project with one member", () => {
      const p = validProject({ team: { mode: "collaborative", members: [{ personId: "samuel", role: "Founder" }] } });
      expectOnly(validateContent(validInput({ projects: [p] })), "R5");
    });
    it("rejects a member who is not in people", () => {
      const p = validProject({ team: { mode: "collaborative", members: [{ personId: "samuel", role: "Founder" }, { personId: "ghost", role: "x" }] } });
      expectOnly(validateContent(validInput({ projects: [p] })), "R5");
    });
    it("rejects a solo project whose member is not samuel", () => {
      const p = validProject({ team: { mode: "solo", members: [{ personId: "cofounder", role: "x" }] } });
      expectOnly(validateContent(validInput({ projects: [p] })), "R5");
    });
  });

  describe("R6 privacy", () => {
    it("rejects an email address anywhere in content", () => {
      const p = validProject({ limitations: ["Contact someone@example.com for access"] });
      expectOnly(validateContent(validInput({ projects: [p] })), "R6");
    });
    it("rejects phone numbers in common formats", () => {
      for (const phone of ["(415) 555-0123", "415-555-0123", "+1 415 555 0123", "+44 20 7946 0958"]) {
        const p = validProject({ summary: `Call ${phone}.` });
        expect(errorRules(validateContent(validInput({ projects: [p] }))), phone).toEqual(["R6"]);
      }
    });
    it("does not mistake dates, versions or ranges for phone numbers", () => {
      const p = validProject({ summary: "As of 2026-11-24, v0.1.0 ships; ratings clamp to 0–4000 at 1/60 s steps; Node 16.4.6." });
      expect(validateContent(validInput({ projects: [p] }))).toEqual([]);
    });
    it("rejects a local home-directory path, including inside terminal output", () => {
      const t: Media = { kind: "terminal", title: "Demo", text: `$ ls ${HOME_PATH}`, provenance: "captured", capturedOn: "2026-11-20", caption: "Demo run" };
      expectOnly(validateContent(validInput({ projects: [validProject({ media: [t] })] })), "R6");
    });
    it("rejects the excluded project name", () => {
      const p = validProject({ summary: "Also see OmaCanvas." });
      expectOnly(validateContent(validInput({ projects: [p] })), "R6");
    });
  });

  describe("R7 blocked-names", () => {
    it("rejects a blocked name, case-insensitively", () => {
      const p = validProject({ summary: `Built with ${FIXTURE_BLOCKED_NAME.toUpperCase()}.` });
      expectOnly(validateContent(validInput({ projects: [p] })), "R7");
    });
    it("matches whole words only", () => {
      // Fictional names; "Ash" sits inside "hasher" and "Pen" inside "pencil" without matching.
      const p = validProject({ summary: "A hasher and a pencil." });
      expect(validateContent(validInput({ projects: [p], blockedNames: ["Ash", "Pen"] }))).toEqual([]);
    });
    it("rejects a blocked name that appears as a whole word", () => {
      const p = validProject({ summary: "Designed with Pen." });
      expectOnly(validateContent(validInput({ projects: [p], blockedNames: ["Pen"] })), "R7");
    });
  });

  it("R8 unverifiable-phrasing: rejects marketing claims", () => {
    for (const phrase of ["Used by 10,000+ users", "10k users", "1.2k downloads", "500+ stars", "Trusted by teams", "used by 40 schools", "production-ready", "military-grade encryption", "fully secure"]) {
      const p = validProject({ summary: phrase });
      expect(errorRules(validateContent(validInput({ projects: [p] }))), phrase).toEqual(["R8"]);
    }
  });

  describe("R9 dates", () => {
    it("rejects a date later than today", () => {
      const p = validProject({ status: { label: "Alpha", detail: "Runs locally", asOf: "2026-12-01" } });
      expectOnly(validateContent(validInput({ projects: [p] })), "R9");
    });
    it("warns, but does not error, when a status is older than 180 days", () => {
      const p = validProject({ status: { label: "Alpha", detail: "Runs locally", asOf: "2026-01-01" } });
      const issues = validateContent(validInput({ projects: [p] }));
      expect(errorRules(issues)).toEqual([]);
      expect(issues.some((i) => i.rule === "R9" && i.severity === "warning")).toBe(true);
    });
  });

  describe("R10 slugs", () => {
    it("rejects duplicate slugs", () => {
      expectOnly(validateContent(validInput({ projects: [validProject(), validProject()] })), "R10");
    });
    it("rejects excluded or renamed slugs", () => {
      for (const slug of ["omacanvas", "surftrainer"]) {
        const p = validProject({ slug, name: "X" });
        // "omacanvas" also trips R6 (excluded term); R10 must be among the results either way.
        expect(errorRules(validateContent(validInput({ projects: [p] }))), slug).toContain("R10");
      }
    });
  });

  it("R11 demo-label: rejects a WaveForge screenshot not marked as demo data", () => {
    const p = validProject({ slug: "waveforge", name: "WaveForge", links: [], source: { visibility: "private" }, media: [shot({ src: "/media/waveforge/today" })] });
    const dir = publicDirWith(["media/waveforge/today-640.webp", "media/waveforge/today-1280.webp"]);
    expectOnly(validateContent(validInput({ projects: [p], publicDir: dir })), "R11");
  });

  describe("R12 deployment-claims", () => {
    it("rejects a deployment claim on a project with no live or prototype link", () => {
      for (const detail of ["Deployed on Vercel", "Now live", "Launched in October"]) {
        const p = validProject({ status: { label: "Beta", detail, asOf: "2026-11-01" } });
        expect(errorRules(validateContent(validInput({ projects: [p] }))), detail).toEqual(["R12"]);
      }
    });
    it("allows negated statements such as 'not deployed'", () => {
      const p = validProject({ status: { label: "Alpha", detail: "Runs locally · not deployed", asOf: "2026-11-01" } });
      expect(validateContent(validInput({ projects: [p] }))).toEqual([]);
    });
  });

  describe("R13 collaboration-approval", () => {
    it("rejects a collaboration approved by someone without public attribution", () => {
      const c = collab({ approval: { approvedBy: "cofounder", approvedOn: "2026-11-20", scope: "All" } });
      expectOnly(validateContent(validInput({ collaborations: [c] })), "R13");
    });
    it("rejects a collaboration crediting a pending person", () => {
      const c = collab({ personIds: ["samuel", "cofounder"] });
      expectOnly(validateContent(validInput({ collaborations: [c] })), "R13");
    });
    it("rejects a collaboration linked to an unknown project", () => {
      const c = collab({ projectSlug: "nope" });
      expectOnly(validateContent(validInput({ collaborations: [c] })), "R13");
    });
    it("accepts an approved collaboration between public people", () => {
      const ps = people();
      ps[1]!.attribution = { status: "public", name: "Pat Example" };
      const c = collab({ personIds: ["samuel", "cofounder"], approval: { approvedBy: "cofounder", approvedOn: "2026-11-20", scope: "All" } });
      expect(validateContent(validInput({ people: ps, collaborations: [c] }))).toEqual([]);
    });
  });

  it("R14 live-link-allowlist: rejects a live link that was not approved", () => {
    const p: Project = validProject({ links: [{ kind: "live", url: "https://example.com/app", label: "Live site", verifiedOn: "2026-11-20" }] });
    expectOnly(validateContent(validInput({ projects: [p] })), "R14");
    expect(validateContent(validInput({ projects: [p], liveAllowlist: ["https://example.com/app"] }))).toEqual([]);
  });
});
