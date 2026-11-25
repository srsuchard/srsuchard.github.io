import { ExternalLink } from "@/components/ui/ExternalLink";
import { PROFILE_URL } from "@/content/constants";
import { Container } from "./Container";

// The year is fixed at build time; the site is rebuilt on every deploy.
const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {YEAR} Samuel Suchard</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <ExternalLink href={PROFILE_URL} className="rounded-sm hover:text-text">
            GitHub
          </ExternalLink>
          <span>Built with Next.js. No tracking.</span>
        </p>
      </Container>
    </footer>
  );
}
