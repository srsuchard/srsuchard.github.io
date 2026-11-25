import { describe, expect, it } from "vitest";
import { CollaborationSchema, PersonSchema, ProfileSchema, ProjectSchema } from "@/content/schema";
import { validProject } from "./fixtures";

describe("ProjectSchema", () => {
  it("accepts a minimal valid project", () => {
    expect(ProjectSchema.safeParse(validProject()).success).toBe(true);
  });

  it("rejects a screenshot without alt text", () => {
    const p = validProject();
    p.media = [{ kind: "screenshot", src: "/media/demo/shot", widths: [640], alt: "", caption: "c", width: 1280, height: 720, demoData: false }];
    expect(ProjectSchema.safeParse(p).success).toBe(false);
  });

  it("rejects an invalid ISO date", () => {
    const p = validProject();
    p.status.asOf = "2026-13-40";
    expect(ProjectSchema.safeParse(p).success).toBe(false);
  });

  it("rejects an unknown tier", () => {
    expect(ProjectSchema.safeParse({ ...validProject(), tier: "hero" }).success).toBe(false);
  });

  it("rejects a screenshot src outside /media/ or with a file extension", () => {
    for (const src of ["/images/shot", "https://example.com/shot", "/media/demo/shot.png", "/media/../secret"]) {
      const p = validProject();
      p.media = [{ kind: "screenshot", src, widths: [640], alt: "a", caption: "c", width: 1280, height: 720, demoData: false }];
      expect(ProjectSchema.safeParse(p).success, src).toBe(false);
    }
  });

  it("rejects non-https links", () => {
    for (const url of ["http://example.com", "javascript:alert(1)", "mailto:someone@example.com"]) {
      const p = validProject();
      p.links = [{ kind: "live", url, label: "x", verifiedOn: "2026-11-24" }];
      expect(ProjectSchema.safeParse(p).success, url).toBe(false);
    }
  });

  it("rejects unknown keys", () => {
    expect(ProjectSchema.safeParse({ ...validProject(), users: 1000 }).success).toBe(false);
  });
});

describe("PersonSchema", () => {
  it("rejects a pending attribution that carries a name", () => {
    const r = PersonSchema.safeParse({
      id: "x",
      title: "Co-founder",
      responsibilities: [],
      attribution: { status: "pending", name: "Someone" },
    });
    expect(r.success).toBe(false);
  });

  it("accepts a pending attribution without a name", () => {
    const r = PersonSchema.safeParse({ id: "x", title: "Co-founder", responsibilities: ["Leads UI/UX"], attribution: { status: "pending" } });
    expect(r.success).toBe(true);
  });
});

describe("CollaborationSchema", () => {
  it("rejects a collaboration without approval", () => {
    const r = CollaborationSchema.safeParse({ id: "c", title: "t", summary: "s", personIds: ["samuel"], media: [], links: [] });
    expect(r.success).toBe(false);
  });
});

describe("ProfileSchema", () => {
  it("rejects education entries with extra details such as year or city", () => {
    for (const extra of [{ year: "2026" }, { city: "Somewhere" }]) {
      const r = ProfileSchema.safeParse({ about: [], interests: [], principles: [], education: [{ school: "A School", ...extra }] });
      expect(r.success, JSON.stringify(extra)).toBe(false);
    }
  });
});
