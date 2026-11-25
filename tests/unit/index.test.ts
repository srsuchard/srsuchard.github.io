import { describe, expect, it } from "vitest";
import { FEATURED, byTier, collaborations, deriveStack, getProject, staticRoutes, profile, projects } from "@/content/index";

describe("content registry", () => {
  it("features AgentSafe, ProjectStrike and PatchProof, in that order", () => {
    expect([...FEATURED]).toEqual(["agentsafe", "projectstrike", "patchproof"]);
    for (const slug of FEATURED) expect(getProject(slug), slug).toBeDefined();
  });

  it("orders projects by tier: case studies, then standard, then brief", () => {
    const order = { "case-study": 0, standard: 1, brief: 2 } as const;
    const tiers = projects.map((p) => order[p.tier]);
    expect(tiers).toEqual([...tiers].sort((a, b) => a - b));
    expect(byTier("case-study").map((p) => p.slug)).toEqual(["agentsafe", "projectstrike", "patchproof", "hearth"]);
  });

  it("derives the stack only from technologies that projects use", () => {
    const stack = deriveStack();
    expect(stack.length).toBeGreaterThan(0);
    for (const s of stack) expect(s.projects.length, s.tech).toBeGreaterThan(0);
    expect(new Set(stack.map((s) => s.tech)).size).toBe(stack.length);
  });

  it("plans a page for every project except Hearth, which has its own route", () => {
    const routes = staticRoutes();
    expect(routes).toContain("/hearth/");
    expect(routes).not.toContain("/projects/hearth/");
    for (const p of projects.filter((x) => x.slug !== "hearth")) expect(routes).toContain(`/projects/${p.slug}/`);
  });

  it("has no excluded projects", () => {
    expect(getProject("omacanvas")).toBeUndefined();
    expect(getProject("surftrainer")).toBeUndefined();
  });

  it("credits Hearth as collaborative and keeps collaborations empty until approved", () => {
    expect(getProject("hearth")?.team.mode).toBe("collaborative");
    expect(collaborations).toEqual([]);
  });

  it("links every principle's evidence to a real project", () => {
    for (const pr of profile.principles) for (const e of pr.evidence) expect(getProject(e.slug), `${pr.title} -> ${e.slug}`).toBeDefined();
  });

  it("states demo data on every WaveForge screenshot and a deployment status that isn't a claim", () => {
    const wf = getProject("waveforge")!;
    for (const m of wf.media) if (m.kind === "screenshot") expect(m.demoData).toBe(true);
    expect(wf.links).toEqual([]);
  });
});
