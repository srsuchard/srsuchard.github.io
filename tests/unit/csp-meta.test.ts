import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { addCspMeta, inlineScriptHashes } from "../../scripts/csp-meta.mjs";

const sha = (s: string) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;
const page = (head: string, body = "") => `<!DOCTYPE html><html><head><meta charSet="utf-8"/>${head}</head><body>${body}</body></html>`;
const policyOf = (html: string) => /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1] ?? "";

describe("csp-meta", () => {
  const inlineA = 'self.__next_f.push([1,"a"])';
  const inlineB = "(globalThis.X||(globalThis.X=[])).push(1)";
  const html = page(`<link rel="stylesheet" href="/a.css"/><script src="/_next/x.js" async=""></script>`, `<script>${inlineA}</script><script id="_R_">${inlineB}</script>`);

  it("hashes every inline script and ignores external ones", () => {
    expect(inlineScriptHashes(html)).toEqual([sha(inlineA), sha(inlineB)]);
  });

  it("inserts the policy right after the charset meta, before any link or script", () => {
    const out = addCspMeta(html);
    const csp = out.indexOf('http-equiv="Content-Security-Policy"');
    expect(csp).toBeGreaterThan(out.indexOf('charSet="utf-8"'));
    expect(csp).toBeLessThan(out.indexOf("<link"));
    expect(csp).toBeLessThan(out.indexOf("<script"));
  });

  it("allows only self and the exact inline hashes for scripts", () => {
    const policy = policyOf(addCspMeta(html));
    const scriptSrc = policy.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src"))!;
    expect(scriptSrc).toBe(`script-src 'self' ${sha(inlineA)} ${sha(inlineB)}`);
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
    for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'", "img-src 'self' data:", "font-src 'self'", "connect-src 'self'"])
      expect(policy).toContain(d);
  });

  it("is idempotent", () => {
    const once = addCspMeta(html);
    expect(addCspMeta(once)).toBe(once);
  });

  it("recomputes hashes when scripts change", () => {
    const changed = addCspMeta(addCspMeta(html).replace(inlineA, "self.__next_f.push([2])"));
    expect(policyOf(changed)).toContain(sha("self.__next_f.push([2])"));
    expect(policyOf(changed)).not.toContain(sha(inlineA));
    expect(changed.match(/Content-Security-Policy/g)).toHaveLength(1);
  });

  it("refuses a page without a charset meta to anchor on", () => {
    expect(() => addCspMeta("<html><head></head><body></body></html>")).toThrow();
  });
});
