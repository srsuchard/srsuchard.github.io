import { terminal } from "../media";
import type { Project } from "../schema";
import { FOREMAN_COMMANDS } from "../transcripts";

export const foreman: Project = {
  slug: "foreman",
  name: "Foreman",
  tagline: "An approval-gated assistant that builds ideas with Claude Code inside a Docker sandbox and commits only work that passes your own checks.",
  summary:
    "A local Python command-line tool. Ideas are stored in SQLite and need explicit approval. An approved idea is built by Claude Code in a hardened Docker sandbox, checked with commands you configured rather than the agent's own report, and committed only to a local Git repository. Foreman never pushes, publishes or deploys anything.",
  tier: "standard",
  category: "developer-tool",
  origin: "current",
  status: { label: "Working local tool", detail: "Runs builds on demand; no scheduler yet", asOf: "2026-11-24" },
  team: { mode: "solo", members: [{ personId: "samuel", role: "Designed and built" }] },
  source: { visibility: "local-only" },
  links: [],
  stack: ["python", "sqlite", "docker", "git", "pytest"],
  platforms: ["macOS", "Linux"],
  features: [
    { text: "An idea lifecycle with explicit approval, rejection and revocation; nothing runs without approval", state: "implemented" },
    { text: "Approval, pause, concurrency and budget re-checked in a transaction before every agent launch", state: "implemented" },
    { text: "Agent container with a read-only root filesystem, all capabilities dropped and a non-root user; only the idea's work tree is mounted", state: "implemented" },
    { text: "Agent network limited to an egress proxy that allows only the model API by default", state: "implemented" },
    { text: "Verification in separate containers with no network and a read-only workspace", state: "implemented" },
    { text: "Failed runs saved as a redacted patch, then the workspace is reset", state: "implemented" },
    { text: "A spending ledger, plus per-run turn and budget limits", state: "implemented" },
    { text: "A scheduler for unattended runs", state: "planned" },
  ],
  limitations: [
    "Requires Docker. Without it, Foreman refuses to run builds; there is no fallback that runs on the host.",
    "Needs an Anthropic API key or a Claude Code token.",
    "Unattended runs are refused until hard spending enforcement is available.",
  ],
  media: [
    terminal("foreman", FOREMAN_COMMANDS, "The command-line workflow, from the README. A build needs Docker and credentials, so it isn't run here.", "readme", "2026-11-24"),
    { kind: "diagram", diagram: "foreman-lifecycle", caption: "An idea moves from approval to a sandboxed build, independent verification and a local commit." },
  ],
  verifiedFrom: ["Foreman/README.md#intro, #Requirements, #Usage, #Idea and run lifecycle", "Foreman/README.md#Safety model (runner guards, Sandbox)", "Foreman/pyproject.toml"],
};
