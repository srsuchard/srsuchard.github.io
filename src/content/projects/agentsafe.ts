import { terminal } from "../media";
import type { Project } from "../schema";
import { AGENTSAFE_DEMO } from "../transcripts";

export const agentsafe: Project = {
  slug: "agentsafe",
  name: "AgentSafe",
  tagline: "Snapshot a project before an AI coding agent changes it, see exactly what changed, and put it back safely.",
  summary:
    "A local-first Python command-line tool for macOS. It stores snapshots outside the project, works without Git commits, and refuses any restore it can't do safely.",
  tier: "case-study",
  category: "developer-tool",
  origin: "current",
  status: { label: "Alpha 0.1.0", detail: "Early alpha; installed from source (not on PyPI yet)", asOf: "2026-11-24" },
  team: { mode: "solo", members: [{ personId: "samuel", role: "Designed and built" }] },
  source: { visibility: "public" },
  links: [{ kind: "github", url: "https://github.com/srsuchard/agentsafe", label: "Source on GitHub", verifiedOn: "2026-11-24" }],
  stack: ["python", "git", "pytest", "githubactions"],
  platforms: ["macOS", "Python 3.11–3.14"],
  features: [
    { text: "Snapshots stored outside the project, with each file content-addressed by SHA-256", state: "implemented" },
    { text: "diff, verify and dry-run restore, none of which write to the project", state: "implemented" },
    {
      text: "Restore with conflict detection: a file whose current version isn't saved anywhere blocks the restore unless you choose to overwrite or keep it",
      state: "implemented",
    },
    { text: "An automatic pre-restore backup snapshot, then a check that the files match", state: "implemented" },
    { text: "Symlinks recorded, never followed; paths opened one component at a time with O_NOFOLLOW", state: "implemented" },
    { text: "Manifest checksums and path validation; stored content re-hashed before every restore", state: "implemented" },
    { text: "Snapshot directories created 0700 and files 0600/0400, because snapshots can contain secrets", state: "implemented" },
    { text: "Pruning old snapshots (storage only grows today)", state: "planned" },
    { text: "Publishing to PyPI", state: "planned" },
  ],
  limitations: [
    "Developed and tested only on macOS. Windows is unsupported.",
    "In a Git project, Git-ignored files such as .env aren't captured, so AgentSafe can't bring them back.",
    "Only content, symlink targets and permission bits are restored; ownership, timestamps, ACLs and extended attributes are not.",
    "Moving the project directory disconnects it from its snapshots.",
    "Stop agents before restoring: a change made in the instant between the final check and the replacement can still be lost.",
  ],
  media: [
    terminal(
      "agentsafe: five-minute demo",
      AGENTSAFE_DEMO,
      "The README's demo, run from the public repository in a throwaway directory. Temporary paths are shortened to ~/demo.",
      "captured",
      "2026-11-24",
    ),
  ],
  sections: [
    {
      id: "problem",
      heading: "The problem",
      body: [
        "An AI coding agent can change many files in a single run. If the result is wrong, getting back to where you were depends on having committed at the right moment, and on not losing work that was never committed at all.",
        "AgentSafe takes a snapshot before the agent runs, shows exactly what changed afterwards, and puts things back only when that is safe. It doesn't need Git commits, and it keeps its snapshots outside the project.",
      ],
    },
    {
      id: "restore",
      heading: "How a restore works",
      body: [
        "Every restore follows the same order: preview, check for conflicts, ask for confirmation, back up the current state, restore, then verify that the project matches the snapshot.",
        "A conflict is a file whose current version isn't saved in any snapshot. A plain restore is refused while conflicts exist; you choose to overwrite them (after they're backed up) or keep them. Each path is re-checked just before it's changed, and a parent directory that has been swapped for a symlink causes an error rather than a write outside the project.",
      ],
      media: [{ kind: "diagram", diagram: "agentsafe-restore", caption: "A restore stops at any step that fails, and backs up before it changes anything." }],
    },
    {
      id: "demo",
      heading: "A real run",
      body: [
        "The transcript at the top of this page is the README's five-minute demo, run from the public repository. It also shows what AgentSafe doesn't protect: deleting the Git-ignored .env file goes unnoticed, because that file was never captured.",
      ],
    },
    {
      id: "testing",
      heading: "Testing",
      body: [
        "A pytest suite covers snapshots, paths, integrity checks, restore and its guards, and runs the README demo itself so the documentation can't drift from the behaviour. GitHub Actions runs it on macOS with Python 3.11, 3.12, 3.13 and 3.14.",
      ],
    },
  ],
  verifiedFrom: [
    "AgentSafe/README.md#intro and status",
    "AgentSafe/README.md#Usage, #Restoring, #Exit codes",
    "AgentSafe/README.md#Safety model, #Known limitations",
    "AgentSafe/tests/ (file list) and .github/workflows/ci.yml",
    "Demo captured 2026-11-24 from github.com/srsuchard/agentsafe @ c8e5a47",
  ],
};
