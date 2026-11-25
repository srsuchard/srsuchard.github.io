import type { Media } from "@/content/schema";
import { formatDay } from "@/lib/format";

type Terminal = Extract<Media, { kind: "terminal" }>;

/** Real program output, shown verbatim (no ligatures), with where it came from. */
export function TerminalBlock({ media, compact = false }: { media: Terminal; compact?: boolean }) {
  const label = `${media.title}: terminal output`;
  const provenance = media.provenance === "captured" ? `Captured output · ${formatDay(media.capturedOn)}` : "From the project README";
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-sm border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span className="text-text">{media.title}</span>
          <span>{provenance}</span>
        </div>
        <pre
          role="region"
          aria-label={label}
          tabIndex={0}
          className={`m-0 ${compact ? "max-h-72" : "max-h-[32rem]"} overflow-auto whitespace-pre px-4 py-3 font-mono text-[12.5px] leading-relaxed text-text`}
        >
          {media.text}
        </pre>
      </div>
      <figcaption className="mt-3 text-sm text-muted">{media.caption}</figcaption>
    </figure>
  );
}
