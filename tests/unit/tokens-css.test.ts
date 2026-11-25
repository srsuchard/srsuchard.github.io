import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COLORS } from "@/lib/tokens";

// globals.css and src/lib/tokens.ts must agree, so the contrast tests check the colours that ship.
const css = readFileSync("src/app/globals.css", "utf8").toLowerCase();
const cssName: Record<keyof typeof COLORS, string> = {
  base: "base",
  surface: "surface",
  raised: "raised",
  border: "border",
  text: "text",
  muted: "muted",
  accent: "accent",
  onAccent: "on-accent",
};

describe("colour tokens in globals.css", () => {
  for (const [key, value] of Object.entries(COLORS) as [keyof typeof COLORS, string][]) {
    it(`--color-${cssName[key]} is ${value}`, () => {
      expect(css).toContain(`--color-${cssName[key]}: ${value.toLowerCase()};`);
    });
  }
});
