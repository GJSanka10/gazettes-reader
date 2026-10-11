import { notFound } from "next/navigation";
import { DateRow, DetailHeader, DetailSection } from "@/components/Detail";
import { NewTag, SourceLine } from "@/components/Feed";
import { SourceBadge } from "@/components/JobStatus";
import { SaveButton, ShareButtons } from "@/components/SaveButton";
import { Icon } from "@/components/Icon";
import { buttonClass } from "@/components/Chrome";
import { Reminder } from "@/components/Reminder";
import { dayParts, daysUntil, parseClosingDate, relativeDays, todayKey } from "@/lib/dates";
import { JOB_TYPE_LABEL, QUALIFICATION_LABEL, getGovVacancies, getGovVacancyBySlug, isNew, jobTypesOf } from "@/lib/jobs";
import type { Metadata } from "next";
import { jobTitle, pageMeta } from "@/lib/site";
import { breadcrumbLd, govJobPostingLd, govSnippet, ldJson } from "@/lib/seo";

// "N days left" and "New" are date-relative, so rebuild the page at least hourly.
export const revalidate = 3600;

export function generateStaticParams() {
  return (getGovVacancies() ?? []).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getGovVacancyBySlug(slug);
  if (!v) return { title: "Vacancy not found — The Living Gazette", robots: { index: false } };
  return {
    ...pageMeta({
      title: jobTitle(v.titleEn, v.instEn),
      description: govSnippet(v),
      path: `/government-jobs/${v.slug}`,
      type: "article",
      siteImage: false,
    }),
    // Closed notices stay on the site for reference, but a search result
    // that lands on a vacancy you can no longer apply for is a dead end.
    robots: v.status === "closed" ? { index: false, follow: true } : undefined,
  };
}

const outlineButton =
  "flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-paper/30 px-5 text-[15px] font-semibold text-paper hover:bg-paper/10";

function longDate(value?: string | null) {
  const d = parseClosingDate(value);
  return d ? dayParts(d).long : null;
}

