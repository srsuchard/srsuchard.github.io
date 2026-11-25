import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { COLORS } from "@/lib/tokens";

describe("contrastRatio (WCAG 2.x)", () => {
  it("matches known reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("is symmetric and accepts 3-digit hex", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(contrastRatio("#000000", "#ffffff"), 10);
  });

  it("rejects malformed colours", () => {
    expect(() => contrastRatio("blue", "#000")).toThrow();
  });
});

describe("design tokens meet WCAG AA", () => {
  const backgrounds = { base: COLORS.base, surface: COLORS.surface, raised: COLORS.raised };

  for (const [fgName, fg] of Object.entries({ text: COLORS.text, muted: COLORS.muted, accent: COLORS.accent })) {
    for (const [bgName, bg] of Object.entries(backgrounds)) {
      it(`${fgName} on ${bgName} is at least 4.5:1`, () => {
        expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("the focus ring (accent) is at least 3:1 against every background", () => {
    for (const bg of Object.values(backgrounds)) expect(contrastRatio(COLORS.accent, bg)).toBeGreaterThanOrEqual(3);
  });

  it("text on the accent fill (primary buttons) is at least 4.5:1", () => {
    expect(contrastRatio(COLORS.onAccent, COLORS.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
