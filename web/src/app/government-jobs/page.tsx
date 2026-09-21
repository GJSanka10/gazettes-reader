import { Breadcrumb, EmptyState, ErrorState } from "@/components/Chrome";
import { FeedControls, FilterBar } from "@/components/FilterBar";
import { GovJobCard, Pagination } from "@/components/JobCards";
import { Icon } from "@/components/Icon";
import { daysUntil, facetCounts, getGovVacancies, matchesAnyParam } from "@/lib/jobs";
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
  if (sp.category) results = results.filter((v) => matchesAnyParam(v.category, sp.category));
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

  // Real ledger stats — never invented (job.md). Computed from the actual
  // dataset, not the filtered/paginated result set.
  const institutionCount = new Set(all.map((v) => v.instEn).filter(Boolean)).size;
  const closingSoonCount = all.filter((v) => {
    const d = daysUntil(v.dateEn ?? v.dateSi);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  const closingCounts = [7, 14, 30].map((limit) => ({
    value: String(limit),
    count: all.filter((v) => {
      const d = daysUntil(v.dateEn ?? v.dateSi);
      return d !== null && d >= 0 && d <= limit;
    }).length,
  }));

  const facets = [
    {
      key: "category",
      label: "Category",
      options: facetCounts(all, (v) => v.category),
      multi: true,
    },
    {
      key: "institution",
      label: "Institution",
      options: facetCounts(all, (v) => v.instEn),
    },
    { key: "closing", label: "Closing within", options: closingCounts },
  ];

  // The "Most urgent" lead treatment only ever applies to a genuinely urgent
  // real listing at the top of the default, unfiltered, first page.
  const showFeatured =
    !hasFilters && safePage === 1 && sort === "closing" && pageItems.length > 0;
  const featuredDays = showFeatured ? daysUntil(pageItems[0].dateEn ?? pageItems[0].dateSi) : null;
  const isFeatured = showFeatured && featuredDays !== null && featuredDays <= 2;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5 md:px-8">
      <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: "Government Gazette Jobs" }]} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-[32px] tracking-tight text-ink md:text-[34px] md:leading-[40px]">
            Government Gazette Jobs
          </h1>
          <p className="mt-1.5 max-w-[62ch] text-[15px] leading-[23px] text-ink-soft">
            Find the latest government vacancies published through official Gazette
            notifications, summarised and cross-linked to the original document.
          </p>
          <p className="mt-2.5 max-w-[62ch] border-l-2 border-stamp bg-stamp-wash px-3 py-2 text-[13px] leading-relaxed text-ink">
            Always check the original Gazette notice for official requirements, deadlines and
            application instructions.
          </p>
        </div>

        {/* Real ledger stats — no invented "current edition" number or file. */}
        <div className="border border-rule-strong bg-surface-raised">
          <div className="flex items-center justify-between border-b-2 border-ink bg-surface-sunken px-3 py-2">
            <span className="font-ui text-[12px] font-bold uppercase tracking-wide text-ink">
              Gazette Register
            </span>
            <Icon name="verified" className="text-[16px] text-accent" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            <div className="border-r border-rule pr-2">
              <div className="font-mono text-[20px] font-bold leading-none text-ink">{all.length}</div>
              <div className="font-ui mt-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-faint">
                Total posts
              </div>
            </div>
            <div className="border-r border-rule pr-2">
              <div className="font-mono text-[20px] font-bold leading-none text-ink">{institutionCount}</div>
              <div className="font-ui mt-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-faint">
                Institutions
              </div>
            </div>
            <div>
              {/* Crimson: an urgency stat, not a prestige one. */}
              <div className="font-mono text-[20px] font-bold leading-none text-stamp">{closingSoonCount}</div>
              <div className="font-ui mt-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-faint">
                &lt;7d close
              </div>
            </div>
          </div>
          <a
            href="https://documents.gov.lk/web/gazettes"
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui flex min-h-[44px] items-center justify-center gap-1.5 border-t border-rule-strong bg-ink px-4 text-[12px] font-semibold uppercase tracking-wide text-surface-raised hover:bg-[#163a5f]"
          >
            <Icon name="folder_open" className="text-[16px]" />
            Browse official Gazette archive
          </a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-5 lg:gap-7">
        <FilterBar placeholder="Search government jobs..." facets={facets} />

        <div className="col-span-12 space-y-3 lg:col-span-8 xl:col-span-9">
          <FeedControls
            facets={facets}
            resultCount={results.length}
            sorts={[
              { value: "closing", label: "Closing soon" },
              { value: "serial", label: "Gazette order" },
            ]}
          />

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
                    className="font-ui inline-flex min-h-[44px] cursor-pointer items-center border border-ink px-6 text-[13px] font-semibold uppercase tracking-wide text-ink hover:bg-surface-sunken"
                  >
                    Clear filters
                  </Link>
                ) : null
              }
            />
          ) : (
            <>
              <div className="space-y-2">
                {pageItems.map((v, i) => (
                  <GovJobCard key={v.slug} vacancy={v} featured={isFeatured && i === 0} />
                ))}
              </div>
              <Pagination page={safePage} totalPages={totalPages} makeHref={makeHref} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
