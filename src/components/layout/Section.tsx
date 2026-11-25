import type { ReactNode } from "react";
import { Container } from "./Container";

type Props = { id: string; label: string; eyebrow?: string; children: ReactNode; className?: string };

/** A page section labelled by its own heading, separated by a hairline rule rather than a card. */
export function Section({ id, label, eyebrow, children, className = "" }: Props) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={`border-t border-border py-16 sm:py-24 ${className}`}>
      <Container>
        {eyebrow ? <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">{eyebrow}</p> : null}
        <h2 id={headingId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {label}
        </h2>
        <div data-reveal="" className="mt-8 sm:mt-10">
          {children}
        </div>
      </Container>
    </section>
  );
}
