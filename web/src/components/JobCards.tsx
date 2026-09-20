import Link from "next/link";
import type { GovVacancy, PrivateJob } from "@/lib/types";
import { JobStatusLabel } from "./JobStatus";
import { Icon } from "./Icon";

function FactGrid({ items }: { items: { label: string; value?: string | null }[] }) {
  const cells = items.filter((i) => i.value);
  if (cells.length === 0) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 border border-rule bg-surface-sunken p-2.5 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label}>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            {c.label}
          </span>
          <span className="text-[13px] font-semibold text-ink">{c.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Spec §7 — government cards prioritise: title, institution, education,
 * location, closing date, gazette date. `featured` is only ever true for a
 * genuinely urgent real listing (see getMostUrgentGovVacancy-style logic in
 * the listing page) — never a decorative "lead story" slot.
 */
export function GovJobCard({
  vacancy,
  featured = false,
}: {
  vacancy: GovVacancy;
  featured?: boolean;
}) {
  const closed = vacancy.status === "closed";
  return (
    <article
      className={`group relative border-b border-rule p-5 transition-colors hover:bg-surface-sunken ${
        closed ? "opacity-75" : ""
      } ${featured ? "border-2 border-ink bg-surface-raised" : ""}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-3">
        {featured && (
          <span className="inline-flex items-center bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-surface-raised">
            Most urgent
          </span>
        )}
        <JobStatusLabel status={vacancy.status} closingDate={vacancy.dateEn ?? vacancy.dateSi} />
        {vacancy.real && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-verified">
            <Icon name="verified" className="text-[13px]" />
            Verified against Gazette
          </span>
        )}
        {vacancy._needsReview && (
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Pending review
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3 text-[12px] text-ink-faint">
        <span className="truncate">{vacancy.instEn}</span>
        {vacancy.page && <span className="shrink-0 font-mono">{vacancy.page}</span>}
      </div>

      <h3 className="mt-0.5 font-display text-[20px] font-semibold leading-snug text-ink">
        <Link
          href={`/government-jobs/${vacancy.slug}`}
          className="cursor-pointer after:absolute after:inset-0 hover:underline underline-offset-2"
        >
          {vacancy.titleEn}
        </Link>
      </h3>
      {vacancy.titleSi && (
        <p lang="si" className="si-body mt-0.5 font-[family-name:var(--font-siserif)] text-[14px] text-ink-soft">
          {vacancy.titleSi}
        </p>
      )}

      <FactGrid
        items={[
          { label: "Category", value: vacancy.category },
          { label: "Age limit", value: vacancy.age },
          { label: "Vacancies", value: vacancy.quota },
          { label: "Salary", value: vacancy.salary },
        ]}
      />

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
    <article className="group relative border-b border-rule p-5 transition-colors hover:bg-surface-sunken">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <JobStatusLabel status={job.status} closingDate={job.closingDate} />
        {job._needsReview && (
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Pending review
          </span>
        )}
      </div>

      <p className="text-[12px] text-ink-faint">{job.employerName}</p>

      <h3 className="mt-0.5 font-display text-[20px] font-semibold leading-snug text-ink">
        <Link
          href={`/private-jobs/${job.slug}`}
          className="cursor-pointer after:absolute after:inset-0 hover:underline underline-offset-2"
        >
          {job.titleEn}
        </Link>
      </h3>

      <FactGrid
        items={[
          { label: "Location", value: job.location },
          { label: "Type", value: job.employmentType },
          { label: "Sector", value: job.sector },
          { label: "Salary", value: job.salary },
        ]}
      />
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
        <Link href={makeHref(page - 1)} className={`${boxClass} cursor-pointer gap-1 border-rule-strong text-ink`}>
          <Icon name="arrow_back" className="text-[16px]" /> Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${boxClass} gap-1 border-rule text-ink-faint`}>
          <Icon name="arrow_back" className="text-[16px]" /> Previous
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
        <Link href={makeHref(page + 1)} className={`${boxClass} cursor-pointer gap-1 border-rule-strong text-ink`}>
          Next <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${boxClass} gap-1 border-rule text-ink-faint`}>
          Next <Icon name="arrow_forward" className="text-[16px]" />
        </span>
      )}
    </nav>
  );
}
