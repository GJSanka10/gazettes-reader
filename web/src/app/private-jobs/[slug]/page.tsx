import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/Chrome";
import { JobStatusLabel } from "@/components/JobStatus";
import { Icon } from "@/components/Icon";
import { getPrivateJobBySlug, getPrivateJobs } from "@/lib/jobs";

export function generateStaticParams() {
  return (getPrivateJobs() ?? []).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = getPrivateJobBySlug(slug);
  if (!j) return { title: "Job not found — The Living Gazette" };
  return { title: `${j.titleEn} — ${j.employerName}`, description: j.descEn?.slice(0, 160) };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-[20px] font-semibold text-ink">{title}</h2>
      <div className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default async function PrivateJobDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = getPrivateJobBySlug(slug);
  if (!j) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Private Sector Jobs", href: "/private-jobs" },
          { label: j.titleEn },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article>
          <div className="mb-3">
            <JobStatusLabel status={j.status} closingDate={j.closingDate} />
          </div>

          <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-ink md:text-[36px]">
            {j.titleEn}
          </h1>
          <p className="mt-2 text-[17px] text-ink-soft">{j.employerName}</p>

          {j.descEn && <Section title="About this role">{j.descEn}</Section>}

          <Section title="Key details">
            <div className="table-scroll">
              <table className="fact-table">
                <tbody>
                  <tr>
                    <th scope="row">Location</th>
                    <td>{j.location ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Employment type</th>
                    <td>{j.employmentType ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Sector</th>
                    <td>{j.sector ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Salary</th>
                    {/* Spec §68: never invent a value that wasn't published. */}
                    <td>{j.salary ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Posted</th>
                    <td>{j.datePosted ?? "Not specified"}</td>
                  </tr>
                  <tr>
                    <th scope="row">Closing date</th>
                    <td>{j.closingDate ?? "Not specified"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {j.qualEn && <Section title="Requirements">{j.qualEn}</Section>}
        </article>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="border border-rule-strong bg-surface-raised p-5">
            <h2 className="font-display text-[17px] font-semibold text-ink">Apply</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
              Applications are handled by the employer, not by this site.
            </p>
            <div className="mt-4 space-y-2">
              {j.applyUrl && j.applyUrl !== "#" && (
                <a
                  href={j.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 bg-ink px-4 text-[14px] font-bold text-surface-raised"
                >
                  <Icon name="open_in_new" className="text-[15px]" />
                  Apply on employer site
                </a>
              )}
              {j.sourceUrl && (
                <a
                  href={j.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 border border-rule-strong px-4 text-[14px] text-ink"
                >
                  <Icon name="open_in_new" className="text-[15px]" />
                  View original posting
                </a>
              )}
            </div>
            <p className="mt-3 text-[12px] text-ink-faint">Opens in a new tab on an external site.</p>
          </div>

          <Link
            href="/private-jobs"
            className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center border border-rule px-4 text-[14px] text-ink"
          >
            Back to all private jobs
          </Link>
        </aside>
      </div>
    </div>
  );
}
