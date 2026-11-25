import type { Status } from "@/content/schema";
import { formatMonth } from "@/lib/format";

/** A project status with the date it was last verified. The date is always shown, because statuses go stale. */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <p className="font-mono text-xs text-muted">
      <span className="text-text">{status.label}</span>
      <span aria-hidden="true"> · </span>
      <span className="sr-only">, </span>
      <span>
        as of <time dateTime={status.asOf}>{formatMonth(status.asOf)}</time>
      </span>
    </p>
  );
}
