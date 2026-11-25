import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { FeatureList } from "@/components/project/FeatureList";
import { TeamCredit } from "@/components/project/TeamCredit";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { SpecLine } from "@/components/ui/SpecLine";
import { getProject, people } from "@/content/index";
import { formatMonth } from "@/lib/format";

export function HearthBand() {
  const hearth = getProject("hearth")!;
  const prototype = hearth.links.find((l) => l.kind === "prototype");
  const why = hearth.sections?.find((s) => s.id === "why");
  return (
    <Section id="hearth" label="Hearth" eyebrow="Founder">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xl leading-snug text-text">{hearth.tagline}</p>
          {why?.body.map((p) => (
            <p key={p} className="mt-4 leading-relaxed text-muted">
              {p}
            </p>
          ))}
          <SpecLine
            className="mt-6"
            items={[
              { k: "Stage", v: hearth.status.label },
              { k: "As of", v: formatMonth(hearth.status.asOf) },
              { k: "Team", v: "Founder + co-founder" },
            ]}
          />
          <p className="mt-3 text-sm text-muted">{hearth.status.detail}.</p>
        </div>
        <div className="grid gap-10 lg:col-span-7">
          <FeatureList features={hearth.features} builtLabel="Exists today" />
          <TeamCredit team={hearth.team} people={people} />
          {prototype ? (
            <div className="rounded-sm border border-border p-4">
              <ExternalLink href={prototype.url} aria-describedby="hearth-prototype-caveat-home" className="rounded-sm font-medium text-accent underline-offset-4 hover:underline">
                {prototype.label}
              </ExternalLink>
              <p id="hearth-prototype-caveat-home" className="mt-2 text-sm text-muted">
                {prototype.caveat}
              </p>
            </div>
          ) : null}
          <p>
            <Link href="/hearth/" className="group inline-flex items-center gap-2 rounded-sm font-medium text-accent">
              More about Hearth
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </p>
        </div>
      </div>
    </Section>
  );
}
