import { terminal } from "../media";
import type { Project } from "../schema";
import { PATCHPROOF_EXAMPLE } from "../transcripts";

export const patchproof: Project = {
  slug: "patchproof",
  name: "PatchProof",
  tagline: "Independently check what an AI coding agent says it did.",
  summary:
    "A local TypeScript command-line tool. For each claim about a change, it runs the checks you configured and reports VERIFIED, FAILED or UNKNOWN, with the exact commands, exit codes and output behind each result.",
  tier: "case-study",
  category: "developer-tool",
  origin: "current",
  status: { label: "v0.1", detail: "Supervised pilot testing on non-sensitive sample repositories; not published to npm", asOf: "2026-11-24" },
  team: { mode: "solo", members: [{ personId: "samuel", role: "Designed and built" }] },
  source: { visibility: "private" },
  links: [],
  stack: ["typescript", "nodejs", "vitest", "git", "githubactions"],
  platforms: ["macOS", "Linux (tested in CI only)"],
  features: [
    { text: "Claims declared in a strictly validated .patchproof.yml, each reported as VERIFIED, FAILED or UNKNOWN", state: "implemented" },
    { text: "Fail-to-pass: runs a claim's regression test against the base revision in an isolated clone", state: "implemented" },
    { text: "Changed-line coverage read from Istanbul or LCOV reports", state: "implemented" },
    { text: "Vitest and Jest results interpreted; other test runners detected and reported as unsupported", state: "implemented" },
    { text: "Asks before running anything; every command has a timeout and its whole process group is killed on expiry", state: "implemented" },
    { text: "Secrets redacted from reports; control and bidirectional characters in output shown as visible escapes", state: "implemented" },
    { text: "Terminal and JSON reports with documented exit codes", state: "implemented" },
  ],
  limitations: [
    "Running checks runs project code with your permissions and full environment. PatchProof is not a sandbox.",
    "Not ready for unsupervised use, sensitive repositories, or code you don't trust.",
    "Windows is not supported. Linux is tested in CI but hasn't been tested by hand.",
    "Tests and coverage are evidence, not proof that the code is correct.",
    "The name is provisional.",
  ],
  media: [
    terminal(
      "patchproof verify",
      PATCHPROOF_EXAMPLE,
      "From the README's example: an agent fixed clamp() and added a test. One claim is verified, one test passes even without the change, and one claim has no check at all.",
      "readme",
      "2026-11-24",
    ),
  ],
  sections: [
    {
      id: "problem",
      heading: "The problem",
      body: [
        "Coding agents routinely report that they fixed a bug, added tests or that all tests pass. Those statements are often true, but sometimes the new regression test passes on the old, buggy code too, a test filter matched zero tests and the runner still exited 0, or the new code is never executed by any test.",
        "PatchProof's rule is never to call something verified unless the collected evidence supports that exact claim. Anything ambiguous is UNKNOWN.",
      ],
    },
    {
      id: "fail-to-pass",
      heading: "Fail-to-pass",
      body: [
        "To show that a regression test really demonstrates a change, PatchProof runs it twice. First on your working tree, where it must pass. Then against the base revision, in a temporary clone with only the listed test files copied in. If it also passes there, the claim is FAILED: the test doesn't demonstrate the change.",
        "When a fair comparison isn't possible, such as changed dependencies, workspace symlinks or a symlink on the copied paths, the result is UNKNOWN and nothing runs. Your repository is only read: PatchProof never checks out, resets, stashes, cleans or commits in it.",
      ],
      media: [{ kind: "diagram", diagram: "patchproof-fail-to-pass", caption: "Fail-to-pass: the test must fail on the base revision and pass with the change." }],
    },
    {
      id: "security",
      heading: "Safety choices",
      body: [
        "Commands run as argument arrays with no shell, and git revisions that look like options are rejected. PatchProof never installs packages, fingerprints the working tree before and after running commands, and shows untrusted text as visible escapes so a test can't rewrite earlier lines of the report.",
        "Before its first outside users, it went through a recorded readiness audit. The verdict was that it is safe enough for supervised testing on non-sensitive sample repositories, and not beyond that.",
      ],
    },
  ],
  verifiedFrom: [
    "PatchProof/README.md#intro, #The problem, #What version 0.1 supports",
    "PatchProof/README.md#Fail-to-pass verification, #Security considerations, #Known limitations",
    "PatchProof/PILOT_READINESS.md#Verdict",
    "github.com/srsuchard/patchproof returns 404 to the public API (2026-11-24): no repository link",
  ],
};
