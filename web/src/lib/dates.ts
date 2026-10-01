/** Pure date helpers — no fs, so client components may import them too. */

/** Parse the closing-date strings the pipelines emit: "24 Sep 2026",
 *  "2026-09-24", or null. ISO dates are read as local calendar dates;
 *  `new Date("2026-09-24")` would read them as UTC midnight and put them a
 *  day out from the "24 Sep 2026" form in any timezone east of Greenwich. */
export function parseClosingDate(value?: string | null): Date | null {
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const parsed = iso ? new Date(+iso[1], +iso[2] - 1, +iso[3]) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(value?: string | null): number | null {
  const date = parseClosingDate(value);
  if (!date) return null;
  return Math.round((date.getTime() - startOfToday().getTime()) / 86_400_000);
}

/** Heat drives the only urgency colour: red within seven days. */
export type Heat = "hot" | "warm" | "cool" | "none" | "past";

export function heatFor(days: number | null): Heat {
  if (days === null) return "none";
  if (days < 0) return "past";
  if (days <= 2) return "hot";
  if (days <= 7) return "warm";
  return "cool";
}

// Fixed three-letter months: en-GB's locale data renders September as "Sept".
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function dayParts(date: Date) {
  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
    day: String(date.getDate()),
    month: MONTHS[date.getMonth()],
    long: date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

export function relativeDays(days: number | null): string {
  if (days === null) return "No closing date";
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `${days} days left`;
}

/** The Gazette's own date style: 2026.09.24. */
export function gazetteDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${mm}.${dd}`;
}
