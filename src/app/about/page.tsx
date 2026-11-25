import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PrinciplesGrid } from "@/components/home/HowIBuild";
import { StackList } from "@/components/home/StackSection";
import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";
import { projects } from "@/content/index";
import { profile } from "@/content/profile";
import type { Project } from "@/content/schema";

export const metadata: Metadata = {
  title: "About",
  description: profile.about[0],
  alternates: { canonical: "/about/" },
};

const GROUPS: { label: string; categories: Project["category"][] }[] = [
  { label: "Founder", categories: ["venture"] },
  { label: "Developer tools", categories: ["developer-tool", "engine"] },
  { label: "Games and apps", categories: ["game", "app", "web", "hardware"] },
];

function Block({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
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

export default function AboutPage() {
  return (
    <PageShell current="about">
      <Container className="pt-16 pb-14 sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">About</h1>
        <div className="mt-8 grid max-w-(--container-prose) gap-5 text-lg leading-relaxed">
          {profile.about.map((p, i) => (
            <p key={p} className={i === 0 ? "text-xl text-text" : "text-muted"}>
              {p}
            </p>
          ))}
        </div>
      </Container>

      <Block id="interests" heading="Interests">
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {profile.interests.map((i) => (
            <li key={i} className="rounded-sm border border-border px-3 py-1.5 text-text">
              {i}
            </li>
          ))}
        </ul>
      </Block>

      <Block id="education" heading="Education">
        <ul className="m-0 list-none p-0">
          {profile.education.map((e) => (
            <li key={e.school} className="text-lg text-text">
              {e.school}
            </li>
          ))}
        </ul>
      </Block>

      <Block id="built" heading="What I've built">
        <div className="grid gap-10 md:grid-cols-3">
          {GROUPS.map((g) => {
            const items = projects.filter((p) => g.categories.includes(p.category));
            if (items.length === 0) return null;
            return (
              <div key={g.label}>
                <h3 className="mb-3 font-mono text-xs font-normal uppercase tracking-wider text-muted">{g.label}</h3>
                <ul className="m-0 grid list-none gap-3 p-0">
                  {items.map((p) => (
                    <li key={p.slug}>
                      <Link href={p.slug === "hearth" ? "/hearth/" : `/projects/${p.slug}/`} className="rounded-sm font-medium text-text hover:text-accent">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{p.tagline}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Block>

      <Block id="stack" heading="Stack">
        <StackList />
      </Block>

      <Block id="principles" heading="How I build">
        <PrinciplesGrid />
      </Block>
    </PageShell>
  );
}
