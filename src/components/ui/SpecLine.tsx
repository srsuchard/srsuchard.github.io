export type SpecItem = { k: string; v: string };

/** Compact mono line of facts, e.g. STATUS alpha 0.1.0 · TEAM solo · SOURCE public. */
export function SpecLine({ items, className = "" }: { items: SpecItem[]; className?: string }) {
  return (
    <dl className={`flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs leading-relaxed text-muted ${className}`}>
      {items.map(({ k, v }) => (
        <div key={k} className="flex gap-2">
          <dt className="uppercase tracking-wider">{k}</dt>
          <dd className="text-text">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
