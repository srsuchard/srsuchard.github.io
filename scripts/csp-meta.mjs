#!/usr/bin/env node
// Adds a Content-Security-Policy <meta> to every exported page. GitHub Pages can't send CSP
// headers, so the policy travels in the HTML. Each page's inline scripts (Next's bootstrap and
// RSC payload) are allowed by SHA-256 hash; no 'unsafe-inline' or 'unsafe-eval' for scripts.
// Idempotent: an existing CSP meta is removed and recomputed. Usage: node scripts/csp-meta.mjs out
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const EXISTING_CSP = /<meta http-equiv="Content-Security-Policy" content="[^"]*"\/>/g;
const CHARSET = /<meta\s+charset=["']?utf-8["']?\s*\/?>/i;

const sha256 = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;

/** @param {string} html */
export function inlineScriptHashes(html) {
  return [...html.matchAll(INLINE_SCRIPT)].map((m) => m[1]).filter(Boolean).map(sha256);
}

/** @param {string[]} hashes */
export function policy(hashes) {
  return [
    "default-src 'self'",
    ["script-src 'self'", ...hashes].join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join("; ");
}

/** @param {string} html */
export function addCspMeta(html) {
  const clean = html.replace(EXISTING_CSP, "");
  const charset = CHARSET.exec(clean);
  if (!charset) throw new Error("csp-meta: page has no <meta charset> to anchor the policy after");
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(inlineScriptHashes(clean))}"/>`;
  const at = charset.index + charset[0].length;
  return clean.slice(0, at) + meta + clean.slice(at);
}

const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dir = process.argv[2] ?? "out";
  const pages = walk(dir).filter((f) => f.endsWith(".html"));
  if (pages.length === 0) {
    console.error(`csp-meta: no HTML files in ${dir}/. Run \`next build\` first.`);
    process.exit(1);
  }
  for (const file of pages) writeFileSync(file, addCspMeta(readFileSync(file, "utf8")));
  console.log(`csp-meta: added CSP to ${pages.length} page(s) in ${dir}/`);
}
