import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EMAIL_PATTERN, blockedNamesFromEnv } from "./env";

// The repository is public. Every tracked file is checked for private details before it can be pushed.
const tracked = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const BINARY = /\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|zip)$/i;
const textFiles = tracked.filter((f) => !BINARY.test(f)).map((f) => {
  try {
    return [f, readFileSync(f, "utf8")] as const;
  } catch {
    return [f, ""] as const; // staged deletion
  }
});

// Built at runtime so this file doesn't match its own patterns.
const HOME_DIR = new RegExp(["", "Users", ""].join("/"));
const ALLOWED_EMAIL = /@example\.com$|@users\.noreply\.github\.com$|^noreply@anthropic\.com$/;

describe("public repo hygiene", () => {
  it("tracks no environment files other than .env.example", () => {
    expect(tracked.filter((f) => /(^|\/)\.env/.test(f) && !f.endsWith(".env.example"))).toEqual([]);
  });

  it("contains no blocked names", () => {
    const names = blockedNamesFromEnv();
    expect(names.length, "Set PORTFOLIO_BLOCKED_NAMES in .env.local").toBeGreaterThan(0);
    const patterns = names.map((n) => new RegExp(`(?<![\\p{L}\\p{N}])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu"));
    expect(textFiles.filter(([, t]) => patterns.some((re) => re.test(t))).map(([f]) => f)).toEqual([]);
  });

  it("contains no local home-directory paths", () => {
    expect(textFiles.filter(([, t]) => HOME_DIR.test(t)).map(([f]) => f)).toEqual([]);
  });

  it("contains no real email addresses", () => {
    const found = textFiles.flatMap(([f, t]) =>
      [...t.matchAll(EMAIL_PATTERN)].map((m) => m[0]).filter((e) => !ALLOWED_EMAIL.test(e)).map((e) => `${f}: ${e}`),
    );
    expect(found).toEqual([]);
  });
});
