import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PageShell current="none">
      <Container className="py-24 sm:py-32">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 text-lg text-muted">There is nothing at this address.</p>
        <p className="mt-8">
          <Link href="/" className="rounded-sm text-accent underline underline-offset-4">
            Go to the home page
          </Link>
        </p>
      </Container>
    </PageShell>
  );
}
