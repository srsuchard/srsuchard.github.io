// Turns source screenshots into the WebP variants the site serves, and records their dimensions.
//
//   pnpm media
//
// Reads docs/internal/media-sources.json (git-ignored: it names local source paths):
//   [{ "from": "<path relative to PORTFOLIO_SOURCES_DIR, or absolute>", "slug": "projectstrike", "name": "menu",
//      "crop"?: { "left": 0, "top": 0, "width": 1440, "height": 900 } }]
// Writes public/media/<slug>/<name>-<width>.webp for each width in IMAGE_WIDTHS that does not
// exceed the source (never upscales), plus the source width itself, and src/content/generated/media.json with the dimensions.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import sharp from "sharp";
import { IMAGE_WIDTHS } from "../src/content/schema";

type Source = { from: string; slug: string; name: string; crop?: { left: number; top: number; width: number; height: number } };
type Entry = { width: number; height: number; widths: number[] };

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const SOURCES_DIR = process.env.PORTFOLIO_SOURCES_DIR;
const LIST = "docs/internal/media-sources.json";
const OUT_JSON = "src/content/generated/media.json";

async function main() {
  if (!SOURCES_DIR) throw new Error("Set PORTFOLIO_SOURCES_DIR in .env.local");
  const sources: Source[] = JSON.parse(readFileSync(LIST, "utf8"));
  const manifest: Record<string, Entry> = {};

  for (const slug of new Set(sources.map((s) => s.slug))) rmSync(join("public/media", slug), { recursive: true, force: true });

  for (const s of sources) {
    if (!/^[a-z0-9-]+$/.test(s.slug) || !/^[a-z0-9-]+$/.test(s.name)) throw new Error(`Bad slug/name: ${s.slug}/${s.name}`);
    const file = isAbsolute(s.from) ? s.from : join(SOURCES_DIR, s.from);
    let img = sharp(file).rotate();
    if (s.crop) img = img.extract(s.crop);
    // Strip all metadata (EXIF, ICC comments, timestamps) from published images.
    const base = await img.toColourspace("srgb").png().toBuffer();
    const { width, height } = await sharp(base).metadata();
    if (!width || !height) throw new Error(`Unreadable image: ${s.from}`);

    const standard: number[] = IMAGE_WIDTHS.filter((w) => w <= width);
    if (standard.length === 0) throw new Error(`${s.from} is narrower than ${IMAGE_WIDTHS[0]}px`);
    // Keep full resolution: add the source width when it's larger than the biggest standard width.
    const widths = width > standard[standard.length - 1]! ? [...standard, width] : standard;
    mkdirSync(join("public/media", s.slug), { recursive: true });
    for (const w of widths) {
      await sharp(base).resize({ width: w }).webp({ quality: 80, effort: 6 }).toFile(join("public/media", s.slug, `${s.name}-${w}.webp`));
    }
    manifest[`/media/${s.slug}/${s.name}`] = { width, height, widths: [...widths] };
    console.log(`${s.slug}/${s.name}: ${width}x${height} -> ${widths.join(", ")}`);
  }

  mkdirSync("src/content/generated", { recursive: true });
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(OUT_JSON, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`wrote ${OUT_JSON} (${Object.keys(sorted).length} images)`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