export default async function GovJobDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getGovVacancyBySlug(slug);
  if (!v) notFound();

  const closing = v.dateEn ?? v.dateSi;
  const closed = v.status === "closed";
  const days = daysUntil(closing);
  const jobTypes = jobTypesOf(v).map((t) => JOB_TYPE_LABEL[t]);

  const dates = [
    { label: "Published", value: longDate(v.publishedDate), note: v.publishedDate ? null : "Not printed on the notice" },
    { label: "Listed on this site", value: v.firstSeenAt ? dayParts(new Date(v.firstSeenAt)).long : null },
    { label: "Applications close", value: longDate(closing), note: closing ? relativeDays(days) : "Not stated in the notice" },
  ];

  // The one place the reader is sent to act: the notice itself.
  const primary = v.pdfUrl
    ? { href: v.pdfUrl, label: "Open the notice (PDF)", icon: "picture_as_pdf" }
    : v.sourceUrl
      ? { href: v.sourceUrl, label: "Open the source notice", icon: "open_in_new" }
      : null;
  const job = { slug: v.slug, kind: "gov" as const, title: v.titleEn, org: v.instEn, closingDate: closing ?? null };

  return (
    <div>
      <script
        type="application/ld+json"
        // Escaped so a "</script>" inside notice text can't end the tag early.
        dangerouslySetInnerHTML={{
          __html: ldJson([
            ...(closed ? [] : [govJobPostingLd(v)]),
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Government jobs", path: "/government-jobs" },
              { name: v.titleEn, path: `/government-jobs/${v.slug}` },
            ]),
          ]),
        }}
      />

      <DetailHeader
        kind="gov"
        backHref="/government-jobs"
        backLabel="All government vacancies"
        kicker={v.category}
        title={v.titleEn}
        titleSi={v.titleSi}
        org={v.instEn}
        meta={
          <>
            {isNew(v) && <NewTag />}
            <SourceLine v={v} />
          </>
        }
        closingDate={closing}
        facts={[
          { label: "Qualification", value: v.qualificationLevel && QUALIFICATION_LABEL[v.qualificationLevel] },
          { label: "Age limit", value: v.age },
          { label: "Salary", value: v.salary },
          { label: "Vacancies", value: v.quota },
          { label: "Location", value: v.locations?.join(", ") },
          { label: "Job type", value: jobTypes.join(", ") },
          { label: "Selection", value: v.selectionMethod },
        ]}
        actions={
          <>
            {primary && (
              <a href={primary.href} target="_blank" rel="noopener noreferrer" className={`${buttonClass.mark} w-full sm:w-auto`}>
                <Icon name={primary.icon} className="text-[20px]" />
                {primary.label}
              </a>
            )}
            <SaveButton job={job} />
            <ShareButtons title={v.titleEn} org={v.instEn} path={`/government-jobs/${v.slug}`} />
          </>
        }
      />

      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        {closed && (
          <p role="status" className="mt-6 flex items-start gap-3 rounded-2xl bg-sunk px-5 py-4 text-[16px] text-ink">
            <Icon name="lock" className="mt-0.5 text-[20px] text-ink-2" />
            <span>
              <strong className="font-bold">Applications have closed.</strong> This listing stays here for reference.
            </span>
          </p>
        )}

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <article className="space-y-8">
            <DetailSection title="Eligibility" id="eligibility">
              {v.qualEn ? (
                <>
                  <p>{v.qualEn}</p>
                  {v.qualSiText && (
                    <p lang="si" className="mt-4 text-[17px]">
                      {v.qualSiText}
                    </p>
                  )}
                </>
              ) : (
                <p>The qualifications weren&rsquo;t captured for this listing. Read them in the original notice.</p>
              )}
              {v.age && (
                <p className="mt-3">
                  <span className="font-bold text-ink">Age: </span>
                  {v.age}
                </p>
              )}
              <p className="mt-4 rounded-lg bg-mark-soft px-4 py-2.5 text-[15px] text-ink">
                This is a summary. Check every condition against the original notice before you apply.
              </p>
            </DetailSection>

            {v.descEn && (
              <DetailSection title="About the post">
                <p>{v.descEn}</p>
                {v.descSi && (
                  <p lang="si" className="mt-4 text-[17px]">
                    {v.descSi}
                  </p>
                )}
              </DetailSection>
            )}

            <DetailSection title="How to apply" id="apply">
              {v.howToApply && v.howToApply.length > 0 ? (
                <ol className="space-y-3">
                  {v.howToApply.map((step, i) => (
                    <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                      <span className="count flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[18px] text-paper">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>The notice&rsquo;s application steps weren&rsquo;t captured here. Follow the instructions in the original.</p>
              )}
              {v.requiredDocuments && v.requiredDocuments.length > 0 && (
                <>
                  <h3 className="mt-6 text-[17px] font-bold text-ink">Enclose with your application</h3>
                  <ul className="mt-2 space-y-1.5">
                    {v.requiredDocuments.map((doc) => (
                      <li key={doc} className="flex gap-2.5">
                        <Icon name="description" className="mt-1 shrink-0 text-[18px] text-ink-3" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </DetailSection>

            <DetailSection title="Important dates">
              <DateRow dates={dates} />
              <Reminder slug={v.slug} title={v.titleEn} org={v.instEn} closingDate={closing} path={`/government-jobs/${v.slug}`} today={todayKey()} />
            </DetailSection>

            {v.titleSi && (
              <p className="max-w-[68ch] border-l-4 border-mark pl-4 text-[15px] leading-relaxed text-ink-2">
                Notices like this are published in Sinhala, Tamil and English. If the versions differ, the Sinhala
                text is the one that counts.
              </p>
            )}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-ink p-5 text-paper">
              <h2 className="title text-[19px]">Official source</h2>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-paper/80">
                The application form, address and exact wording are in the original notice.
              </p>
              <p className="mt-2 text-[14px] text-paper/65">
                {v.sourceKind === "gazette"
                  ? `Government Gazette${v.gazetteNumber ? ` No. ${v.gazetteNumber}` : ""}`
                  : "The institution's own notice, not a Gazette issue"}
                {v.citation && <>, citing {v.citation}</>}
              </p>
              <details className="group mt-2 text-[14px] text-paper/75">
                <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 font-semibold text-paper [&::-webkit-details-marker]:hidden">
                  <span className="underline decoration-paper/40 underline-offset-4">Gazette notice or institution notice?</span>
                  <Icon name="expand_more" className="text-[18px] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-1 leading-relaxed">
                  The Government Gazette is the official weekly publication of the Department of Government Printing.
                  Many institutions also advertise posts on their own website or in newspapers. Either way, apply
                  exactly as the notice itself says.
                </p>
              </details>
              {v.pdfUrl ? (
                <div className="mt-4 space-y-2">
                  {v.pdfPages && (
                    <p className="text-[13.5px] text-paper/70">
                      Just this notice:{" "}
                      {v.pdfPages[0] === v.pdfPages[1]
                        ? `page ${v.pdfPages[0]}`
                        : `pages ${v.pdfPages[0]}–${v.pdfPages[1]}`}{" "}
                      of the Gazette issue
                    </p>
                  )}
                  <a
                    href={v.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-mark px-5 text-[15px] font-bold text-on-mark hover:brightness-95"
                  >
                    <Icon name="picture_as_pdf" className="text-[20px]" />
                    Open the notice (PDF)
                  </a>
                  <a href={v.pdfUrl} download className={outlineButton}>
                    <Icon name="download" className="text-[19px]" />
                    Download PDF
                  </a>
                  {v.pdfFullUrl && v.pdfFullUrl !== v.pdfUrl && (
                    <a href={v.pdfFullUrl} target="_blank" rel="noopener noreferrer" className={outlineButton}>
                      <Icon name="menu_book" className="text-[19px]" />
                      Full Gazette issue (PDF)
                    </a>
                  )}
                  {v.pdfUrlSi && (
                    <a href={v.pdfUrlSi} target="_blank" rel="noopener noreferrer" lang="si" className={outlineButton}>
                      <Icon name="picture_as_pdf" className="text-[19px]" />
                      සිංහල නිවේදනය (PDF)
                    </a>
                  )}
                  {v.pdfFullUrlSi && (
                    <>
                      <a href={v.pdfFullUrlSi} target="_blank" rel="noopener noreferrer" lang="si" className={outlineButton}>
                        <Icon name="menu_book" className="text-[19px]" />
                        සිංහල ගැසට් පත්‍රය (සම්පූර්ණ)
                      </a>
                      <p className="text-center text-[13px] text-paper/60">
                        Sinhala edition, whole issue. Its page numbers differ from the English one.
                      </p>
                    </>
                  )}
                </div>
              ) : v.sourceUrl ? (
                <div className="mt-4 space-y-2">
                  <a
                    href={v.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-mark px-5 text-[15px] font-bold text-on-mark hover:brightness-95"
                  >
                    <Icon name="open_in_new" className="text-[19px]" />
                    Open the source page
                  </a>
                  <p className="pt-0.5 text-center text-[13px] text-paper/60">Opens in a new tab</p>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-paper/10 p-4 text-[14px] leading-relaxed text-paper/85">
                  We didn&rsquo;t capture a direct link for this notice. Find it by date in the{" "}
                  <a
                    href="https://documents.gov.lk/web/gazettes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-paper underline underline-offset-4"
                  >
                    Government Printing archive
                  </a>
                  .
                </p>
              )}
            </div>
            <div className="mt-3 px-1">
              <SourceBadge verified={v.real && !v._needsReview} sourceKind={v.sourceKind} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
