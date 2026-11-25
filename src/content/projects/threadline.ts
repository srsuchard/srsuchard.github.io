import { terminal } from "../media";
import type { Project } from "../schema";
import { THREADLINE_SCENARIOS } from "../transcripts";

export const threadline: Project = {
  slug: "threadline",
  name: "Threadline",
  tagline: "Detect when a business process failed to produce its intended outcome, even when every tool reports success.",
  summary:
    "A deterministic rule engine in TypeScript. For example: an invoice is paid and the CRM record exists, but the onboarding task was never created. Today it runs on simulated data only.",
  tier: "brief",
  category: "engine",
  origin: "current",
  status: { label: "Phase 1", detail: "Detection engine committed; adapters, storage and UI not started", asOf: "2026-11-24" },
  team: { mode: "solo", members: [{ personId: "samuel", role: "Designed and built" }] },
  source: { visibility: "local-only" },
  links: [],
  stack: ["typescript", "nodejs", "vitest"],
  platforms: ["Node.js"],
  features: [
    { text: "A pure, deterministic engine that evaluates rules against observations as of a point in time", state: "implemented" },
    {
      text: "A finding is confirmed only when the evidence supports it, including proof that the source data was complete; otherwise it's reported as unverified",
      state: "implemented",
    },
    { text: "Handles duplicate deliveries, out-of-order versions, late records and missing correlation keys", state: "implemented" },
    { text: "Every simulated record and finding is labelled as simulated", state: "implemented" },
    { text: "Read-only adapters for real business systems", state: "planned" },
    { text: "Storage with an audit log", state: "planned" },
    { text: "A web interface", state: "planned" },
  ],
  limitations: ["The engine isn't ready for real business data yet; everything in the repository is simulated.", "Read-only toward external systems by design: it will never perform financial actions."],
  media: [
    terminal(
      "npm run scenarios",
      THREADLINE_SCENARIOS,
      "Two simulated scenarios: the same missing task is confirmed when the source data is complete past the deadline, and only suspected when it isn't.",
      "captured",
      "2026-11-24",
    ),
    { kind: "diagram", diagram: "threadline-engine", caption: "Only the rule engine exists today; adapters, storage and the interface are planned." },
  ],
  verifiedFrom: ["threadline/README.md#status, #Ground rules", "threadline/docs/ARCHITECTURE.md#Principles, #System shape", "Scenario report captured 2026-11-24 @ acfa744"],
};
