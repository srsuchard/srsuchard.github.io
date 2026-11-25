import Link from "next/link";
import type { Project } from "@/content/schema";
import { ProjectSpec } from "./ProjectSpec";

/** One line per project in a list: name, tagline and spec line, the whole row linking to its page. */
export function ProjectRow({ project, href = `/projects/${project.slug}/` }: { project: Project; href?: string }) {
  return (
    <li data-reveal="" className="project-row border-t border-border">
      <Link href={href} className="group grid gap-2 rounded-sm py-6 md:grid-cols-12 md:gap-8">
        <span className="flex items-baseline justify-between gap-4 md:col-span-3">
          <span className="text-lg font-semibold tracking-tight">{project.name}</span>
          <span aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent md:hidden">
            →
          </span>
        </span>
        <span className="md:col-span-8">
          <span className="block leading-relaxed text-muted group-hover:text-text">{project.tagline}</span>
          <ProjectSpec project={project} className="mt-2" />
        </span>
        <span aria-hidden="true" className="hidden text-right text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent md:col-span-1 md:block">
          →
        </span>
      </Link>
    </li>
  );
}
