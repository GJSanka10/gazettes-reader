import type { Metadata } from "next";
import Link from "next/link";
import { ErrorState, PageIntro, buttonClass } from "@/components/Chrome";
import { RememberListPage } from "@/components/BackLink";
import { Suspense } from "react";
import { ListToolbar, type FacetConfig, type SearchSuggestion } from "@/components/FilterBar";
import { VacancyRow } from "@/components/Feed";
import { Pagination, RowGroup, SummaryCard } from "@/components/JobCards";
import { ClosingSoonPanel, HowToApplyPanel, SourcesPanel } from "@/components/Rail";
import { SavedPanel } from "@/components/SavedPanel";
import { daysUntil } from "@/lib/dates";
import {
  GOV_FILTER_KEYS,
  JOB_TYPE_LABEL,
  QUALIFICATION_LABEL,
  SOURCE_LABEL,
  applyGovFilters,
  facetCounts,
  facetCountsMulti,
  getGovVacancies,
  getUpcomingDeadlines,
  isNew,
  jobTypesOf,
  orgTypeOf,
  type GovFilters,
} from "@/lib/jobs";
import type { GovVacancy, SearchParamsShape } from "@/lib/types";

const PER_PAGE = 20;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = GOV_FILTER_KEYS.some((k) => sp[k as keyof SearchParamsShape]);
  return {
    title: "Government vacancies — The Living Gazette",
    description:
      "Search current Sri Lankan government vacancies by field, qualification, organisation and closing date, each linked to its original notice.",
    alternates: { canonical: "/government-jobs" },
    // Filtered and paginated variants are for people, not the search index (brief §26).
    robots: filtered || sp.page ? { index: false, follow: true } : undefined,
  };
}

function withLabels(
  options: { value: string; count: number }[],
  labels: Record<string, string>,
  order?: string[],
) {
  const out = options.map((o) => ({ ...o, label: labels[o.value] ?? o.value }));
  return order ? out.sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value)) : out;
}

