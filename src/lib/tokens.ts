// Colour tokens (spec §6). globals.css mirrors these values; tests/unit/contrast.test.ts and
// tests/unit/tokens-css.test.ts keep the two in sync and the pairs above WCAG AA.
export const COLORS = {
  base: "#0B0C0E",
  surface: "#121418",
  raised: "#181B20",
  border: "#23272E",
  text: "#E8EAED",
  muted: "#9AA1AC",
  accent: "#5B8CFF",
  onAccent: "#0B0C0E",
} as const;
