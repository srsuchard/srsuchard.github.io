import { Section } from "@/components/layout/Section";
import { deriveStack, getProject } from "@/content/index";

/** Technologies, derived from the projects that use them, so nothing is listed without evidence. */
export function StackList() {
  return (
    <dl className="m-0 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {deriveStack().map((s) => (
        <div key={s.tech} className="border-t border-border pt-3">
          <dt className="font-medium text-text">{s.label}</dt>
          <dd className="m-0 mt-0.5 text-sm text-muted">Used in {s.projects.map((slug) => getProject(slug)?.name ?? slug).join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StackSection() {
  return (
    <Section id="stack" label="Stack" eyebrow="Derived from the projects above">
      <StackList />
    </Section>
  );
}
