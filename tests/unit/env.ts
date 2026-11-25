/** Blocked names from PORTFOLIO_BLOCKED_NAMES (.env.local locally, an Actions secret in CI). Never from source. */
export function blockedNamesFromEnv(): string[] {
  return (process.env.PORTFOLIO_BLOCKED_NAMES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Matches an email address with a real-looking domain (so `zod@4.6.7` package specifiers don't count). */
export const EMAIL_PATTERN = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[A-Za-z]{2,}\b/g;
