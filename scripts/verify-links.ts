// Checks every external link the site publishes. Needs the network, so it's run by hand
// (`pnpm verify:links`), not in `pnpm check` or CI.
//
// - Every external URL in the content and every external href in out/*.html must answer 200
//   (redirects followed).
// - Every github.com/<owner>/<repo> link must still be a public repository (GitHub API).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { collaborations, projects, site } from "../src/content/index";

const OUT = join(process.cwd(), "out");
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));

function collect(): string[] {
  const urls = new Set<string>();
  for (const l of [...projects.flatMap((p) => p.links), ...collaborations.flatMap((c) => c.links), ...site.contact]) urls.add(l.url);
  for (const f of walk(OUT).filter((x) => x.endsWith(".html")))
    for (const m of readFileSync(f, "utf8").matchAll(/<a [^>]*href="(https?:\/\/[^"]+)"/g)) urls.add(m[1]!.replace(/&amp;/g, "&"));
  return [...urls].sort();
}

async function status(url: string): Promise<number> {
  const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "portfolio-link-check" }, signal: AbortSignal.timeout(20_000) });
  return res.status;
}

async function main() {
  const urls = collect();
  let failed = 0;
  for (const url of urls) {
    let line = `${url}`;
    try {
      const code = await status(url);
      line += `  ${code}`;
      if (code !== 200) failed++;
      const repo = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+)/.exec(url);
      if (repo) {
        const api = await fetch(`https://api.github.com/repos/${repo[1]}/${repo[2]}`, { headers: { "user-agent": "portfolio-link-check" } });
        const body = api.ok ? ((await api.json()) as { visibility?: string }) : {};
        line += `  repo: ${body.visibility ?? `not visible (${api.status})`}`;
        if (body.visibility !== "public") failed++;
      }
    } catch (e) {
      line += `  ERROR ${(e as Error).message}`;
      failed++;
    }
    console.log(line);
  }
  console.log(`\n${urls.length} links checked, ${failed} problem(s)`);
  process.exit(failed ? 1 : 0);
}

main();