function closingSort(a: GovVacancy, b: GovVacancy) {
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

export default async function GovernmentJobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const sp = await searchParams;
  const all = getGovVacancies();

  if (!all) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-12 md:px-8">
        <ErrorState what="government jobs" />
      </div>
    );
  }

  const filters: GovFilters = Object.fromEntries(
    GOV_FILTER_KEYS.map((k) => [k, sp[k as keyof SearchParamsShape]]).filter(([, v]) => v),
  );
  const activeKeys = Object.keys(filters) as (keyof GovFilters)[];

  const sort = sp.sort ?? "closing";
  const view = sp.view === "notices" ? "notices" : "rows";

  const results = [...applyGovFilters(all, filters)].sort((a, b) => {
    if (sort === "newest") return (b.firstSeenAt ?? "").localeCompare(a.firstSeenAt ?? "") || closingSort(a, b);
    return closingSort(a, b);
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

  // ----- Facets: only what the data actually holds, with real counts. -----
  const within = (limit: number, pick: (v: GovVacancy) => string | null | undefined, past = false) =>
    all.filter((v) => {
      const d = daysUntil(pick(v));
      return d !== null && (past ? d <= 0 && d >= -limit : d >= 0 && d <= limit);
    }).length;

  const facets: FacetConfig[] = [
    {
      key: "closing",
      label: "Closing within",
      options: [7, 14, 30].map((n) => ({
        value: String(n),
        label: `${n} days`,
        count: within(n, (v) => v.dateEn ?? v.dateSi),
      })),
    },
    { key: "category", label: "Field", options: facetCounts(all, (v) => v.category), multi: true },
    {
      key: "qualification",
      label: "Qualification required",
      options: withLabels(facetCounts(all, (v) => v.qualificationLevel), QUALIFICATION_LABEL, Object.keys(QUALIFICATION_LABEL)),
      multi: true,
    },
    {
      key: "term",
      label: "Job type",
      options: withLabels(facetCountsMulti(all, jobTypesOf), JOB_TYPE_LABEL, Object.keys(JOB_TYPE_LABEL)),
      multi: true,
    },
    {
      key: "org",
      label: "Organisation type (grouped by name)",
      options: facetCounts(all, (v) => orgTypeOf(v.instEn)),
      multi: true,
    },
    { key: "location", label: "Location", options: facetCountsMulti(all, (v) => v.locations ?? []), multi: true },
    {
      key: "published",
      label: "Published within",
      // Only offered when some listings carry a published date at all.
      options: all.some((v) => v.publishedDate)
        ? [7, 30].map((n) => ({ value: String(n), label: `Last ${n} days`, count: within(n, (v) => v.publishedDate, true) }))
        : [],
    },
    {
      key: "source",
      label: "Source",
      options: withLabels(facetCounts(all, (v) => v.sourceKind), SOURCE_LABEL),
      multi: true,
    },
    { key: "institution", label: "Institution", options: facetCounts(all, (v) => v.instEn) },
  ].filter((f) => f.key === "closing" || f.options.some((o) => o.count > 0));

  // ----- Search suggestions, built from the listings themselves. -----
  const seen = new Set<string>();
  const suggestions: SearchSuggestion[] = [];
  const addSuggestion = (label: string | null | undefined, kind: string) => {
    const key = `${kind}:${label}`;
    if (label && !seen.has(key)) {
      seen.add(key);
      suggestions.push({ label, kind });
    }
  };
  for (const v of all) addSuggestion(v.titleEn, "Job title");
  for (const v of all) addSuggestion(v.instEn, "Institution");
  for (const v of all) addSuggestion(v.category, "Field");
  for (const v of all) addSuggestion(v.gazetteNumber && `Gazette ${v.gazetteNumber}`, "Gazette");

  // ----- Empty state: name the filter that's excluding everything. -----
  let blocker: { key: keyof GovFilters; count: number } | null = null;
  if (results.length === 0) {
    for (const key of activeKeys) {
      const rest = { ...filters, [key]: undefined };
      const count = applyGovFilters(all, rest).length;
      if (count > 0 && (!blocker || count > blocker.count)) blocker = { key, count };
    }
  }
  const facetLabel = (key: keyof GovFilters) =>
    key === "search" ? `the search “${filters.search}”` : `the “${facets.find((f) => f.key === key)?.label ?? key}” filter`;
  const hrefWithout = (key: keyof GovFilters) => {
    const next = new URLSearchParams(
      Object.entries(sp).filter(([k, v]) => v !== undefined && k !== key && k !== "page") as [string, string][],
    );
    const qs = next.toString();
    return qs ? `/government-jobs?${qs}` : "/government-jobs";
  };

  // ----- Grouping: by closing band, only when sorted by closing date. -----
  const bands: { title: string; items: GovVacancy[] }[] = [];
  if (sort === "closing") {
    const band = (v: GovVacancy) => {
      const d = daysUntil(v.dateEn ?? v.dateSi);
      if (v.status === "closed") return 3;
      if (d === null) return 2;
      return d <= 7 ? 0 : 1;
    };
    ["Closing in the next 7 days", "Closing later", "No closing date given", "Closed, kept for reference"].forEach((title, i) => {
      const items = pageItems.filter((v) => band(v) === i);
      if (items.length) bands.push({ title, items });
    });
  } else {
    bands.push({ title: "", items: pageItems });
  }

  const openCount = all.filter((v) => v.status !== "closed").length;
  const institutions = new Set(all.map((v) => v.instEn).filter(Boolean)).size;
  const closingSoon = all.filter((v) => {
    const d = daysUntil(v.dateEn ?? v.dateSi);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  const terms = filters.search?.split(/\s+/).filter(Boolean);

  return (
    <div>
      <Suspense fallback={null}>
        <RememberListPage label="All government vacancies" filteredLabel="Back to your results" />
      </Suspense>
      <PageIntro
        flush
        title="Government vacancies"
        lede={
          <>
            {openCount} open {openCount === 1 ? "vacancy" : "vacancies"} from {institutions}{" "}
            {institutions === 1 ? "institution" : "institutions"}.{" "}
            {closingSoon > 0 && (
              <strong className="font-semibold text-hot">
                {closingSoon} {closingSoon === 1 ? "closes" : "close"} within a week.
              </strong>
            )}{" "}
            Every listing links to its original notice.
          </>
        }
      />

      <ListToolbar
        placeholder="Search jobs, institutions, degrees or Gazette no."
        facets={facets}
        quickKey="closing"
        suggestions={suggestions}
        views={[
          { value: "rows", label: "List", icon: "view_agenda" },
          { value: "notices", label: "Summaries", icon: "article" },
        ]}
        resultCount={results.length}
        sorts={[
          { value: "closing", label: "Closing soonest" },
          { value: "newest", label: "Newest first" },
        ]}
      />

      <div className="mx-auto mt-8 grid grid-cols-[minmax(0,1fr)] max-w-[1240px] gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-10">
          {pageItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rule-2 px-6 py-12">
              <h2 className="title text-[22px] text-ink">
                {activeKeys.length ? "No vacancies match" : "No government vacancies right now"}
              </h2>
              <p className="mt-1.5 max-w-[60ch] text-[16px] leading-relaxed text-ink-2">
                {blocker
                  ? `${facetLabel(blocker.key).replace(/^./, (c) => c.toUpperCase())} is excluding everything. Without it, ${blocker.count} ${blocker.count === 1 ? "vacancy matches" : "vacancies match"}.`
                  : activeKeys.length
                    ? "Try a shorter search, or remove some filters."
                    : "New vacancies appear here after the weekly Gazette update."}
              </p>
              {activeKeys.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {blocker && (
                    <Link href={hrefWithout(blocker.key)} className={buttonClass.mark}>
                      Remove {blocker.key === "search" ? "the search" : "that filter"}
                    </Link>
                  )}
                  <Link href={sp.view ? `/government-jobs?view=${sp.view}` : "/government-jobs"} className={buttonClass.outline}>
                    Clear all filters
                  </Link>
                </div>
              )}
            </div>
          ) : (
            bands.map((b) => (
              <RowGroup
                key={b.title || "all"}
                title={b.title || undefined}
                count={b.title ? b.items.length : undefined}
                grid={view === "notices"}
              >
                {b.items.map((v) =>
                  view === "notices" ? (
                    <SummaryCard key={v.slug} vacancy={v} isNew={isNew(v)} terms={terms} />
                  ) : (
                    <VacancyRow key={v.slug} v={v} isNew={isNew(v)} terms={terms} />
                  ),
                )}
              </RowGroup>
            ))
          )}
          <Pagination page={safePage} totalPages={totalPages} makeHref={makeHref} />
        </div>
        <aside className="space-y-5">
          <ClosingSoonPanel
            title="Private jobs closing soon"
            entries={getUpcomingDeadlines(31).filter((e) => e.kind === "pvt").slice(0, 5)}
          />
          <SavedPanel />
          <HowToApplyPanel />
          <SourcesPanel />
        </aside>
      </div>
    </div>
  );
}
