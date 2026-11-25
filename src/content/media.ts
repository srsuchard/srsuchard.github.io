import generated from "./generated/media.json";
import type { Media } from "./schema";

type Entry = { width: number; height: number; widths: number[] };
const MEDIA = generated as Record<string, Entry>;

/** A screenshot entry for an image produced by `pnpm media`. Throws if the image was never generated. */
export function shot(src: string, alt: string, caption: string, options: { demoData?: boolean } = {}): Media {
  const entry = MEDIA[src];
  if (!entry) throw new Error(`No generated image for ${src}; add it to media-sources.json and run \`pnpm media\``);
  return { kind: "screenshot", src, widths: entry.widths, width: entry.width, height: entry.height, alt, caption, demoData: options.demoData ?? false };
}

/** A terminal transcript. `captured` = real output from running the tool; `readme` = taken from the project's README. */
export function terminal(title: string, text: string, caption: string, provenance: "captured" | "readme", capturedOn: string): Media {
  return { kind: "terminal", title, text: text.replace(/^\n+|\s+$/g, ""), caption, provenance, capturedOn };
}
