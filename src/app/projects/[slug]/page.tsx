import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";
import { FeatureList } from "@/components/project/FeatureList";
import { Limitations } from "@/components/project/Limitations";
import { MediaGallery, MediaItem } from "@/components/project/MediaItem";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectSpec } from "@/components/project/ProjectSpec";
import { getProject, projectPages } from "@/content/index";
import type { CaseStudySection, Project, Variant } from "@/content/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.tagline,
    alternates: { canonical: `/projects/${p.slug}/` },
    openGraph: {
      type: "article",
      siteName: "Samuel Suchard",
      title: `${p.name} · Samuel Suchard`,
      description: p.tagline,
      url: `/projects/${p.slug}/`,
      images: [{ url: `/og/${p.slug}.png`, width: 1200, height: 630, alt: `${p.name}: ${p.tagline}` }],
    },
  };
}

const WIDE = "(min-width: 1200px) 1136px, 100vw";

function Block({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="border-t border-border py-14 sm:py-16">
      <Container>
        <h2 id={`${id}-heading`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {heading}
        </h2>
        <div className="mt-6">{children}</div>
      </Container>
    </section>
  );
}

function SectionBlock({ section }: { section: CaseStudySection }) {
  return (
    <Block id={section.id} heading={section.heading}>
      <div className="grid max-w-(--container-prose) gap-4 text-lg leading-relaxed text-muted">
        {section.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {section.media?.length ? (
        <div className="mt-10">
          <MediaGallery media={section.media} />
        </div>
      ) : null}
    </Block>
  );
}

function VariantBlock({ project, variant }: { project: Project; variant: Variant }) {
  return (
    <Block id={`variant-${variant.id}`} heading={variant.name}>
      <ProjectSpec project={project} status={variant.status} />
      <p className="mt-2 text-sm text-muted">{variant.status.detail}</p>
      <div className="mt-10 grid gap-10">
        <FeatureList features={variant.features} />
        <Limitations items={variant.limitations} />
        <MediaGallery media={variant.media} featureFirst={variant.media.length % 2 === 1} />
      </div>
    </Block>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || project.slug === "hearth") notFound();

  const [lead, ...rest] = project.media;
  const hasFeatures = project.features.length > 0 || project.limitations.length > 0;

  return (
    <PageShell current="work">
      <article>
        <ProjectHeader project={project} />
        {lead ? (
          <Container className="pb-14">
            <MediaItem media={lead} sizes={WIDE} priority />
          </Container>
        ) : null}

        {project.sections?.map((s) => (
          <SectionBlock key={s.id} section={s} />
        ))}

        {project.variants?.map((v) => (
          <VariantBlock key={v.id} project={project} variant={v} />
        ))}

        {hasFeatures ? (
          <Block id="built-and-planned" heading="Built and planned">
            <div className="grid gap-10">
              <FeatureList features={project.features} />
              <Limitations items={project.limitations} />
            </div>
          </Block>
        ) : null}

        {rest.length ? (
          <Block id="more" heading={rest.every((m) => m.kind === "screenshot") ? "Screens" : "How it works"}>
            <MediaGallery media={rest} />
          </Block>
        ) : null}
      </article>
    </PageShell>
  );
}
