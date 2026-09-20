import { Breadcrumb, EmptyState, ErrorState } from "@/components/Chrome";
import { FilterBar } from "@/components/FilterBar";
import { GovJobCard, Pagination } from "@/components/JobCards";
import { daysUntil, facetValues, getGovVacancies } from "@/lib/jobs";
import type { GovVacancy, SearchParamsShape } from "@/lib/types";
import Link from "next/link";

const PER_PAGE = 10;

export const metadata = {
  title: "Government Gazette Jobs — The Living Gazette",
  description:
    "The latest Sri Lankan government vacancies published through official Gazette notifications.",
};

function matches(v: GovVacancy, q: string) {
  const haystack = [v.titleEn, v.instEn, v.category, v.tag, v.qualEn, v.descEn, v.citation]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  // Spec §32: every whitespace-separated term must appear somewhere, so
  // "software eng" still finds "Senior Software Engineer".
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default async function GovernmentJobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const sp = await searchParams;
  const all = getGovVacancies();

  if (!all) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
        <ErrorState what="government jobs" />
      </div>
    );
  }

  let results = all;
  if (sp.search) results = results.filter((v) => matches(v, sp.search!));
  if (sp.category) results = results.filter((v) => v.category === sp.category);
  if (sp.institution) results = results.filter((v) => v.instEn === sp.institution);

  if (sp.closing) {
    const limit = Number(sp.closing);
    results = results.filter((v) => {
      const d = daysUntil(v.dateEn ?? v.dateSi);
      return d !== null && d >= 0 && d <= limit;
    });
  }

  const sort = sp.sort ?? "closing";
  results = [...results].sort((a, b) => {
    if (sort === "closing") {
      // Closed last, then soonest deadline first, then undated.
      const aClosed = a.status === "closed" ? 1 : 0;
      const bClosed = b.status === "closed" ? 1 : 0;
      if (aClosed !== bClosed) return aClosed - bClosed;
      const da = daysUntil(a.dateEn ?? a.dateSi);
      const db = daysUntil(b.dateEn ?? b.dateSi);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    }
    return (a.serial ?? "").localeCompare(b.serial ?? "");
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
    return qs ? `/government-jobs?${qs}` : "/government-jobs";
  };

  const hasFilters = Boolean(sp.search || sp.category || sp.institution || sp.closing);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: "Government Gazette Jobs" }]} />

      <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-ink md:text-[36px]">
        Government Gazette Jobs
      </h1>
      <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-ink-soft">
        Find the latest government vacancies published through official Gazette notifications.
      </p>
      <p className="mt-4 max-w-[70ch] border-l-2 border-stamp bg-stamp-wash px-4 py-3 text-[14px] leading-relaxed text-ink">
        Always check the original Gazette notice for official requirements, deadlines and
        application instructions.
      </p>

      <div className="mt-6">
        <FilterBar
          placeholder="Search government jobs..."
          resultCount={results.length}
          facets={[
            { key: "category", label: "Category", options: facetValues(all, (v) => v.category) },
            {
              key: "institution",
              label: "Institution",
              options: facetValues(all, (v) => v.instEn),
            },
            { key: "closing", label: "Closing within", options: ["7", "14", "30"] },
          ]}
          sorts={[
            { value: "closing", label: "Closing soon" },
            { value: "serial", label: "Gazette order" },
          ]}
        />
      </div>

      <div className="mt-6">
        {pageItems.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No matching jobs" : "No government jobs available"}
            body={
              hasFilters
                ? `We couldn't find a Gazette vacancy matching your search. Try another keyword or remove some filters.`
                : "There are currently no Gazette vacancies in the register."
            }
            action={
              hasFilters ? (
                <Link
                  href="/government-jobs"
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
              {pageItems.map((v) => (
                <GovJobCard key={v.slug} vacancy={v} />
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} makeHref={makeHref} />
          </>
        )}
      </div>
    </div>
  );
}
