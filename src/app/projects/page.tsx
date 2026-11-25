import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectRow } from "@/components/project/ProjectRow";
import { byTier } from "@/content/index";

export const metadata: Metadata = {
  title: "Work",
  description: "Projects by Samuel Suchard: developer tools, a multiplayer game, a web app, and Hearth.",
  alternates: { canonical: "/projects/" },
};

const GROUPS = [
  { tier: "case-study", label: "Case studies" },
  { tier: "standard", label: "Projects" },
  { tier: "brief", label: "Early stage" },
] as const;

export default function ProjectsIndex() {
  return (
    <PageShell current="work">
      <Container className="py-16 sm:py-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Work</h1>
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">
          {"Every project lists its status and when it was last checked, whether it's solo or collaborative, and whether its source is public."}
        </p>
        {GROUPS.map((g) => (
          <section key={g.tier} aria-labelledby={`group-${g.tier}`} className="mt-16">
            <h2 id={`group-${g.tier}`} className="mb-4 font-mono text-xs font-normal uppercase tracking-wider text-muted">
              {g.label}
            </h2>
            <ul className="m-0 list-none border-b border-border p-0">
              {byTier(g.tier).map((p) => (
                <ProjectRow key={p.slug} project={p} href={p.slug === "hearth" ? "/hearth/" : `/projects/${p.slug}/`} />
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </PageShell>
  );
}
