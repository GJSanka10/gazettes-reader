import { notFound } from "next/navigation";
import { DateRow, DetailHeader, DetailSection } from "@/components/Detail";
import { NewTag, SourceLine } from "@/components/Feed";
import { SourceBadge } from "@/components/JobStatus";
import { SaveButton, ShareButtons } from "@/components/SaveButton";
import { Icon } from "@/components/Icon";
import { buttonClass } from "@/components/Chrome";
import { Reminder } from "@/components/Reminder";
import { dayParts, daysUntil, parseClosingDate, relativeDays } from "@/lib/dates";
import { JOB_TYPE_LABEL, QUALIFICATION_LABEL, getGovVacancies, getGovVacancyBySlug, isNew, jobTypesOf } from "@/lib/jobs";
import type { GovVacancy } from "@/lib/types";

// "N days left" and "New" are date-relative, so rebuild the page at least hourly.
export const revalidate = 3600;

export function generateStaticParams() {
  return (getGovVacancies() ?? []).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getGovVacancyBySlug(slug);
  if (!v) return { title: "Vacancy not found — The Living Gazette" };
  const title = `${v.titleEn} — ${v.instEn}`;
  const description = v.descEn?.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/government-jobs/${v.slug}` },
    openGraph: { title, description, type: "article" },
  };
}

/** schema.org JobPosting, built only from fields the notice actually states. */
function jobPostingLd(v: GovVacancy) {
  const closing = parseClosingDate(v.dateEn ?? v.dateSi);
  const posted = v.publishedDate ?? v.firstSeenAt?.slice(0, 10);
  const place = (v.locations ?? []).find((l) => l.toLowerCase() !== "island-wide");
  const EMPLOYMENT: Record<string, string> = { permanent: "FULL_TIME", contract: "CONTRACTOR", temporary: "TEMPORARY" };
  const employmentType = v.employmentTerm ? EMPLOYMENT[v.employmentTerm] : undefined;
  const isoDay = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: v.titleEn,
    description: [v.descEn, v.qualEn && `Qualifications: ${v.qualEn}`].filter(Boolean).join("\n\n"),
    hiringOrganization: { "@type": "Organization", name: v.instEn },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "LK", ...(place ? { addressLocality: place } : {}) },
    },
    ...(posted ? { datePosted: posted } : {}),
    // End of the closing day, Sri Lanka time.
    ...(closing ? { validThrough: `${isoDay(closing)}T23:59:59+05:30` } : {}),
    ...(employmentType ? { employmentType } : {}),
  };
}

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd(v)).replace(/</g, "\\u003c") }}
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
              <Reminder slug={v.slug} title={v.titleEn} org={v.instEn} closingDate={closing} path={`/government-jobs/${v.slug}`} />
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
              {v.pdfUrl || v.sourceUrl ? (
                <div className="mt-4 space-y-2">
                  {v.pdfUrl && (
                    <a
                      href={v.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-mark px-5 text-[15px] font-bold text-on-mark hover:brightness-95"
                    >
                      <Icon name="picture_as_pdf" className="text-[20px]" />
                      Open the notice (PDF)
                    </a>
                  )}
                  {v.sourceUrl && (
                    <a
                      href={v.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold ${
                        v.pdfUrl
                          ? "border border-paper/30 text-paper hover:bg-paper/10"
                          : "bg-mark font-bold text-on-mark hover:brightness-95"
                      }`}
                    >
                      <Icon name="open_in_new" className="text-[19px]" />
                      Open the source page
                    </a>
                  )}
                  <p className="pt-0.5 text-center text-[13px] text-paper/60">Opens on an external site</p>
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
