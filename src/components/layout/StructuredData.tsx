import { PROFILE_URL } from "@/content/constants";
import { profile } from "@/content/profile";
import { site, siteUrl } from "@/content/site";

/**
 * schema.org data for search engines: a Person (public profile link only, no contact details,
 * no location, no school) and Hearth as an Organization founded by that person, with no URL.
 */
export function StructuredData() {
  const personId = `${siteUrl()}/#person`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: site.name,
        url: `${siteUrl()}/`,
        sameAs: [PROFILE_URL],
        jobTitle: "Software developer and founder",
        knowsAbout: profile.interests,
      },
      { "@type": "Organization", name: "Hearth", founder: { "@id": personId } },
    ],
  };
  // Escape "<" so the JSON can never close the script element.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
