import Link from "next/link";
import type { GovVacancy, PrivateJob } from "@/lib/types";
import { daysUntil, heatFor, parseClosingDate, shortDate } from "@/lib/dates";
import { QUALIFICATION_LABEL } from "@/lib/labels";
import { Countdown, DeadlinePill, SourceBadge } from "./JobStatus";
import { Highlight, NewTag, sourceText } from "./Feed";
import { Icon } from "./Icon";
import { SaveButton } from "./SaveButton";

function monogram(name: string): string {
  const words = name.replace(/\(.*?\)/g, "").split(/[\s-]+/).filter(Boolean);
  // Acronym-led names ("IFS", "LSEG Business…") keep the acronym itself.
  return words[0] && words[0].length <= 4 && words[0] === words[0].toUpperCase()
    ? words[0].slice(0, 3)
    : words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function prettySector(s?: string | null) {
  if (!s) return null;
  return s === "other" ? "Other sectors" : s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * A private posting on the sheet, laid out like a government row. Most carry
 * no closing date, so the countdown column shows the employer's monogram
 * instead and says there's no date, rather than inventing urgency.
 */
export function PrivateJobRow({ job: j, terms }: { job: PrivateJob; terms?: string[] }) {
  const posted = parseClosingDate(j.datePosted);
  const facts = [
    j.location && { label: "Where", value: j.location.replace(", Sri Lanka", "") },
    j.employmentType && { label: "Type", value: j.employmentType.replace("Full time", "Full-time") },
    prettySector(j.sector) && { label: "Sector", value: prettySector(j.sector)! },
    j.salary && { label: "Salary", value: j.salary },
    posted && { label: "Posted", value: shortDate(posted) },
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  return (
    <li className="group relative grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 px-4 py-5 transition-colors hover:bg-paper/70 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-6">
      <div className="col-start-1 row-start-1">
        <Countdown closingDate={j.closingDate} fallback={monogram(j.employerName)} />
      </div>
      <div className="col-start-2 row-span-2 row-start-1 min-w-0 sm:row-span-1">
        <h3>
          <Link
            href={`/private-jobs/${j.slug}`}
            className="title text-[19px] leading-snug text-ink decoration-mark decoration-[3px] underline-offset-[5px] after:absolute after:inset-0 after:content-[''] group-hover:underline sm:text-[20px]"
          >
            <Highlight text={j.titleEn} terms={terms} />
          </Link>
        </h3>
        <p className="mt-0.5 text-[15px] text-ink-2">
          <Highlight text={j.employerName} terms={terms} />
        </p>
        {facts.length > 0 && (
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {facts.map((f, i) => (
              <div key={f.label} className={`flex min-w-0 items-baseline gap-1.5 ${i >= 2 ? "hidden sm:flex" : ""}`}>
                <dt className="shrink-0 text-[13.5px] text-ink-3">{f.label}</dt>
                <dd className="min-w-0 text-[14.5px] font-medium text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="col-start-1 row-start-2 mt-2 -ml-2.5 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:ml-0 sm:-mr-2">
        <SaveButton
          compact
          job={{ slug: j.slug, kind: "pvt", title: j.titleEn, org: j.employerName, closingDate: j.closingDate ?? null }}
        />
      </div>
    </li>
  );
}

/**
 * A government vacancy as a structured summary: the preview a reader needs to
 * decide whether to open the notice at all. Key terms sit in a ruled strip;
 * anything the notice didn't state says so instead of disappearing.
 */
export function SummaryCard({ vacancy: v, isNew, terms }: { vacancy: GovVacancy; isNew: boolean; terms?: string[] }) {
  const closing = v.dateEn ?? v.dateSi;
  const date = parseClosingDate(closing);
  const heat = heatFor(daysUntil(closing));
  const closed = heat === "past";

  const terms4 = [
    { label: "Closes", value: date ? shortDate(date) : null, hot: heat === "hot" || heat === "warm" },
    { label: "Salary", value: v.salary, hot: false },
    { label: "Age", value: v.age, hot: false },
    { label: "Posts", value: v.quota, hot: false },
  ];

  return (
    <li className={`group relative flex flex-col rounded-2xl border border-rule bg-surface p-5 transition-colors hover:border-rule-2 sm:p-6 ${closed ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-[13px] text-ink-3">{sourceText(v)}</p>
        <div className="-mr-2 -mt-1.5 shrink-0">
          <SaveButton
            compact
            job={{ slug: v.slug, kind: "gov", title: v.titleEn, org: v.instEn, closingDate: closing ?? null }}
          />
        </div>
      </div>

      <h3 className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <Link
          href={`/government-jobs/${v.slug}`}
          className="title text-[22px] leading-tight text-ink decoration-mark decoration-[3px] underline-offset-[5px] after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:underline"
        >
          <Highlight text={v.titleEn} terms={terms} />
        </Link>
        {isNew && <NewTag />}
      </h3>
      {v.titleSi && (
        <p lang="si" className="text-[15px] text-ink-3">
          {v.titleSi}
        </p>
      )}
      <p className="mt-0.5 text-[15px] text-ink-2">
        <Highlight text={v.instEn} terms={terms} />
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-4">
        {terms4.map((f) => (
          <div key={f.label} className="bg-surface px-3 py-2.5">
            <dt className="text-[13px] text-ink-3">{f.label}</dt>
            <dd
              className={`mt-0.5 text-[14.5px] leading-snug ${
                f.value ? `font-semibold ${f.hot ? "text-hot" : "text-ink"}` : "text-ink-3"
              }`}
            >
              {f.value ?? "See notice"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 text-[15px] leading-relaxed text-ink-2">
        <p className="line-clamp-3">
          <span className="font-semibold text-ink">
            {v.qualificationLevel ? `Needs ${QUALIFICATION_LABEL[v.qualificationLevel]}. ` : "Qualifications. "}
          </span>
          {v.qualEn ?? "Not captured here; read them in the notice."}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-5">
        <DeadlinePill closingDate={closing} />
        <SourceBadge verified={v.real && !v._needsReview} sourceKind={v.sourceKind} />
      </div>
    </li>
  );
}

/** A labelled run of listings. Groups exist only when they carry meaning
 *  (closing-date bands), so the heading says what binds them. */
export function RowGroup({
  title,
  count,
  grid = false,
  children,
}: {
  title?: string;
  count?: number;
  /** Summary cards in a grid instead of rows on a sheet. */
  grid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title ?? "Listings"}>
      {title && (
        <h2 className="mb-3 flex items-baseline gap-2.5 text-[17px] font-bold text-ink">
          {title}
          {count !== undefined && <span className="nums text-[15px] font-medium text-ink-3">{count}</span>}
        </h2>
      )}
      {grid ? (
        <ul className="grid gap-4 lg:grid-cols-2">{children}</ul>
      ) : (
        <ul className="divide-y divide-rule overflow-hidden rounded-2xl border border-rule bg-surface">{children}</ul>
      )}
    </section>
  );
}

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  const base = "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-md px-4 text-[15px] font-semibold";

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={`${base} border border-rule-2 bg-surface text-ink hover:border-ink`}>
          <Icon name="chevron_left" className="text-[20px]" /> Previous
        </Link>
      ) : (
        <span />
      )}
      <ol className="flex items-center gap-1">
        {pages.map((p, i) => (
          <li key={p} className="flex items-center gap-1">
            {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-ink-3">…</span>}
            {p === page ? (
              <span aria-current="page" className={`${base} nums bg-mark px-0 text-on-mark`}>
                {p}
              </span>
            ) : (
              <Link href={makeHref(p)} className={`${base} nums px-0 text-ink-2 hover:bg-sunk`}>
                {p}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={`${base} border border-rule-2 bg-surface text-ink hover:border-ink`}>
          Next <Icon name="chevron_right" className="text-[20px]" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
