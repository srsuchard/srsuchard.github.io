export function Limitations({ items, heading = "Limitations", headingLevel = 3 }: { items: string[]; heading?: string; headingLevel?: 2 | 3 | 4 }) {
  if (items.length === 0) return null;
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div>
      <H className="mb-3 font-mono text-xs font-normal uppercase tracking-wider text-muted">{heading}</H>
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {items.map((item) => (
          <li key={item} className="relative pl-5 leading-relaxed text-muted">
            <span aria-hidden="true" className="absolute top-0 left-0 font-mono text-muted">
              –
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
