import { describe, expect, it } from "vitest";
import { CollaborationSchema, PersonSchema, ProfileSchema, ProjectSchema, SiteConfigSchema } from "@/content/schema";
import { validateContent } from "@/content/validate";
import { collaborations, contentInput, people, profile, projects, site } from "@/content/index";

import { blockedNamesFromEnv } from "./env";

// The gate: the real content must parse and pass every rule. Blocked names come from
// PORTFOLIO_BLOCKED_NAMES (.env.local locally, an Actions secret in CI) and never from source.

const localToday = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

describe("content gate", () => {
  it("has PORTFOLIO_BLOCKED_NAMES set", () => {
    expect(blockedNamesFromEnv().length, "Set PORTFOLIO_BLOCKED_NAMES in .env.local (see .env.example)").toBeGreaterThan(0);
  });

  it("parses against the schema", () => {
    for (const p of projects) expect(ProjectSchema.safeParse(p).error?.issues, p.slug).toBeUndefined();
    for (const p of people) expect(PersonSchema.safeParse(p).error?.issues, p.id).toBeUndefined();
    for (const c of collaborations) expect(CollaborationSchema.safeParse(c).error?.issues, c.id).toBeUndefined();
    expect(SiteConfigSchema.safeParse(site).error?.issues).toBeUndefined();
    expect(ProfileSchema.safeParse(profile).error?.issues).toBeUndefined();
  });

  it("passes every content rule", () => {
    const issues = validateContent(contentInput({ blockedNames: blockedNamesFromEnv(), today: localToday() }));
    for (const w of issues.filter((i) => i.severity === "warning")) console.warn(`[${w.rule}] ${w.where}: ${w.message}`);
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});
