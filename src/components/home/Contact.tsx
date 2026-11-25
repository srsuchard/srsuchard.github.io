import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { site } from "@/content/site";

// Contact channels come from site.contact (today: the GitHub profile only). Adding one is a data change.
export function Contact() {
  return (
    <Section id="contact" label="Get in touch">
      <p className="max-w-[56ch] text-lg leading-relaxed text-muted">The best way to reach me right now is through GitHub.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {site.contact.map((c) => (
          <ButtonLink key={c.url} href={c.url} external>
            {c.label}
          </ButtonLink>
        ))}
      </div>
    </Section>
  );
}
