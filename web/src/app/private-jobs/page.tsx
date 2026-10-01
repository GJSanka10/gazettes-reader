import { EmptyState, ErrorState, PageIntro, buttonClass } from "@/components/Chrome";
import { RememberListPage } from "@/components/BackLink";
import { Suspense } from "react";
import { ListToolbar } from "@/components/FilterBar";
import { Pagination, PrivateJobRow, RowGroup } from "@/components/JobCards";
import { BrowsePanel, ClosingSoonPanel, PrivateApplyPanel } from "@/components/Rail";
import { SavedPanel } from "@/components/SavedPanel";
import { daysUntil, facetCounts, getPrivateJobs, getUpcomingDeadlines, matchesAnyParam } from "@/lib/jobs";
import type { PrivateJob, SearchParamsShape } from "@/lib/types";
import Link from "next/link";

const PER_PAGE = 20;

export const metadata = {
  title: "Private jobs — The Living Gazette",
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
      <div className="mx-auto max-w-[1240px] px-4 py-12 md:px-8">
        <ErrorState what="private-sector jobs" />
      </div>
    );
  }

  let results = all;
  if (sp.search) results = results.filter((j) => matches(j, sp.search!));
  if (sp.sector) results = results.filter((j) => matchesAnyParam(j.sector, sp.sector));
  if (sp.institution) results = results.filter((j) => matchesAnyParam(j.employerName, sp.institution));
  if (sp.location) results = results.filter((j) => matchesAnyParam(j.location, sp.location));
  if (sp.employment) results = results.filter((j) => matchesAnyParam(j.employmentType, sp.employment));

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
  const employerCount = new Set(all.map((j) => j.employerName).filter(Boolean)).size;
  const hasFilters = Boolean(
    sp.search || sp.sector || sp.institution || sp.location || sp.employment,
  );

  const sectorLabel = (s: string) => (s === "other" ? "Other sectors" : s.charAt(0).toUpperCase() + s.slice(1));
  const facets = [
    {
      key: "sector",
      label: "Sector",
      options: facetCounts(all, (j) => j.sector).map((o) => ({ ...o, label: sectorLabel(o.value) })),
      multi: true,
    },
    { key: "institution", label: "Company", options: facetCounts(all, (j) => j.employerName), multi: true },
    { key: "location", label: "Location", options: facetCounts(all, (j) => j.location), multi: true },
    { key: "employment", label: "Employment type", options: facetCounts(all, (j) => j.employmentType), multi: true },
  ];

  const bands: { title: string; items: PrivateJob[] }[] = [];
  if (sort === "closing") {
    const band = (j: PrivateJob) => {
      const d = daysUntil(j.closingDate);
      if (d === null) return 2;
      return d <= 7 ? 0 : 1;
    };
    ["Closing in the next 7 days", "Closing later", "No closing date given"].forEach((title, i) => {
      const items = pageItems.filter((j) => band(j) === i);
      if (items.length) bands.push({ title, items });
    });
  } else {
    bands.push({ title: "", items: pageItems });
  }

  const terms = sp.search?.split(/\s+/).filter(Boolean);

  return (
    <div>
      <Suspense fallback={null}>
        <RememberListPage label="All private jobs" filteredLabel="Back to your results" />
      </Suspense>
      <PageIntro
        flush
        title="Private jobs"
        lede={
          <>
            {all.length} openings from {employerCount} employers&rsquo; own career sites. Only {datedCount} of them
            give a closing date, so the newest postings come first. You apply on the employer&rsquo;s site, not here.
          </>
        }
      />

      <ListToolbar
        placeholder="Search by title, company or skill"
        facets={facets}
        resultCount={results.length}
        sorts={[
          { value: "posted", label: "Newest first" },
          { value: "closing", label: "Closing soonest" },
          { value: "employer", label: "Company A to Z" },
        ]}
      />

      <div className="mx-auto mt-8 grid grid-cols-[minmax(0,1fr)] max-w-[1240px] gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-10">
          {pageItems.length === 0 ? (
            <EmptyState
              title="Nothing matches those filters"
              body="Try a shorter search, or remove a filter to widen the list."
              action={
                hasFilters ? (
                  <Link href="/private-jobs" className={buttonClass.outline}>
                    Clear filters
                  </Link>
                ) : null
              }
            />
          ) : (
            bands.map((b) => (
              <RowGroup key={b.title || "all"} title={b.title || undefined} count={b.title ? b.items.length : undefined}>
                {b.items.map((j) => (
                  <PrivateJobRow key={j.slug} job={j} terms={terms} />
                ))}
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
          <BrowsePanel
            title="Employers"
            items={facetCounts(all, (j) => j.employerName)
              .sort((a, b) => b.count - a.count)
              .map((e) => ({
                label: e.value,
                count: e.count,
                href: `/private-jobs?institution=${encodeURIComponent(e.value)}`,
              }))}
          />
          <SavedPanel />
          <PrivateApplyPanel />
        </aside>
      </div>
    </div>
  );
}
