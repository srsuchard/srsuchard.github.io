import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";

// Placeholder home. No project, Hearth or About content is built before the M3 content review.
export default function Home() {
  return (
    <PageShell current="home">
      <Container className="py-24 sm:py-32">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Samuel Suchard</h1>
        <p className="mt-4 text-lg text-muted">Site in progress.</p>
      </Container>
    </PageShell>
  );
}
