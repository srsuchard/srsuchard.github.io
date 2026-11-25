import { largestUrl, ResponsiveImage, type Screenshot } from "@/components/ui/ResponsiveImage";

type Props = { media: Screenshot; sizes: string; priority?: boolean };

export function DemoBadge() {
  return <span className="rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-on-accent">Demo data</span>;
}

/** A screenshot that opens at full size, with its caption and, for demo-data captures, a visible label. */
export function MediaFigure({ media, sizes, priority = false }: Props) {
  return (
    <figure className="m-0">
      <a href={largestUrl(media)} className="block overflow-hidden rounded-sm border border-border bg-surface transition-colors hover:border-muted">
        <ResponsiveImage media={media} sizes={sizes} priority={priority} />
      </a>
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted">
        {media.demoData ? <DemoBadge /> : null}
        <span>{media.caption}</span>
      </figcaption>
    </figure>
  );
}
