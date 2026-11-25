import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { ProjectRow } from "@/components/project/ProjectRow";
import { FEATURED, projectPages } from "@/content/index";

export function MoreProjects() {
  const more = projectPages().filter((p) => !(FEATURED as readonly string[]).includes(p.slug));
  return (
    <Section id="more" label="More projects">
      <ul className="m-0 list-none border-b border-border p-0">
        {more.map((p) => (
          <ProjectRow key={p.slug} project={p} />
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/projects/" className="group inline-flex items-center gap-2 rounded-sm font-medium text-accent">
          All projects
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </p>
    </Section>
  );
}
