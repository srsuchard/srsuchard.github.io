import type { Profile } from "./schema";

// Facts approved 2026-11-24. `about` and `principles` are drafts for the M3 content review.
// No city, employment history, dates or qualifications.
export const profile: Profile = {
  about: [
    "I'm a software developer, technology builder and the founder of Hearth.",
    "I'm interested in software engineering, cybersecurity, AI and entrepreneurship, and most of what I build sits where they meet: tools that check what AI coding agents actually did, a privacy-first product, and a multiplayer game whose server trusts nothing the client says.",
    "I like hard problems that need to be solved properly, and I try to be precise about where each project stands: what works, what's planned, and what isn't finished yet.",
  ],
  interests: ["Software engineering", "Cybersecurity", "AI", "Entrepreneurship"],
  education: [{ school: "Pacifica Christian High School" }],
  principles: [
    {
      title: "Verify, don't trust",
      body: "A claim counts only when a check backs it. PatchProof reports each claim about a change as verified, failed or unknown, and Foreman commits only work that passes the checks you configured, not the agent's own report.",
      evidence: [
        { slug: "patchproof", label: "PatchProof" },
        { slug: "foreman", label: "Foreman" },
      ],
    },
    {
      title: "Fail closed",
      body: "When it isn't safe to continue, stop and say why. AgentSafe refuses any restore it can't do safely and backs up the current state before changing anything.",
      evidence: [{ slug: "agentsafe", label: "AgentSafe" }],
    },
    {
      title: "Keep authority in one place",
      body: "In ProjectStrike's online play, clients send only their inputs. The server runs the same simulation code and decides every hit, score and round.",
      evidence: [{ slug: "projectstrike", label: "ProjectStrike" }],
    },
    {
      title: "Say what isn't done",
      body: "Every project here lists its limitations and separates what's built from what's planned. Threadline reports a finding as unverified when the evidence is incomplete, and Hearth makes no security claim before its design is implemented and reviewed.",
      evidence: [
        { slug: "threadline", label: "Threadline" },
        { slug: "hearth", label: "Hearth" },
      ],
    },
  ],
};
