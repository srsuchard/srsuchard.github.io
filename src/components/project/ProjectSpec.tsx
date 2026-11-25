import { SpecLine } from "@/components/ui/SpecLine";
import type { Project, Status } from "@/content/schema";
import { formatMonth } from "@/lib/format";

/** The mono fact line every project carries: status (with its date), team and source visibility. */
export function ProjectSpec({ project, status = project.status, className = "" }: { project: Project; status?: Status; className?: string }) {
  return (
    <SpecLine
      className={className}
      items={[
        { k: "Status", v: status.label },
        { k: "As of", v: formatMonth(status.asOf) },
        { k: "Team", v: project.team.mode === "solo" ? "Solo" : "Collaborative" },
        { k: "Source", v: project.source.visibility === "public" ? "Public" : "Not public" },
      ]}
    />
  );
}
