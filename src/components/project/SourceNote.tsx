import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Link, Project } from "@/content/schema";

/** A repository link for public source; otherwise an explicit "Source not public" rather than silence. */
export function SourceNote({ source, links }: { source: Project["source"]; links: Link[] }) {
  const repo = source.visibility === "public" ? links.find((l) => l.kind === "github") : undefined;
  if (!repo) return <span className="text-muted">Source not public</span>;
  return (
    <ExternalLink href={repo.url} className="rounded-sm text-accent underline-offset-4 hover:underline">
      {repo.label}
    </ExternalLink>
  );
}
