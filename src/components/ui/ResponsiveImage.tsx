import type { Media } from "@/content/schema";

export type Screenshot = Extract<Media, { kind: "screenshot" }>;

export const variantUrl = (m: Screenshot, width: number) => `${m.src}-${width}.webp`;
export const largestUrl = (m: Screenshot) => variantUrl(m, Math.max(...m.widths));

type Props = { media: Screenshot; sizes: string; priority?: boolean; className?: string };

/**
 * A pre-optimised WebP screenshot (see scripts/optimize-media.ts). The static export can't use
 * next/image's optimiser, so the srcset lists exactly the widths that were generated.
 */
export function ResponsiveImage({ media, sizes, priority = false, className = "" }: Props) {
  const srcSet = media.widths.map((w) => `${variantUrl(media, w)} ${w}w`).join(", ");
  const fallback = variantUrl(media, media.widths.find((w) => w >= 1280) ?? Math.max(...media.widths));
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export: variants are generated at build time
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      width={media.width}
      height={media.height}
      alt={media.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      className={`h-auto w-full ${className}`}
    />
  );
}
