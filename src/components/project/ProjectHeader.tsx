import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { people } from "@/content/people";
import type { Project } from "@/content/schema";
import { ProjectSpec } from "./ProjectSpec";
import { SourceNote } from "./SourceNote";

const CATEGORY: Record<Project["category"], string> = {
  "developer-tool": "Developer tool",
  game: "Game",
  app: "Web app",
  venture: "Venture",
  engine: "Engine",
  hardware: "Hardware",
  web: "Website",
};

export function ProjectHeader({ project, back = { href: "/projects/", label: "All work" } }: { project: Project; back?: { href: string; label: string } }) {
  const solo = project.team.mode === "solo" ? people.find((p) => p.id === project.team.members[0]?.personId) : undefined;
  return (
    <Container className="pt-12 pb-10 sm:pt-16">
      <p>
        <Link href={back.href} className="rounded-sm font-mono text-xs uppercase tracking-wider text-muted hover:text-text">
          <span aria-hidden="true">← </span>
          {back.label}
        </Link>
      </p>
      <p className="mt-10 font-mono text-xs uppercase tracking-wider text-muted">{CATEGORY[project.category]}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">{project.name}</h1>
      <p className="mt-5 max-w-[40ch] text-xl leading-snug sm:text-2xl">{project.tagline}</p>
      <ProjectSpec project={project} className="mt-6" />
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {project.source.visibility === "public" ? <SourceNote source={project.source} links={project.links} /> : null}
        <span className="text-muted">{project.platforms.join(" · ")}</span>
        {solo?.attribution.status === "public" ? <span className="text-muted">Solo project by {solo.attribution.name}</span> : null}
      </p>
      <p className="mt-8 max-w-(--container-prose) text-lg leading-relaxed text-muted">{project.summary}</p>
    </Container>
  );
}
