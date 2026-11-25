/** SHA-256 CSP source expressions for each inline <script> in the page, in document order. */
export function inlineScriptHashes(html: string): string[];
/** The site's Content-Security-Policy with the given script hashes. */
export function policy(hashes: string[]): string;
/** Returns the page with exactly one CSP meta (recomputed), placed right after <meta charset>. */
export function addCspMeta(html: string): string;
