import type { Person, Project } from "@/content/schema";

/**
 * Who worked on a project. A person whose public attribution is still pending is shown by title
 * and responsibilities only; their name appears once their attribution is set to public.
 */
export function TeamCredit({ team, people }: { team: Project["team"]; people: Person[] }) {
  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
      {team.members.map((m) => {
        const person = people.find((p) => p.id === m.personId);
        const name = person?.attribution.status === "public" ? person.attribution.name : null;
        return (
          <li key={m.personId} className="rounded-sm border border-border bg-surface px-4 py-3">
            <p className="font-medium text-text">{name ?? m.role}</p>
            {name ? <p className="text-sm text-muted">{m.role}</p> : null}
            {person && person.responsibilities.length > 0 ? <p className="mt-1 text-sm text-muted">{person.responsibilities.join(" · ")}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
