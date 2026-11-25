import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PROFILE_URL } from "@/content/constants";
import { site } from "@/content/site";

export function Hero() {
  return (
    <header id="hero" className="hero pt-20 pb-16 sm:pt-28 sm:pb-24">
      <Container className="relative">
        <p data-intro="1" className="font-mono text-xs uppercase tracking-wider text-muted">
          {site.roles.join(" · ")}
        </p>
        <h1 data-intro="2" className="mt-5 text-5xl font-semibold tracking-[-0.035em] sm:text-7xl">
          {site.name}
        </h1>
        <p data-intro="3" className="mt-6 max-w-[30ch] text-2xl leading-snug tracking-tight text-text sm:text-3xl">
          {site.hero}
        </p>
        <p data-intro="4" className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">
          {site.secondary}
        </p>
        <div data-intro="5" className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="#work">View work</ButtonLink>
          <ButtonLink href={PROFILE_URL} variant="secondary" external>
            GitHub
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
