const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-24" -> "Nov 2026". Pure string handling, so output never depends on the build machine's time zone. */
export function formatMonth(iso: string): string {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(iso);
  const month = m ? MONTHS[Number(m[2]) - 1] : undefined;
  if (!m || !month) throw new Error(`Not an ISO date: ${iso}`);
  return `${month} ${m[1]}`;
}

/** "2026-11-24" -> "24 Nov 2026". */
export function formatDay(iso: string): string {
  const day = Number(iso.slice(8, 10));
  return `${day} ${formatMonth(iso)}`;
}
