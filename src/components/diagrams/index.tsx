import type { Media } from "@/content/schema";
import { FlowDiagram, type FlowStep } from "./FlowDiagram";

type DiagramId = Extract<Media, { kind: "diagram" }>["diagram"];

// Each diagram restates facts from the project's own documentation (see each project's verifiedFrom).
const DIAGRAMS: Record<DiagramId, { title: string; steps: FlowStep[] }> = {
  "agentsafe-restore": {
    title: "How a restore runs",
    steps: [
      { label: "Preview", detail: "List what would be created, overwritten or deleted. Nothing changes yet." },
      { label: "Check conflicts", detail: "A file whose current version isn't saved in any snapshot stops the restore unless you choose to overwrite or keep it." },
      { label: "Confirm", detail: "Ask before changing anything." },
      { label: "Back up", detail: "Save the current state as an automatic pre-restore snapshot." },
      { label: "Restore", detail: "Re-check each path just before replacing it; never write through a symlink." },
      { label: "Verify", detail: "Confirm that the project files now match the snapshot." },
    ],
  },
  "patchproof-fail-to-pass": {
    title: "Fail-to-pass check",
    steps: [
      { label: "Run on your working tree", detail: "The claim's test must pass with the change." },
      { label: "Clone the base revision", detail: "A temporary clone in the system temp directory; your repository is only read." },
      { label: "Copy the listed tests in", detail: "Only the regression test files named in the claim." },
      { label: "Run the same test on base", detail: "It fails on base: VERIFIED. It passes on base: FAILED. It can't run fairly: UNKNOWN." },
    ],
  },
  "strike-netcode": {
    title: "One online step",
    steps: [
      { label: "Client sends inputs", detail: "Buttons and view angles for one fixed 1/60-second step. Nothing else is trusted." },
      { label: "Client predicts", detail: "Runs the same movement and weapon code locally so controls feel immediate." },
      { label: "Server simulates", detail: "Re-runs the input with the shared code and decides movement, hits, damage, scores and rounds." },
      { label: "Server rewinds for shots", detail: "Lag compensation checks hits against where other fighters were when you fired." },
      { label: "Client reconciles", detail: "Corrects its own state to the server's and shows other fighters 100 ms in the past, interpolated." },
    ],
  },
  "foreman-lifecycle": {
    title: "From idea to commit",
    steps: [
      { label: "Add an idea", detail: "A spec plus the commands that will verify it." },
      { label: "Approve it", detail: "Nothing runs without explicit approval; approval, pause and budget are re-checked before every launch." },
      { label: "Build in the sandbox", detail: "Claude Code in a hardened Docker container that can reach only the model API." },
      { label: "Verify independently", detail: "Your commands, in a separate container with no network and a read-only workspace." },
      { label: "Commit or roll back", detail: "Passed: a local commit. Otherwise: a redacted patch is saved and the workspace is reset." },
    ],
  },
  "threadline-engine": {
    title: "Threadline's design",
    steps: [
      { label: "Read-only adapters", detail: "Collect records from business systems; never write to them.", state: "planned" },
      { label: "Observations", detail: "Immutable, versioned records with source watermarks (simulated today).", state: "built" },
      { label: "Rule engine", detail: "Pure and deterministic: evaluates rules as of a point in time.", state: "built" },
      { label: "Findings", detail: "Confirmed only with complete evidence; otherwise reported as unverified.", state: "built" },
      { label: "Storage and interface", detail: "Postgres with an audit log, and a web UI.", state: "planned" },
    ],
  },
};

export function Diagram({ id, caption }: { id: DiagramId; caption: string }) {
  const d = DIAGRAMS[id];
  return <FlowDiagram title={d.title} steps={d.steps} caption={caption} />;
}
