import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "./ExternalLink";

const base = "inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-medium transition-colors";
const styles = {
  primary: `${base} bg-accent text-on-accent hover:bg-[#7aa2ff]`,
  secondary: `${base} border border-border text-text hover:border-muted`,
};

export function ButtonLink({ href, children, variant = "primary", external = false }: { href: string; children: ReactNode; variant?: keyof typeof styles; external?: boolean }) {
  if (external)
    return (
      <ExternalLink href={href} className={styles[variant]}>
        {children}
      </ExternalLink>
    );
  return (
    <Link href={href} className={styles[variant]}>
      {children}
    </Link>
  );
}
