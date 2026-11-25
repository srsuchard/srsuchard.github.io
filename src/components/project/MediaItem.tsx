import { Diagram } from "@/components/diagrams";
import type { Media } from "@/content/schema";
import { MediaFigure } from "./MediaFigure";
import { TerminalBlock } from "./TerminalBlock";

export function MediaItem({ media, sizes, priority = false, compact = false }: { media: Media; sizes: string; priority?: boolean; compact?: boolean }) {
  if (media.kind === "screenshot") return <MediaFigure media={media} sizes={sizes} priority={priority} />;
  if (media.kind === "terminal") return <TerminalBlock media={media} compact={compact} />;
  return <Diagram id={media.diagram} caption={media.caption} />;
}

/** Screenshots in a two-column grid; terminals and diagrams span the full width. */
export function MediaGallery({ media, featureFirst = false }: { media: Media[]; featureFirst?: boolean }) {
  if (media.length === 0) return null;
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
      {media.map((m, i) => {
        const wide = m.kind !== "screenshot" || (featureFirst && i === 0);
        return (
          <div key={i} className={wide ? "sm:col-span-2" : undefined}>
            <MediaItem media={m} sizes={wide ? "(min-width: 1200px) 1136px, 100vw" : "(min-width: 1200px) 560px, (min-width: 640px) 50vw, 100vw"} />
          </div>
        );
      })}
    </div>
  );
}
