import Link from "next/link";
import type { GovVacancy } from "@/lib/types";
import { parseClosingDate, shortDate } from "@/lib/dates";
import { QUALIFICATION_LABEL } from "@/lib/labels";
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
 * One vacancy as a row on the sheet: the countdown on the left, then title,
 * institution and a line of labelled facts, with the bookmark on the right.
 * The whole row is the link; the bookmark sits above it and stays separately
 * clickable. On phones the bookmark tucks under the countdown so the title
 * keeps its width.
 */
export function VacancyRow({ v, isNew, terms }: { v: GovVacancy; isNew: boolean; terms?: string[] }) {
  return (
    <li className={vacancyRowClass(v)}>
      <VacancyRowBody v={v} isNew={isNew} terms={terms} />
    </li>
  );
}

/** The row's own box, for callers that supply an animated <li>. */
export function vacancyRowClass(v: GovVacancy) {
  return `group relative grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 px-4 py-5 transition-colors hover:bg-paper/70 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-6 ${
    v.status === "closed" ? "opacity-65" : ""
  }`;
}

/** Everything inside a vacancy row. */
export function VacancyRowBody({ v, isNew, terms }: { v: GovVacancy; isNew: boolean; terms?: string[] }) {
  const closing = v.dateEn ?? v.dateSi;

  const facts = [
    v.qualificationLevel && { label: "Needs", value: QUALIFICATION_LABEL[v.qualificationLevel] },
    v.age && { label: "Age", value: v.age },
    v.salary && { label: "Salary", value: v.salary },
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
      <div className="col-start-1 row-start-1">
        <Countdown closingDate={closing} />
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

/** A white sheet on the paper desk: the one container listings sit in. */
export function Sheet({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={`divide-y divide-rule overflow-hidden rounded-2xl border border-rule bg-surface ${className}`}>
      {children}
    </ul>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The dateline at the head of the homepage: the current Gazette edition when
 * we hold one, otherwise the site's latest update, labelled as exactly that and
 * never dressed up as an edition we don't have.
 */
export function LatestBlock({
  issue,
  updatedAt,
  total,
  newCount,
  closingThisWeek,
}: {
  issue: { number: string | null; date: string; count: number } | null;
  updatedAt: string | null;
  total: number;
  newCount: number;
  closingThisWeek: number;
}) {
  const date = issue ? parseClosingDate(issue.date) : updatedAt ? new Date(updatedAt) : null;

  return (
    <section aria-labelledby="latest-title" className="flex gap-5">
      {date && (
        <p aria-hidden="true" className="flex shrink-0 flex-col items-center self-start rounded-xl bg-ink px-3.5 pb-2.5 pt-3 text-paper sm:px-4 sm:pb-3 sm:pt-3.5">
          <span className="text-[13px] font-semibold">{MONTHS[date.getMonth()]}</span>
          <span className="count text-[46px] sm:text-[58px]">{date.getDate()}</span>
          <span className="nums text-[13px] text-paper/70">{date.getFullYear()}</span>
        </p>
      )}
      <div className="min-w-0">
        <h2 id="latest-title" className="text-[15px] font-bold text-ink">
          {issue ? `Latest Gazette${issue.number ? `, No. ${issue.number}` : ""}` : "Latest update"}
          {date && (
            <span className="sr-only">
              {" "}
              {date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </h2>
        {date && (
          <p className="text-[14px] text-ink-3">{date.toLocaleDateString("en-GB", { weekday: "long" })}</p>
        )}
        <ul className="mt-2.5 space-y-0.5 text-[15px] leading-snug text-ink-2">
          <li>
            <strong className="nums font-bold text-ink">{issue ? issue.count : total}</strong>{" "}
            {issue
              ? `${issue.count === 1 ? "vacancy" : "vacancies"} in this issue`
              : `open government ${total === 1 ? "vacancy" : "vacancies"}`}
          </li>
          {newCount > 0 && (
            <li>
              <strong className="nums font-bold text-ink">{newCount}</strong> new this week
            </li>
          )}
          {closingThisWeek > 0 && (
            <li>
              <strong className="nums font-bold text-hot">{closingThisWeek}</strong> closing within 7 days
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
