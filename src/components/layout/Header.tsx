import Link from "next/link";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { PROFILE_URL } from "@/content/constants";
import { Container } from "./Container";

export type NavKey = "work" | "hearth" | "about" | "home" | "none";

const NAV: { key: Exclude<NavKey, "home" | "none">; label: string; href: string }[] = [
  { key: "work", label: "Work", href: "/projects/" },
  { key: "hearth", label: "Hearth", href: "/hearth/" },
  { key: "about", label: "About", href: "/about/" },
];

const linkClass = "rounded-sm px-1 py-1 text-muted transition-colors hover:text-text aria-[current=page]:text-text";

/** Server-rendered header. The current page is passed in, so no client JavaScript is needed for aria-current. */
export function Header({ current }: { current: NavKey }) {
  return (
    <header className="border-b border-border">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
        <Link href="/" className="rounded-sm font-semibold tracking-tight" aria-current={current === "home" ? "page" : undefined}>
          Samuel Suchard
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:gap-x-6">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={linkClass} aria-current={current === item.key ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#contact" className={linkClass}>
                Contact
              </Link>
            </li>
            <li>
              <ExternalLink href={PROFILE_URL} className={linkClass}>
                GitHub
              </ExternalLink>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
