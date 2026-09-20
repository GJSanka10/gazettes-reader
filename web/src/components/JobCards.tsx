import Link from "next/link";
import type { GovVacancy, PrivateJob } from "@/lib/types";
import { JobStatusLabel } from "./JobStatus";

function MetaItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <span className="text-[13px] text-ink-soft">
      <span className="text-ink-faint">{label}: </span>
      {value}
    </span>
  );
}

/**
 * Spec §7 — government cards prioritise: title, institution, education,
 * location, closing date, gazette date. Formal/institutional register (§12):
 * squared corners, hairline rules, no shadow, serif title.
 */
export function GovJobCard({ vacancy }: { vacancy: GovVacancy }) {
  const closed = vacancy.status === "closed";
  return (
    <article
      className={`group relative border-b border-rule p-5 transition-colors hover:bg-surface-raised ${
        closed ? "opacity-75" : ""
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <JobStatusLabel status={vacancy.status} closingDate={vacancy.dateEn ?? vacancy.dateSi} />
        {vacancy.real && (
          <span className="font-mono text-[11px] uppercase tracking-wide text-verified">
            Verified against Gazette
          </span>
        )}
        {vacancy._needsReview && (
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Pending review
          </span>
        )}
      </div>

      <h3 className="font-display text-[20px] font-semibold leading-snug text-ink">
        <Link
          href={`/government-jobs/${vacancy.slug}`}
          className="cursor-pointer after:absolute after:inset-0 hover:underline underline-offset-2"
        >
          {vacancy.titleEn}
        </Link>
      </h3>
      <p className="mt-0.5 text-[15px] text-ink-soft">{vacancy.instEn}</p>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        <MetaItem label="Category" value={vacancy.category} />
        <MetaItem label="Age" value={vacancy.age} />
        <MetaItem label="Posts" value={vacancy.quota} />
        <MetaItem label="Closing" value={vacancy.dateEn} />
      </div>

      {vacancy.citation && (
        <p className="mt-3 font-mono text-[11px] text-ink-faint">{vacancy.citation}</p>
      )}
    </article>
  );
}

/**
 * Spec §11 — private cards prioritise: title, company, location, employment
 * type, experience, education, closing date. Slightly more contemporary
 * register than the gazette side (§12) while sharing every token.
 */
export function PrivateJobCard({ job }: { job: PrivateJob }) {
  return (
    <article className="group relative border-b border-rule p-5 transition-colors hover:bg-surface-raised">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <JobStatusLabel status={job.status} closingDate={job.closingDate} />
        {job._needsReview && (
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Pending review
          </span>
        )}
      </div>

      <h3 className="font-display text-[20px] font-semibold leading-snug text-ink">
        <Link
          href={`/private-jobs/${job.slug}`}
          className="cursor-pointer after:absolute after:inset-0 hover:underline underline-offset-2"
        >
          {job.titleEn}
        </Link>
      </h3>
      <p className="mt-0.5 text-[15px] text-ink-soft">{job.employerName}</p>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        <MetaItem label="Location" value={job.location} />
        <MetaItem label="Type" value={job.employmentType} />
        <MetaItem label="Sector" value={job.sector} />
        <MetaItem label="Salary" value={job.salary ?? undefined} />
      </div>
    </article>
  );
}

/** Spec §19 + §52 + §53: real pagination that preserves query state. */
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

  const window = 2;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= window,
  );

  const boxClass =
    "inline-flex min-h-[44px] min-w-[44px] items-center justify-center border px-3 text-[14px]";

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={`${boxClass} cursor-pointer border-rule-strong text-ink`}>
          ← Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${boxClass} border-rule text-ink-faint`}>
          ← Previous
        </span>
      )}

      <ol className="hidden items-center gap-1 sm:flex">
        {pages.map((p, i) => {
          const gap = i > 0 && p - pages[i - 1] > 1;
          return (
            <li key={p} className="flex items-center gap-1">
              {gap && <span className="px-1 text-ink-faint">…</span>}
              {p === page ? (
                <span aria-current="page" className={`${boxClass} border-ink bg-ink font-bold text-surface-raised`}>
                  {p}
                </span>
              ) : (
                <Link href={makeHref(p)} className={`${boxClass} cursor-pointer border-rule text-ink`}>
                  {p}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <span className="text-[13px] text-ink-soft sm:hidden">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={`${boxClass} cursor-pointer border-rule-strong text-ink`}>
          Next →
        </Link>
      ) : (
        <span aria-disabled="true" className={`${boxClass} border-rule text-ink-faint`}>
          Next →
        </span>
      )}
    </nav>
  );
}
