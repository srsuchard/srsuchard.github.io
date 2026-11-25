import { useId } from "react";

export type FlowStep = { label: string; detail: string; state?: "built" | "planned" };

/**
 * A process drawn as an ordered list of steps. HTML rather than SVG so the text stays readable
 * on a phone, wraps naturally, and is announced as a list by screen readers.
 */
export function FlowDiagram({ title, steps, caption }: { title: string; steps: FlowStep[]; caption?: string }) {
  const id = useId();
  return (
    <figure className="m-0">
      <p id={id} className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">
        {title}
      </p>
      <ol aria-labelledby={id} className="m-0 grid list-none gap-2 p-0">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={`relative grid grid-cols-[2rem_1fr] gap-x-3 rounded-sm border px-4 py-3 ${step.state === "planned" ? "border-dashed border-border" : "border-border bg-surface"}`}
          >
            <span aria-hidden="true" className="font-mono text-xs leading-6 text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="font-medium text-text">{step.label}</span>
              {step.state ? (
                <span className={`ml-2 font-mono text-[11px] uppercase tracking-wider ${step.state === "planned" ? "text-muted" : "text-accent"}`}>
                  {step.state === "planned" ? "Planned" : "Built"}
                </span>
              ) : null}
              <span className="mt-0.5 block text-sm text-muted">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      {caption ? <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
