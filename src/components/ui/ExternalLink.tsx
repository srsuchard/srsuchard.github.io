import type { ReactNode } from "react";

type Props = { href: string; children: ReactNode; className?: string; "aria-describedby"?: string };

/** A link that leaves the site: no referrer, a visible ↗ and a hidden note for screen readers. Opens in the same tab. */
export function ExternalLink({ href, children, className, ...rest }: Props) {
  return (
    <a href={href} rel="noopener noreferrer" className={className} {...rest}>
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens external site)</span>
    </a>
  );
}
