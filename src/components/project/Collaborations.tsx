import type { Collaboration, Person } from "@/content/schema";
import { MediaItem } from "./MediaItem";

/**
 * Collaborators & selected work. Renders nothing until there is at least one entry; each entry
 * must carry recorded approval from a publicly credited person (content rule R13).
 */
export function Collaborations({ items, people }: { items: Collaboration[]; people: Person[] }) {
  if (items.length === 0) return null;
  const nameOf = (id: string) => {
    const p = people.find((x) => x.id === id);
    return p?.attribution.status === "public" ? p.attribution.name : null;
  };
  return (
    <section aria-labelledby="collaborations-heading">
      <h2 id="collaborations-heading" className="text-2xl font-semibold tracking-tight">
        Collaborators &amp; selected work
      </h2>
      <ul className="m-0 mt-6 grid list-none gap-8 p-0">
        {items.map((c) => (
          <li key={c.id}>
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="mt-1 text-muted">{c.summary}</p>
            <p className="mt-2 font-mono text-xs text-muted">
              With {c.personIds.map(nameOf).filter(Boolean).join(", ")} · shared with permission ({c.approval.scope})
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {c.media.map((m, i) => (
                <MediaItem key={i} media={m} sizes="(min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
