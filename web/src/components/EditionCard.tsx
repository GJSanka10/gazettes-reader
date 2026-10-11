import Link from "next/link";
import { parseClosingDate } from "@/lib/dates";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The homepage's one object on the right: the latest Gazette we've read, as a
 * card. On wide screens the scan animation sits on its desk at the top; below
 * it, the issue and three counts, each a way into the list it counts. When we
 * hold no Gazette issue it says "Latest update" and never invents one.
 */
export function EditionCard({
  issue,
  updatedAt,
  total,
  newCount,
  closingThisWeek,
  scan,
}: {
  issue: { number: string | null; date: string; count: number } | null;
  updatedAt: string | null;
  total: number;
  newCount: number;
  closingThisWeek: number;
  /** The hero animation, shown above the details on wide screens. */
  scan?: React.ReactNode;
}) {
  const date = issue ? parseClosingDate(issue.date) : updatedAt ? new Date(updatedAt) : null;
  const valid = date && !Number.isNaN(date.getTime()) ? date : null;

  const stats = [
    { n: total, label: total === 1 ? "open vacancy" : "open vacancies", href: "/government-jobs", hot: false },
    { n: newCount, label: "new this week", href: "/government-jobs?sort=newest", hot: false },
    { n: closingThisWeek, label: "close within 7 days", href: "/government-jobs?closing=7", hot: closingThisWeek > 0 },
  ];

  return (
    <section
      aria-labelledby="edition-title"
      className="overflow-hidden rounded-2xl border border-rule bg-surface shadow-lift"
    >
      {scan && (
        <div className="hero-desk hidden justify-center border-b border-rule px-5 pb-5 pt-7 lg:flex">{scan}</div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          {valid && (
            <p
              aria-hidden="true"
              className="flex w-[52px] shrink-0 flex-col items-center rounded-lg bg-ink py-1.5 text-paper"
            >
              <span className="text-[11.5px] font-semibold leading-none">{MONTHS[valid.getMonth()]}</span>
              <span className="count mt-1 text-[30px]">{valid.getDate()}</span>
            </p>
          )}
          <div className="min-w-0">
            <h2 id="edition-title" className="text-[15.5px] font-bold leading-snug text-ink">
              {issue ? `Latest Gazette read${issue.number ? `, No. ${issue.number}` : ""}` : "Latest update"}
            </h2>
            {valid && (
              <p className="text-[14px] leading-snug text-ink-3">
                {issue ? "Published " : ""}
                {valid.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {issue && issue.count > 0 && <>, {issue.count} {issue.count === 1 ? "vacancy" : "vacancies"}</>}
              </p>
            )}
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <li key={s.label}>
              <Link
                href={s.href}
                className={`group flex h-full flex-col rounded-xl border px-3 pb-2.5 pt-3 transition-colors ${
                  s.hot ? "border-hot/25 bg-hot-soft hover:border-hot" : "border-rule bg-paper hover:border-ink"
                }`}
              >
                <span className={`count text-[38px] sm:text-[42px] ${s.hot ? "text-hot" : "text-ink"}`}>{s.n}</span>
                <span
                  className={`mt-1.5 text-[13px] font-semibold leading-tight ${s.hot ? "text-hot" : "text-ink-2"} group-hover:underline`}
                >
                  {s.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {issue && (
          // The issue date alone reads as stale: the English edition of a Friday
          // Gazette is often published days later.
          <p className="mt-3.5 text-[13px] leading-snug text-ink-3">
            Each Gazette is added once its English edition is published, usually a few days after the Friday issue.
          </p>
        )}
      </div>
    </section>
  );
}
