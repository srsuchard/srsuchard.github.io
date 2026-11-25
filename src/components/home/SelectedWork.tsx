import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { MediaItem } from "@/components/project/MediaItem";
import { ProjectSpec } from "@/components/project/ProjectSpec";
import { FEATURED, getProject } from "@/content/index";
import type { Media, Project } from "@/content/schema";

/** The card's media: the project's lead item, else its first variant's. */
function leadMedia(p: Project): Media | undefined {
  return p.media[0] ?? p.variants?.[0]?.media[0];
}

function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const media = leadMedia(project);
  return (
    <article className="grid gap-8 border-t border-border pt-10 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <p className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h3>
        <p className="mt-3 text-lg leading-snug text-text">{project.tagline}</p>
        <p className="mt-3 leading-relaxed text-muted">{project.summary}</p>
        <ProjectSpec project={project} className="mt-5" />
        <p className="mt-6">
          <Link href={`/projects/${project.slug}/`} className="group inline-flex items-center gap-2 rounded-sm font-medium text-accent">
            <span>
              Read case study<span className="sr-only"> for {project.name}</span>
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </p>
      </div>
      {media ? (
        <div className="min-w-0 lg:col-span-7">
          <MediaItem media={media} sizes="(min-width: 1200px) 660px, (min-width: 1024px) 58vw, 100vw" compact />
        </div>
      ) : null}
    </article>
  );
}

export function SelectedWork() {
  const featured = FEATURED.map((slug) => getProject(slug)).filter((p): p is Project => Boolean(p));
  return (
    <Section id="work" label="Selected work" eyebrow="Projects">
      <div className="grid gap-16">
        {featured.map((p, i) => (
          <FeaturedProject key={p.slug} project={p} index={i} />
        ))}
      </div>
    </Section>
  );
}
