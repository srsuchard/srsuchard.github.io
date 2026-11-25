import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { profile } from "@/content/profile";

export function PrinciplesGrid({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <ul className="m-0 grid list-none gap-px overflow-hidden rounded-sm border border-border bg-border p-0 md:grid-cols-2">
      {profile.principles.map((p) => (
        <li key={p.title} className="bg-base p-6 sm:p-8">
          <H className="text-lg font-semibold tracking-tight">{p.title}</H>
          <p className="mt-3 leading-relaxed text-muted">{p.body}</p>
          <p className="mt-4 font-mono text-xs text-muted">
            See:{" "}
            {p.evidence.map((e, i) => (
              <span key={e.slug}>
                {i > 0 ? ", " : null}
                <Link href={e.slug === "hearth" ? "/hearth/" : `/projects/${e.slug}/`} className="rounded-sm text-accent underline-offset-4 hover:underline">
                  {e.label}
                </Link>
              </span>
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function HowIBuild() {
  return (
    <Section id="principles" label="How I build">
      <PrinciplesGrid />
    </Section>
  );
}
