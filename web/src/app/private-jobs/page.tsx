import { Breadcrumb, EmptyState, ErrorState } from "@/components/Chrome";
import { FilterBar } from "@/components/FilterBar";
import { Pagination, PrivateJobCard } from "@/components/JobCards";
import { daysUntil, facetValues, getPrivateJobs } from "@/lib/jobs";
import type { PrivateJob, SearchParamsShape } from "@/lib/types";
import Link from "next/link";

const PER_PAGE = 10;

export const metadata = {
  title: "Private Sector Jobs — The Living Gazette",
  description:
    "Current job opportunities from companies and organisations across Sri Lanka.",
};

function matches(j: PrivateJob, q: string) {
  const haystack = [j.titleEn, j.employerName, j.location, j.sector, j.employmentType, j.qualEn, j.descEn]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default async function PrivateJobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const sp = await searchParams;
  const all = getPrivateJobs();

  if (!all) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
        <ErrorState what="private-sector jobs" />
      </div>
    );
  }

  let results = all;
  if (sp.search) results = results.filter((j) => matches(j, sp.search!));
  if (sp.sector) results = results.filter((j) => j.sector === sp.sector);
  if (sp.institution) results = results.filter((j) => j.employerName === sp.institution);
  if (sp.location) results = results.filter((j) => j.location === sp.location);
  if (sp.employment) results = results.filter((j) => j.employmentType === sp.employment);

  const sort = sp.sort ?? "posted";
  results = [...results].sort((a, b) => {
    if (sort === "closing") {
      // Most private postings carry no closing date at all (job.md §11.5);
      // undated entries sort last rather than being dropped or faked.
      const da = daysUntil(a.closingDate);
      const db = daysUntil(b.closingDate);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    }
    if (sort === "employer") return a.employerName.localeCompare(b.employerName);
    const pa = a.datePosted ? Date.parse(a.datePosted) : 0;
    const pb = b.datePosted ? Date.parse(b.datePosted) : 0;
    return pb - pa;
  });

  const page = Math.max(1, Number(sp.page) || 1);
  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = results.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const makeHref = (p: number) => {
    const next = new URLSearchParams(
      Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][],
    );
    if (p > 1) next.set("page", String(p));
    else next.delete("page");
    const qs = next.toString();
    return qs ? `/private-jobs?${qs}` : "/private-jobs";
  };

  const datedCount = all.filter((j) => j.closingDate).length;
  const hasFilters = Boolean(
    sp.search || sp.sector || sp.institution || sp.location || sp.employment,
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: "Private Sector Jobs" }]} />

      <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-ink md:text-[36px]">
        Private Sector Jobs
      </h1>
      <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-ink-soft">
        Discover current job opportunities from companies and organisations across Sri Lanka.
      </p>
      <p className="mt-4 max-w-[70ch] border-l-2 border-rule-strong px-4 py-3 text-[14px] leading-relaxed text-ink-soft">
        Collected from employers&rsquo; own career sites. Only {datedCount} of {all.length}{" "}
        listings publish a closing date — most private employers don&rsquo;t, so these are
        ordered by date posted rather than deadline.
      </p>

      <div className="mt-6">
        <FilterBar
          placeholder="Search private-sector jobs..."
          resultCount={results.length}
          facets={[
            { key: "sector", label: "Sector", options: facetValues(all, (j) => j.sector) },
            {
              key: "institution",
              label: "Company",
              options: facetValues(all, (j) => j.employerName),
            },
            { key: "location", label: "Location", options: facetValues(all, (j) => j.location) },
            {
              key: "employment",
              label: "Employment type",
              options: facetValues(all, (j) => j.employmentType),
            },
          ]}
          sorts={[
            { value: "posted", label: "Newest" },
            { value: "closing", label: "Closing soon" },
            { value: "employer", label: "Company (A–Z)" },
          ]}
        />
      </div>

      <div className="mt-6">
        {pageItems.length === 0 ? (
          <EmptyState
            title="No matching jobs"
            body="We couldn't find a private-sector job matching your search. Try another keyword or remove some filters."
            action={
              hasFilters ? (
                <Link
                  href="/private-jobs"
                  className="inline-flex min-h-[44px] cursor-pointer items-center border border-ink px-4 text-[14px] font-bold text-ink"
                >
                  Clear filters
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            <div className="border-t border-rule bg-surface-raised">
              {pageItems.map((j) => (
                <PrivateJobCard key={j.slug} job={j} />
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} makeHref={makeHref} />
          </>
        )}
      </div>
    </div>
  );
}
