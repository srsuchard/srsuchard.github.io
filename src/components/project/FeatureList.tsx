import { useId } from "react";
import type { Feature } from "@/content/schema";

const GROUPS = [
  { key: "built", label: "Built", states: ["implemented", "partial"] },
  { key: "planned", label: "Planned · not built yet", states: ["planned"] },
] as const;

/** Built and planned work, always kept apart. Partially built items stay under Built, tagged. */
export function FeatureList({ features, headingLevel = 3 }: { features: Feature[]; headingLevel?: 2 | 3 | 4 }) {
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  const base = useId();
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {GROUPS.map((group) => {
        const items = features.filter((f) => (group.states as readonly string[]).includes(f.state));
        if (items.length === 0) return null;
        const id = `${base}-${group.key}`;
        return (
          <div key={group.key}>
            <H id={id} className={`mb-3 font-mono text-xs font-normal uppercase tracking-wider ${group.key === "planned" ? "text-muted" : "text-accent"}`}>
              {group.label}
            </H>
            <ul aria-labelledby={id} className="m-0 grid list-none gap-2.5 p-0">
              {items.map((f) => (
                <li key={f.text} className={`relative pl-5 leading-relaxed ${group.key === "planned" ? "text-muted" : "text-text"}`}>
                  <span aria-hidden="true" className={`absolute top-[0.7em] left-0 h-px w-2.5 ${group.key === "planned" ? "bg-border" : "bg-accent"}`} />
                  {f.text}
                  {f.state === "partial" ? <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-muted">Partial</span> : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
