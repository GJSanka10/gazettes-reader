import Link from "next/link";
import type { GovVacancy, PrivateJob } from "@/lib/types";
import { JobStatusLabel } from "./JobStatus";
import { Icon } from "./Icon";

/** No real photography exists for these listings, so instead of a stock
 *  image we use a real, meaningful signal — a category/sector icon — in the
 *  same left-column position a photo would occupy. */
function iconForCategory(category?: string | null): string {
  const c = (category ?? "").toLowerCase();
  if (c.includes("agricult")) return "agriculture";
  if (c.includes("educat") || c.includes("language")) return "school";
  if (c.includes("engineer") || c.includes("technical")) return "engineering";
  if (c.includes("ict") || c.includes("technology")) return "computer";
  if (c.includes("security")) return "shield";
  if (c.includes("health") || c.includes("medical")) return "medical_services";
  if (c.includes("legal") || c.includes("justice")) return "gavel";
  return "account_balance";
}

function iconForSector(sector?: string | null): string {
  const s = (sector ?? "").toLowerCase();
  if (s.includes("tech")) return "computer";
  return "business_center";
}

function IconPanel({ icon }: { icon: string }) {
  return (
    <div
      aria-hidden="true"
      className="hidden w-[104px] shrink-0 items-center justify-center border-r border-rule bg-surface-sunken sm:flex"
    >
      <Icon name={icon} className="text-[36px] text-ink-faint" />
    </div>
  );
}

function FactGrid({ items }: { items: { label: string; value?: string | null }[] }) {
  const cells = items.filter((i) => i.value);
  if (cells.length === 0) return null;
  return (
    <div className="font-ui mt-3 grid grid-cols-2 gap-2 border-t border-rule pt-3 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label}>
          <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-faint">
            {c.label}
          </span>
          <span className="font-mono text-[13px] font-semibold text-ink">{c.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Category Badge: a solid gold-fill tag, matching the mockup's badge
 *  style. Gold is reserved for prestige/official marks. */
function CategoryBadge({ category }: { category?: string | null }) {
  if (!category) return null;
  return (
    <span className="font-ui inline-block bg-accent-wash px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
      {category}
    </span>
  );
}

/**
 * Spec — government cards are the "Public Tender / Gazette Card" archetype:
 * a filled muted surface, hairline border, prominent deadline badge and
 * official reference IDs. `featured` renders the "Lead Story" treatment
 * (larger headline, thin gold rule) instead, and only ever for a genuinely
 * urgent real listing — never a decorative slot.
 */
export function GovJobCard({
  vacancy,
  featured = false,
}: {
  vacancy: GovVacancy;
  featured?: boolean;
}) {
  const closed = vacancy.status === "closed";

  const icon = iconForCategory(vacancy.category);

  if (featured) {
    return (
      <article className={`relative flex border border-ink bg-surface-raised ${closed ? "opacity-75" : ""}`}>
        <IconPanel icon={icon} />
        <div className="min-w-0 flex-1 p-5">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <JobStatusLabel status={vacancy.status} closingDate={vacancy.dateEn ?? vacancy.dateSi} />
            <CategoryBadge category={vacancy.category} />
          </div>
          <div className="font-ui flex items-baseline justify-between gap-3 text-[12px] text-ink-faint">
            <span className="truncate">{vacancy.instEn}</span>
            {vacancy.page && <span className="shrink-0 font-mono">{vacancy.page}</span>}
          </div>
          <h3 className="mt-1 font-display text-[26px] font-semibold leading-tight text-ink">
            <Link
              href={`/government-jobs/${vacancy.slug}`}
              className="cursor-pointer after:absolute after:inset-0 hover:underline underline-offset-2"
            >
              {vacancy.titleEn}
            </Link>
          </h3>
          <div aria-hidden="true" className="mt-3 h-0.5 w-14 bg-accent" />
          {vacancy.titleSi && (
            <p lang="si" className="si-body mt-2 font-[family-name:var(--font-siserif)] text-[15px] text-ink-soft">
              {vacancy.titleSi}
            </p>
          )}
          <FactGrid
            items={[
              { label: "Age limit", value: vacancy.age },
              { label: "Vacancies", value: vacancy.quota },
              { label: "Salary", value: vacancy.salary },
            ]}
          />
          {vacancy.real && (
            <span className="font-ui mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-verified">
              <Icon name="verified" className="text-[13px]" />
              Verified against Gazette
            </span>
          )}
          {vacancy.citation && <p className="citation-box mt-3 inline-block">{vacancy.citation}</p>}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative flex border border-rule bg-surface-sunken transition-colors hover:border-rule-strong ${
        closed ? "opacity-75" : ""
      }`}
    >
      <IconPanel icon={icon} />
      <div className="min-w-0 flex-1 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <JobStatusLabel status={vacancy.status} closingDate={vacancy.dateEn ?? vacancy.dateSi} />
          <CategoryBadge category={vacancy.category} />
          {vacancy.real && (
            <span className="font-ui inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-verified">
              <Icon name="verified" className="text-[13px]" />
              Verified against Gazette
            </span>
          )}
          {vacancy._needsReview && (
            <span className="font-ui text-[11px] uppercase tracking-wide text-ink-faint">
              Pending review
            </span>
          )}
        </div>

        <div className="font-ui flex items-baseline justify-between gap-3 text-[12px] text-ink-faint">
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
            { label: "Age limit", value: vacancy.age },
            { label: "Vacancies", value: vacancy.quota },
            { label: "Salary", value: vacancy.salary },
          ]}
        />

        {vacancy.citation && <p className="citation-box mt-3 inline-block">{vacancy.citation}</p>}
      </div>
    </article>
  );
}

/**
 * Private-sector cards stay on the plain editorial hairline pattern (no
 * filled surface) — they aren't gazette/tender notices, so they don't earn
 * the "Public Tender / Gazette Card" treatment reserved for official ones.
 */
export function PrivateJobCard({ job }: { job: PrivateJob }) {
  return (
    <article className="group relative flex border-b border-rule transition-colors hover:bg-surface-sunken">
      <IconPanel icon={iconForSector(job.sector)} />
      <div className="min-w-0 flex-1 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <JobStatusLabel status={job.status} closingDate={job.closingDate} />
          {job._needsReview && (
            <span className="font-ui text-[11px] uppercase tracking-wide text-ink-faint">
              Pending review
            </span>
          )}
        </div>

        <p className="font-ui text-[12px] text-ink-faint">{job.employerName}</p>

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
    "font-ui inline-flex min-h-[44px] min-w-[44px] items-center justify-center border px-3 text-[13px] font-semibold";

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={`${boxClass} cursor-pointer gap-1 border-ink text-ink hover:bg-surface-sunken`}>
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
              {gap && <span className="font-ui text-ink-faint">…</span>}
              {p === page ? (
                <span aria-current="page" className={`${boxClass} border-ink bg-ink text-surface-raised`}>
                  {p}
                </span>
              ) : (
                <Link href={makeHref(p)} className={`${boxClass} cursor-pointer border-rule text-ink hover:border-ink`}>
                  {p}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <span className="font-ui text-[13px] text-ink-soft sm:hidden">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={`${boxClass} cursor-pointer gap-1 border-ink text-ink hover:bg-surface-sunken`}>
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
