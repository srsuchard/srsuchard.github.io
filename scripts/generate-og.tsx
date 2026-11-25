// Renders the Open Graph cards to public/og/*.png before `next build`.
//
// Why not app/opengraph-image routes: with output: "export" they're written without a file
// extension, and GitHub Pages picks Content-Type from the extension, so they'd be served as
// application/octet-stream. Real .png files are served as image/png.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getProject, projectPages } from "../src/content/index";
import { site } from "../src/content/site";
import { ogImage } from "../src/lib/og";

const OUT = join(process.cwd(), "public/og");

async function write(name: string, res: Response) {
  const bytes = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(OUT, `${name}.png`), bytes);
  console.log(`og: ${name}.png (${(bytes.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  await write("home", ogImage({ eyebrow: site.roles.join(" · "), title: site.name, line: site.hero }));
  const hearth = getProject("hearth")!;
  await write("hearth", ogImage({ eyebrow: "Samuel Suchard · Founder", title: hearth.name, line: hearth.tagline, meta: `Status: ${hearth.status.label}` }));
  for (const p of projectPages()) {
    await write(p.slug, ogImage({ eyebrow: "Samuel Suchard · Project", title: p.name, line: p.tagline, meta: `Status: ${p.status.label}` }));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
