import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/Chrome";
import { JobStatusLabel } from "@/components/JobStatus";
import { Icon } from "@/components/Icon";
import { getGovVacancies, getGovVacancyBySlug } from "@/lib/jobs";

export function generateStaticParams() {
  return (getGovVacancies() ?? []).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getGovVacancyBySlug(slug);
  if (!v) return { title: "Job not found — The Living Gazette" };
  return { title: `${v.titleEn} — ${v.instEn}`, description: v.descEn?.slice(0, 160) };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-[20px] font-semibold text-ink">{title}</h2>
      <div className="mt-2 text-[16px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default async function GovJobDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getGovVacancyBySlug(slug);
  if (!v) notFound();

  const closed = v.status === "closed";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Government Gazette Jobs", href: "/government-jobs" },
          { label: v.titleEn },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <JobStatusLabel status={v.status} closingDate={v.dateEn ?? v.dateSi} />
            {v.real && (
              <span className="font-ui inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-verified">
                <Icon name="verified" className="text-[13px]" />
                Verified against Gazette
              </span>
            )}
          </div>

          <h1 className="font-display text-[28px] font-semibold leading-[34px] tracking-tight text-ink md:text-[36px] md:leading-[42px]">
            {v.titleEn}
          </h1>
          {v.titleSi && (
            <p lang="si" className="si-body mt-1 font-[family-name:var(--font-siserif)] text-[18px] text-ink-soft">
              {v.titleSi}
            </p>
          )}
          <p className="font-ui mt-2 text-[15px] text-ink-soft">{v.instEn}</p>

          {closed && (
            <p
              role="status"
              className="mt-5 border-l-2 border-rule-strong bg-surface-sunken px-4 py-3 text-[15px] text-ink"
            >
              <strong>Closed.</strong> The application deadline for this vacancy has passed. It
              remains here for reference.
            </p>
          )}

          {v.descEn && <Section title="Job overview">{v.descEn}</Section>}

          <Section title="Key details">
            <div className="table-scroll">
              <table className="fact-table">
                <tbody>
                  <tr>
                    <th scope="row">Category</th>
                    <td>{v.category ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Vacancies</th>
                    <td>{v.quota ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Age limit</th>
                    <td>{v.age ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Salary</th>
                    <td>{v.salary ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Closing date</th>
                    <td>{v.dateEn ?? "Not specified"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {v.qualEn && <Section title="Qualifications">{v.qualEn}</Section>}
        </article>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          {/* Spec §21: the platform's summary and the official source must be
              visually distinct, and the source must be unmistakable. */}
          <div className="border border-rule-strong bg-surface-sunken p-5">
            <h2 className="font-ui text-[13px] font-bold uppercase tracking-wide text-ink">Official source</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Everything above is a summary prepared by this site. The official wording is in the
              Gazette itself.
            </p>
            {v.citation && <p className="citation-box mt-3">{v.citation}</p>}

            {v.pdfUrl || v.sourceUrl ? (
              <>
                <div className="font-ui mt-4 space-y-2">
                  {v.pdfUrl && (
                    <a
                      href={v.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 bg-ink px-4 text-center text-[13px] font-semibold uppercase tracking-wide text-surface-raised hover:bg-[#163a5f]"
                    >
                      <Icon name="picture_as_pdf" className="text-[16px]" />
                      View official Gazette PDF
                    </a>
                  )}
                  {v.sourceUrl && (
                    <a
                      href={v.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 border border-ink px-4 text-center text-[13px] font-semibold uppercase tracking-wide text-ink hover:bg-surface-raised"
                    >
                      <Icon name="open_in_new" className="text-[15px]" />
                      View source page
                    </a>
                  )}
                </div>
                <p className="font-ui mt-3 text-[12px] text-ink-faint">
                  Opens in a new tab on an external site.
                </p>
              </>
            ) : (
              /* Most older entries predate source-link capture. Say so plainly rather
                 than showing a source card with nothing behind it (spec §21, §68). */
              <p className="mt-4 border-l-2 border-rule-strong bg-surface p-2.5 text-[13px] leading-relaxed text-ink-soft">
                No direct link was captured for this notice. Look it up by its Gazette date on{" "}
                <a
                  href="https://documents.gov.lk/web/gazettes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  documents.gov.lk ↗
                </a>
                , the Department of Government Printing&rsquo;s official archive.
              </p>
            )}
          </div>

          <Link
            href="/government-jobs"
            className="font-ui inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center border border-ink px-4 text-[13px] font-semibold uppercase tracking-wide text-ink hover:bg-surface-sunken"
          >
            Back to all government jobs
          </Link>
        </aside>
      </div>
    </div>
  );
}
