import { describe, expect, it } from "vitest";
import { formatDay, formatMonth } from "@/lib/format";

describe("date formatting", () => {
  it("formats a month and year", () => {
    expect(formatMonth("2026-11-24")).toBe("Nov 2026");
    expect(formatMonth("2026-01-01")).toBe("Jan 2026");
  });

  it("formats a day", () => {
    expect(formatDay("2026-11-04")).toBe("4 Nov 2026");
  });

  it("rejects malformed dates", () => {
    expect(() => formatMonth("2026-13-01")).toThrow();
    expect(() => formatMonth("Nov 2026")).toThrow();
  });
});
