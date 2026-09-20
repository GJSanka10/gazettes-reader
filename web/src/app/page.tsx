import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getGovVacancies, getPrivateJobs } from "@/lib/jobs";

/** Spec §4: the homepage does not list jobs. Its job is to let someone choose
 *  which of the two collections they want, and get out of the way. */
export default function HomePage() {
  const gov = getGovVacancies();
  const priv = getPrivateJobs();

  const govOpen = gov?.filter((v) => v.status !== "closed").length ?? null;
  const privCount = priv?.length ?? null;
  const institutionCount = gov ? new Set(gov.map((v) => v.instEn).filter(Boolean)).size : null;
  const employerCount = priv ? new Set(priv.map((j) => j.employerName).filter(Boolean)).size : null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-8 md:py-20">
      <span className="inline-flex items-center gap-1.5 border border-rule-strong px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        <Icon name="menu_book" className="text-[15px]" />
        Sri Lanka&rsquo;s job register
      </span>

      <h1 className="mt-4 max-w-[18ch] font-display text-[34px] font-semibold leading-[1.15] tracking-tight text-ink md:text-[42px]">
        Find your next career opportunity
      </h1>
      <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">
        Explore the latest Government Gazette vacancies and private-sector opportunities in Sri
        Lanka.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <ChoiceCard
          href="/government-jobs"
          icon="account_balance"
          title="Government Jobs"
          body="Vacancies published through official Gazette notices, with closing dates and a link to the original document."
          stats={[
            govOpen === null ? null : { label: "Open now", value: String(govOpen) },
            institutionCount === null ? null : { label: "Institutions", value: String(institutionCount) },
          ]}
          cta="View government jobs"
        />
        <ChoiceCard
          href="/private-jobs"
          icon="work"
          title="Private Jobs"
          body="Openings collected from the career sites of companies and organisations operating in Sri Lanka."
          stats={[
            privCount === null ? null : { label: "Listings", value: String(privCount) },
            employerCount === null ? null : { label: "Employers", value: String(employerCount) },
          ]}
          cta="View private jobs"
        />
      </div>

      <p className="mt-10 flex max-w-[70ch] items-start gap-2 border-l-2 border-rule-strong pl-4 text-[14px] leading-relaxed text-ink-soft">
        <Icon name="info" className="mt-0.5 shrink-0 text-[16px]" />
        This is an independent digest, not an official government website. Always check the
        original Gazette notice or the employer&rsquo;s own posting for official requirements,
        deadlines and application instructions.
      </p>
    </div>
  );
}

function ChoiceCard({
  href,
  icon,
  title,
  body,
  stats,
  cta,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
  stats: ({ label: string; value: string } | null)[];
  cta: string;
}) {
  const realStats = stats.filter((s): s is { label: string; value: string } => s !== null);
  return (
    <Link
      href={href}
      className="group flex cursor-pointer flex-col border border-rule-strong bg-surface-raised p-6 transition-colors hover:border-ink"
    >
      <Icon name={icon} className="text-[26px] text-accent" />
      <h2 className="mt-3 font-display text-[24px] font-semibold text-ink">{title}</h2>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{body}</p>

      {realStats.length > 0 && (
        <div className="mt-4 flex gap-4 border-t border-rule pt-3">
          {realStats.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-[18px] font-bold text-ink">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wide text-ink-faint">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <span className="mt-5 inline-flex items-center gap-1 text-[15px] font-bold text-ink underline underline-offset-4">
        {cta} <Icon name="arrow_forward" className="text-[16px]" />
      </span>
    </Link>
  );
}
