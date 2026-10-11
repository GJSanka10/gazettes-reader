import Link from "next/link";
import type { GovVacancy } from "@/lib/types";
import { daysUntil, heatFor, parseClosingDate, shortDate } from "@/lib/dates";
import { QUALIFICATION_LABEL } from "@/lib/labels";
import { salaryShort } from "@/lib/salary";
import { SaveButton } from "./SaveButton";
import { Countdown } from "./JobStatus";

/** Where the vacancy came from, in one line. The Gazette number and published
 *  date appear only when they were actually printed; an institution's own
 *  advert says so rather than borrowing the Gazette's authority. */
export function sourceText(v: GovVacancy): string {
  const published = parseClosingDate(v.publishedDate);
  const when = published ? `${shortDate(published)} ${published.getFullYear()}` : null;
  if (v.sourceKind === "gazette") {
    return [v.gazetteNumber ? `Gazette No. ${v.gazetteNumber}` : "Government Gazette", when && `published ${when}`]
      .filter(Boolean)
      .join(", ");
  }
  return when ? `Institution notice, advertised ${when}` : "Institution notice, not a Gazette issue";
}

export function SourceLine({ v, className = "" }: { v: GovVacancy; className?: string }) {
  return <p className={`text-[14px] text-ink-3 ${className}`}>{sourceText(v)}</p>;
}

/** Wraps each search term found in `text` in a highlighter <mark>. */
export function Highlight({ text, terms }: { text: string; terms?: string[] }) {
  const clean = (terms ?? []).map((t) => t.trim()).filter((t) => t.length > 1);
  if (!clean.length) return <>{text}</>;
  const re = new RegExp(`(${clean.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/** "New" — the highlighter's own mark, since freshness is what it's for. */
export function NewTag({ className = "" }: { className?: string }) {
  return (
    <span className={`marked inline-flex h-[22px] items-center rounded-[4px] px-1.5 text-[12.5px] font-bold ${className}`}>
      New
    </span>
  );
}

/** A label-and-value pair in a fact line: small grey label, ink value. */
function Fact({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex min-w-0 items-baseline gap-1.5 ${className}`}>
      <dt className="shrink-0 text-[13.5px] text-ink-3">{label}</dt>
      <dd className="min-w-0 text-[14.5px] font-medium text-ink">{value}</dd>
    </div>
  );
}

/**
 * Each job is its own card, with space between cards, so the eye takes in one
 * job at a time instead of one long box of ruled rows. The border firms up on
 * hover, and a highlighter-yellow edge marks the card the pointer is on.
 */
export const JOB_CARD =
  "group relative overflow-hidden rounded-xl border border-rule bg-surface transition-[border-color,box-shadow] duration-150 hover:border-rule-2 hover:shadow-[0_10px_28px_-18px_rgb(20_22_28/0.35)] focus-within:border-ink";

/** The card's left edge: red while the job closes within a week (the same
 *  rule as the red countdown), otherwise a yellow edge that shows on hover. */
export function CardEdge({ closingDate, today }: { closingDate?: string | null; today?: string }) {
  const heat = heatFor(daysUntil(closingDate, today));
  const urgent = heat === "hot" || heat === "warm";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 left-0 w-1 transition-opacity duration-150 ${
        urgent ? "bg-hot" : "bg-mark opacity-0 group-hover:opacity-100"
      }`}
    />
  );
}

/**
 * One vacancy as a card: the countdown on the left, then title,
 * institution and a line of labelled facts, with the bookmark on the right.
 * The whole row is the link; the bookmark sits above it and stays separately
 * clickable. On phones the bookmark tucks under the countdown so the title
 * keeps its width.
 */
export function VacancyRow({
  v,
  isNew,
  terms,
  today,
}: {
  v: GovVacancy;
  isNew: boolean;
  terms?: string[];
  today?: string;
}) {
  return (
    <li className={vacancyRowClass(v)}>
      <VacancyRowBody v={v} isNew={isNew} terms={terms} today={today} />
    </li>
  );
}

/** The card's own box, for callers that supply an animated <li>. */
export function vacancyRowClass(v: GovVacancy) {
  return `${JOB_CARD} grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 px-4 py-5 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-6 ${
    v.status === "closed" ? "opacity-65" : ""
  }`;
}

/** Everything inside a vacancy row. */
export function VacancyRowBody({
  v,
  isNew,
  terms,
  today,
}: {
  v: GovVacancy;
  isNew: boolean;
  terms?: string[];
  /** The server's "today", when this renders inside a client component. */
  today?: string;
}) {
  const closing = v.dateEn ?? v.dateSi;

  const facts = [
    v.qualificationLevel && { label: "Needs", value: QUALIFICATION_LABEL[v.qualificationLevel] },
    v.age && { label: "Age", value: v.age },
    v.salary && { label: "Salary", value: salaryShort(v.salary)! },
    v.quota && { label: "Posts", value: v.quota },
    v.locations?.length && { label: "Where", value: v.locations.join(", ") },
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  const source =
    v.sourceKind === "gazette"
      ? v.gazetteNumber
        ? `Gazette No. ${v.gazetteNumber}`
        : "Government Gazette"
      : "Institution notice";

  return (
    <>
      <CardEdge closingDate={closing} today={today} />
      <div className="col-start-1 row-start-1">
        <Countdown closingDate={closing} today={today} />
      </div>

      <div className="col-start-2 row-span-2 row-start-1 min-w-0 sm:row-span-1">
        <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <Link
            href={`/government-jobs/${v.slug}`}
            className="title text-[19px] leading-snug text-ink decoration-mark decoration-[3px] underline-offset-[5px] after:absolute after:inset-0 after:content-[''] group-hover:underline sm:text-[20px]"
          >
            <Highlight text={v.titleEn} terms={terms} />
          </Link>
          {isNew && <NewTag />}
        </h3>
        {v.titleSi && (
          <p lang="si" className="text-[14.5px] text-ink-3">
            {v.titleSi}
          </p>
        )}
        <p className="mt-0.5 text-[15px] text-ink-2">
          <Highlight text={v.instEn} terms={terms} />
        </p>

        {(facts.length > 0 || source) && (
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {facts.map((f, i) => (
              // Phones get the two facts that decide relevance most.
              <Fact key={f.label} label={f.label} value={f.value} className={i >= 2 ? "hidden sm:flex" : ""} />
            ))}
            <Fact label="From" value={source} className="hidden sm:flex" />
          </dl>
        )}
      </div>

      <div className="col-start-1 row-start-2 mt-2 -ml-2.5 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:ml-0 sm:-mr-2">
        <SaveButton
          compact
          job={{ slug: v.slug, kind: "gov", title: v.titleEn, org: v.instEn, closingDate: closing ?? null }}
        />
      </div>
    </>
  );
}

/** A list of job cards, with room between them. */
export function JobList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <ul className={`space-y-3 ${className}`}>{children}</ul>;
}
