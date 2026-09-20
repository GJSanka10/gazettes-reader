import Link from "next/link";
import { getGovVacancies, getPrivateJobs } from "@/lib/jobs";

/** Spec §4: the homepage does not list jobs. Its job is to let someone choose
 *  which of the two collections they want, and get out of the way. */
export default function HomePage() {
  const gov = getGovVacancies();
  const priv = getPrivateJobs();

  const govOpen = gov?.filter((v) => v.status !== "closed").length ?? null;
  const privCount = priv?.length ?? null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-8 md:py-20">
      <h1 className="max-w-[18ch] font-display text-[34px] font-semibold leading-[1.15] tracking-tight text-ink md:text-[40px]">
        Find your next career opportunity
      </h1>
      <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">
        Explore the latest Government Gazette vacancies and private-sector opportunities in Sri
        Lanka.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <ChoiceCard
          href="/government-jobs"
          title="Government Jobs"
          body="Vacancies published through official Gazette notices, with closing dates and a link to the original document."
          count={govOpen === null ? null : `${govOpen} currently open`}
          cta="View government jobs"
        />
        <ChoiceCard
          href="/private-jobs"
          title="Private Jobs"
          body="Openings collected from the career sites of companies and organisations operating in Sri Lanka."
          count={privCount === null ? null : `${privCount} listings`}
          cta="View private jobs"
        />
      </div>

      <p className="mt-10 max-w-[70ch] border-l-2 border-rule-strong pl-4 text-[14px] leading-relaxed text-ink-soft">
        This is an independent digest, not an official government website. Always check the
        original Gazette notice or the employer&rsquo;s own posting for official requirements,
        deadlines and application instructions.
      </p>
    </div>
  );
}

function ChoiceCard({
  href,
  title,
  body,
  count,
  cta,
}: {
  href: string;
  title: string;
  body: string;
  count: string | null;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex cursor-pointer flex-col border border-rule-strong bg-surface-raised p-6 transition-colors hover:border-ink"
    >
      <h2 className="font-display text-[24px] font-semibold text-ink">{title}</h2>
      {count && <p className="mt-1 font-mono text-[12px] text-ink-faint">{count}</p>}
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{body}</p>
      <span className="mt-5 inline-flex items-center text-[15px] font-bold text-ink underline underline-offset-4">
        {cta}
      </span>
    </Link>
  );
}
