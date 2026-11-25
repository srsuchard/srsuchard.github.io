import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PROFILE_URL } from "@/content/constants";
import { site } from "@/content/site";

export function Hero() {
  return (
    <header id="hero" className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <Container>
        <p className="font-mono text-xs uppercase tracking-wider text-muted">{site.roles.join(" · ")}</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.035em] sm:text-7xl">{site.name}</h1>
        <p className="mt-6 max-w-[30ch] text-2xl leading-snug tracking-tight text-text sm:text-3xl">{site.hero}</p>
        <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">{site.secondary}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="#work">View work</ButtonLink>
          <ButtonLink href={PROFILE_URL} variant="secondary" external>
            GitHub
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
