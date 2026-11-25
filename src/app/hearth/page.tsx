import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";
import { Collaborations } from "@/components/project/Collaborations";
import { FeatureList } from "@/components/project/FeatureList";
import { Limitations } from "@/components/project/Limitations";
import { MediaFigure } from "@/components/project/MediaFigure";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { TeamCredit } from "@/components/project/TeamCredit";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { collaborations, getProject, people } from "@/content/index";

const hearth = getProject("hearth")!;

export const metadata: Metadata = {
  title: "Hearth",
  description: hearth.tagline,
  alternates: { canonical: "/hearth/" },
  openGraph: {
    type: "article",
    siteName: "Samuel Suchard",
    title: "Hearth · Samuel Suchard",
    description: hearth.tagline,
    url: "/hearth/",
    images: [{ url: "/og/hearth.png", width: 1200, height: 630, alt: `Hearth: ${hearth.tagline}` }],
  },
};

function Block({ id, heading, children, planned = false }: { id: string; heading: string; children: ReactNode; planned?: boolean }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="border-t border-border py-14 sm:py-16" {...(planned ? { "data-planned-design": "" } : {})}>
      <Container>
        <h2 id={`${id}-heading`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {heading}
        </h2>
        <div className="mt-6">{children}</div>
      </Container>
    </section>
  );
}

const Prose = ({ paragraphs }: { paragraphs: string[] }) => (
  <div className="grid max-w-(--container-prose) gap-4 text-lg leading-relaxed text-muted">
    {paragraphs.map((p) => (
      <p key={p}>{p}</p>
    ))}
  </div>
);

export default function HearthPage() {
  const section = (id: string) => hearth.sections?.find((s) => s.id === id);
  const why = section("why");
  const role = section("role");
  const stage = section("stage");
  const prototype = hearth.links.find((l) => l.kind === "prototype");
  const screenshot = hearth.media.find((m) => m.kind === "screenshot");
  const built = hearth.features.filter((f) => f.state !== "planned");
  const planned = hearth.features.filter((f) => f.state === "planned");

  return (
    <PageShell current="hearth">
      <article>
        <ProjectHeader project={hearth} back={{ href: "/", label: "Home" }} />

        {why ? (
          <Block id="why" heading={why.heading}>
            <Prose paragraphs={why.body} />
          </Block>
        ) : null}

        {stage ? (
          <Block id="stage" heading={stage.heading}>
            <ol className="m-0 grid max-w-(--container-prose) list-none gap-2 p-0">
              {stage.body.map((line) => {
                // Status follows the last ": " (scope text can itself contain a colon).
                const at = line.lastIndexOf(": ");
                const phase = line.slice(0, at);
                const rest = line.slice(at + 2);
                return (
                  <li key={line} className="grid gap-1 border-t border-border py-3 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <span className="text-text">{phase}</span>
                    <span className="font-mono text-sm text-muted">{rest}</span>
                  </li>
                );
              })}
            </ol>
          </Block>
        ) : null}

        <Block id="exists" heading="Exists today">
          <div className="grid gap-10">
            <FeatureList features={built} builtLabel="Built so far" />
            <Limitations items={hearth.limitations} heading="Not built yet" />
          </div>
        </Block>

        <Block id="planned" heading="Planned design · not implemented" planned>
          <p className="max-w-(--container-prose) leading-relaxed text-muted">
            This is the security architecture Hearth is being designed around. None of it is implemented, and no security claim will be made until it is built and has passed two independent reviews.
          </p>
          <ul className="m-0 mt-6 grid max-w-(--container-prose) list-none gap-3 p-0">
            {planned.map((f) => (
              <li key={f.text} className="rounded-sm border border-dashed border-border px-4 py-3 leading-relaxed text-muted">
                <span className="font-mono text-xs uppercase tracking-wider text-text">Planned: </span>
                {f.text}
              </li>
            ))}
          </ul>
        </Block>

        {prototype || screenshot ? (
          <Block id="prototype" heading="The prototype">
            {screenshot ? <MediaFigure media={screenshot} sizes="(min-width: 1200px) 1136px, 100vw" /> : null}
            {prototype ? (
              <div className="mt-6 max-w-(--container-prose) rounded-sm border border-border p-4">
                <ExternalLink href={prototype.url} aria-describedby="hearth-prototype-caveat" className="rounded-sm font-medium text-accent underline-offset-4 hover:underline">
                  {prototype.label}
                </ExternalLink>
                <p id="hearth-prototype-caveat" className="mt-2 text-sm text-muted">
                  {prototype.caveat}
                </p>
              </div>
            ) : null}
          </Block>
        ) : null}

        <Block id="team" heading="Team">
          {role ? <Prose paragraphs={role.body} /> : null}
          <div className="mt-8">
            <TeamCredit team={hearth.team} people={people} />
          </div>
        </Block>

        {collaborations.length > 0 ? (
          <section className="border-t border-border py-14 sm:py-16">
            <Container>
              <Collaborations items={collaborations} people={people} />
            </Container>
          </section>
        ) : null}

        <Container className="border-t border-border py-10">
          <p className="max-w-(--container-prose) text-sm text-muted">
            {"Nothing on this page describes a shipped feature unless it is listed under 'Exists today'."}
          </p>
        </Container>
      </article>
    </PageShell>
  );
}
