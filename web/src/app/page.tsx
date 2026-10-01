import Link from "next/link";
import { Suspense } from "react";
import { RememberListPage } from "@/components/BackLink";
import { HomeSearch } from "@/components/HomeSearch";
import { connection } from "next/server";
import { LatestBlock } from "@/components/Feed";
import { GazetteScan } from "@/components/GazetteScan";
import { PrivateJobRow, RowGroup } from "@/components/JobCards";
import { HomeFeed } from "@/components/HomeFeed";
import { BrowsePanel, ClosingSoonPanel, HowToApplyPanel, SourcesPanel } from "@/components/Rail";
import { SavedPanel } from "@/components/SavedPanel";
import { daysUntil } from "@/lib/dates";
import {
  facetCounts,
  getGovUpdatedAt,
  getGovVacancies,
  getLatestGazetteIssue,
  getPrivateJobs,
  getUpcomingDeadlines,
  isNew,
} from "@/lib/jobs";

const PRIVATE_ON_HOME = 8;

export default async function HomePage() {
  // "Today", "new" and "days left" must all be the request's, not the build's.
  await connection();

  const gov = getGovVacancies() ?? [];
  const priv = getPrivateJobs() ?? [];
  const issue = getLatestGazetteIssue();

  const open = gov.filter((v) => v.status !== "closed");
  const closedCount = gov.length - open.length;
  const newCount = open.filter(isNew).length;
  const closingThisWeek = open.filter((v) => {
    const d = daysUntil(v.dateEn ?? v.dateSi);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  // Newest first (by when we first saw it), then soonest closing.
  const feed = [...open].sort((a, b) => {
    const seen = (b.firstSeenAt ?? "").localeCompare(a.firstSeenAt ?? "");
    if (seen !== 0) return seen;
    return (daysUntil(a.dateEn ?? a.dateSi) ?? 999) - (daysUntil(b.dateEn ?? b.dateSi) ?? 999);
  });

  const newestPrivate = [...priv]
    .sort((a, b) => (b.datePosted ? Date.parse(b.datePosted) : 0) - (a.datePosted ? Date.parse(a.datePosted) : 0))
    .slice(0, PRIVATE_ON_HOME);
  const employers = new Set(priv.map((j) => j.employerName)).size;
  const fields = facetCounts(open, (v) => v.category).sort((a, b) => b.count - a.count).slice(0, 6);

  const intro = (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
      <div>
        <h1 className="headline max-w-[16ch] text-[34px] text-ink sm:text-[56px] lg:text-[68px]">
          Government jobs, without the Gazette hunting.
        </h1>
        <p className="mt-4 max-w-[54ch] text-[16.5px] leading-relaxed text-ink-2 sm:mt-5 sm:text-[17px]">
          New Sri Lankan government vacancies, summarised so you can tell in a minute whether one is for you. The
          original notice is always one click away.
        </p>
        <HomeSearch fields={fields} />
      </div>
      <div className="flex flex-col gap-8">
        <div className="hidden lg:block">
          <GazetteScan
            title={feed[0]?.titleEn}
            org={feed[0]?.instEn}
            days={feed[0] ? daysUntil(feed[0].dateEn ?? feed[0].dateSi) : null}
          />
        </div>
        <LatestBlock
          issue={issue ? { number: issue.number, date: issue.date, count: issue.vacancies.length } : null}
          updatedAt={getGovUpdatedAt()}
          total={open.length}
          newCount={newCount}
          closingThisWeek={closingThisWeek}
        />
      </div>
    </div>
  );

  return (
    <>
      <Suspense fallback={null}>
        <RememberListPage label="Latest vacancies" />
      </Suspense>
      <HomeFeed
        intro={intro}
        items={feed.map((v) => ({ v, isNew: isNew(v) }))}
        aside={
          <>
            <ClosingSoonPanel title="Closing in the next two weeks" entries={getUpcomingDeadlines(15).slice(0, 6)} showKind />
            <SavedPanel />
            <HowToApplyPanel />
            <BrowsePanel
              title="Private jobs by employer"
              action={{ href: "/private-jobs", label: "All" }}
              items={facetCounts(priv, (j) => j.employerName)
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((e) => ({
                  label: e.value,
                  count: e.count,
                  href: `/private-jobs?institution=${encodeURIComponent(e.value)}`,
                }))}
            />
            <SourcesPanel />
          </>
        }
      >
        {closedCount > 0 && (
          <p className="mt-4 text-[14px] text-ink-3">
            {closedCount} closed {closedCount === 1 ? "vacancy is" : "vacancies are"} kept on the{" "}
            <Link href="/government-jobs" className="underline underline-offset-4 hover:text-ink">
              government jobs page
            </Link>{" "}
            for reference.
          </p>
        )}

        {newestPrivate.length > 0 && (
          <section aria-labelledby="private-title" className="mt-14">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 id="private-title" className="title text-[26px] text-ink">
                Private sector, newest postings
              </h2>
              <Link
                href="/private-jobs"
                className="text-[15px] font-semibold text-ink underline decoration-mark decoration-[3px] underline-offset-[5px] hover:decoration-ink"
              >
                All {priv.length} private jobs
              </Link>
            </div>
            <p className="mb-5 text-[15px] text-ink-2">
              From {employers} employers&rsquo; own career sites. You apply with the employer, not here.
            </p>
            <RowGroup>
              {newestPrivate.map((j) => (
                <PrivateJobRow key={j.slug} job={j} />
              ))}
            </RowGroup>
          </section>
        )}
      </HomeFeed>
    </>
  );
}
