import { notFound } from "next/navigation";
import { buttonClass } from "@/components/Chrome";
import { DetailHeader, DetailSection } from "@/components/Detail";
import { Icon } from "@/components/Icon";
import { Reminder } from "@/components/Reminder";
import { SaveButton, ShareButtons } from "@/components/SaveButton";
import { getPrivateJobBySlug, getPrivateJobs } from "@/lib/jobs";

// "N days left" is date-relative, so rebuild the page at least hourly.
export const revalidate = 3600;

export function generateStaticParams() {
  return (getPrivateJobs() ?? []).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = getPrivateJobBySlug(slug);
  if (!j) return { title: "Job not found — The Living Gazette" };
  return { title: `${j.titleEn} — ${j.employerName}`, description: j.descEn?.slice(0, 160) };
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PrivateJobDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = getPrivateJobBySlug(slug);
  if (!j) notFound();

  const applyHref = j.applyUrl && j.applyUrl !== "#" ? j.applyUrl : j.sourceUrl;
  const sector = j.sector ? (j.sector === "other" ? "Other sectors" : j.sector.charAt(0).toUpperCase() + j.sector.slice(1)) : null;

  return (
    <div>
      <DetailHeader
        kind="pvt"
        backHref="/private-jobs"
        backLabel="All private jobs"
        kicker={j.employmentType}
        title={j.titleEn}
        org={j.employerName}
        closingDate={j.closingDate}
        facts={[
          { label: "Location", value: j.location?.replace(", Sri Lanka", "") },
          { label: "Employment type", value: j.employmentType },
          { label: "Salary", value: j.salary },
          { label: "Posted", value: formatDate(j.datePosted) },
          { label: "Sector", value: sector },
        ]}
        actions={
          <>
            {applyHref && (
              <a href={applyHref} target="_blank" rel="noopener noreferrer" className={`${buttonClass.mark} w-full sm:w-auto`}>
                <Icon name="open_in_new" className="text-[19px]" />
                Apply on the employer&rsquo;s site
              </a>
            )}
            <SaveButton job={{ slug: j.slug, kind: "pvt", title: j.titleEn, org: j.employerName, closingDate: j.closingDate ?? null }} />
            <ShareButtons title={j.titleEn} org={j.employerName} path={`/private-jobs/${j.slug}`} />
          </>
        }
      />

      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <article className="space-y-8">
            {j.qualEn && (
              <DetailSection title="What they're looking for">
                <div className="whitespace-pre-line">{j.qualEn}</div>
              </DetailSection>
            )}

            {j.descEn && (
              <DetailSection title="About the role">
                <div className="whitespace-pre-line">{j.descEn}</div>
              </DetailSection>
            )}

            {!j.qualEn && !j.descEn && (
              <p className="text-[16px] text-ink-2">The posting&rsquo;s full description is on the employer&rsquo;s site.</p>
            )}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-ink p-5 text-paper">
              <h2 className="title text-[19px]">Apply with {j.employerName.split(" (")[0]}</h2>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-paper/80">
                The employer handles applications on their own careers site. We don&rsquo;t collect anything from you.
              </p>
              <div className="mt-4 space-y-2">
                {j.applyUrl && j.applyUrl !== "#" && (
                  <a
                    href={j.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-mark px-5 text-[15px] font-bold text-on-mark hover:brightness-95"
                  >
                    <Icon name="open_in_new" className="text-[19px]" />
                    Apply on the employer&rsquo;s site
                  </a>
                )}
                {j.sourceUrl && j.sourceUrl !== j.applyUrl && (
                  <a
                    href={j.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-paper/30 px-5 text-[15px] font-semibold text-paper hover:bg-paper/10"
                  >
                    <Icon name="link" className="text-[19px]" />
                    See the original posting
                  </a>
                )}
                <p className="pt-0.5 text-center text-[13px] text-paper/60">Opens on an external site</p>
              </div>
            </div>
            <Reminder slug={j.slug} title={j.titleEn} org={j.employerName} closingDate={j.closingDate} path={`/private-jobs/${j.slug}`} />
          </aside>
        </div>
      </div>
    </div>
  );
}
