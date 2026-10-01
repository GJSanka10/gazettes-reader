import Link from "next/link";
import type { DeadlineEntry } from "@/lib/jobs";
import { Icon } from "./Icon";

/** A side panel: white sheet, a heading, and whatever it holds. */
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  /** Optional link at the top right, e.g. "See all". */
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-rule bg-surface p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="title text-[17px] text-ink">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 text-[14px] font-semibold text-ink-2 underline decoration-mark decoration-2 underline-offset-4 hover:text-ink"
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function whenShort(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

/**
 * The next closing dates, soonest first: a small countdown and the job. Red
 * only within a week, the same rule as every other deadline on the site.
 */
export function ClosingSoonPanel({
  entries,
  title = "Closing soon",
  showKind = false,
}: {
  entries: DeadlineEntry[];
  title?: string;
  /** Label each entry Government or Private (for mixed lists). */
  showKind?: boolean;
}) {
  return (
    <Panel title={title}>
      {entries.length === 0 ? (
        <p className="text-[14.5px] text-ink-2">Nothing closes in the next month.</p>
      ) : (
        <ul className="-mx-2">
          {entries.map((e) => (
            <li key={e.kind + e.slug}>
              <Link
                href={`/${e.kind === "gov" ? "government" : "private"}-jobs/${e.slug}`}
                className="group grid grid-cols-[76px_minmax(0,1fr)] items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-paper"
              >
                <span className={`pt-0.5 text-[14px] font-bold leading-tight ${e.days <= 7 ? "text-hot" : "text-ink"}`}>
                  {whenShort(e.days)}
                  <span className="block text-[12.5px] font-medium text-ink-3">
                    {e.date.getDate()} {e.date.toLocaleDateString("en-GB", { month: "short" }).replace("Sept", "Sep")}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-snug text-ink group-hover:underline group-hover:decoration-mark group-hover:decoration-2 group-hover:underline-offset-4">
                    {e.title}
                  </span>
                  <span className="block truncate text-[13.5px] text-ink-3">
                    {showKind && <>{e.kind === "gov" ? "Government" : "Private"}: </>}
                    {e.org}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** A list of browse links with real counts, e.g. fields or employers. */
export function BrowsePanel({
  title,
  items,
  action,
}: {
  title: string;
  items: { label: string; href: string; count: number }[];
  action?: { href: string; label: string };
}) {
  if (!items.length) return null;
  return (
    <Panel title={title} action={action}>
      <ul className="-mx-2">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className="flex min-h-10 items-center justify-between gap-3 rounded-lg px-2 text-[15px] text-ink hover:bg-paper"
            >
              <span className="min-w-0 truncate">{i.label}</span>
              <span className="nums shrink-0 rounded-full bg-paper px-2 py-0.5 text-[13px] font-semibold text-ink-2">
                {i.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const GOV_STEPS = [
  { title: "Read the full notice", body: "The summary here is a guide. The notice sets the exact rules." },
  { title: "Check every requirement", body: "Qualifications, age on the stated date, and any experience asked for." },
  { title: "Use the required format", body: "Many notices give a set application form or CV layout. Follow it exactly." },
  { title: "Send it before the deadline", body: "Usually by registered post, with the post name on the envelope." },
];

/** How applying for a government post usually works. A real sequence, so it's
 *  numbered; each step defers to the notice itself. */
export function HowToApplyPanel() {
  return (
    <Panel title="Applying for a government job">
      <ol className="space-y-3.5">
        {GOV_STEPS.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
            <span className="count flex h-7 w-7 items-center justify-center rounded-md bg-mark text-[17px] text-on-mark">
              {i + 1}
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-snug text-ink">{s.title}</span>
              <span className="block text-[14px] leading-snug text-ink-2">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

const OFFICIAL = [
  { href: "https://documents.gov.lk/web/gazettes", label: "Gazette archive", note: "Department of Government Printing" },
  { href: "https://www.psc.gov.lk", label: "Public Service Commission", note: "Appointments and exams" },
  { href: "https://www.pubad.gov.lk", label: "Ministry of Public Administration", note: "Circulars and service minutes" },
];

export function SourcesPanel() {
  return (
    <Panel title="Official sources">
      <ul className="-mx-2">
        {OFFICIAL.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-paper"
            >
              <Icon name="open_in_new" className="mt-0.5 shrink-0 text-[18px] text-ink-3" />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-snug text-ink group-hover:underline">
                  {l.label}
                </span>
                <span className="block text-[13.5px] text-ink-3">{l.note}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[13px] leading-snug text-ink-3">These open official sites. This site isn&rsquo;t one of them.</p>
    </Panel>
  );
}

/** How private-sector applications work here, in three plain lines. */
export function PrivateApplyPanel() {
  return (
    <Panel title="Applying for a private job">
      <ul className="space-y-2.5 text-[14.5px] leading-snug text-ink-2">
        <li className="flex gap-2.5">
          <Icon name="open_in_new" className="mt-0.5 shrink-0 text-[18px] text-ink-3" />
          You apply on the employer&rsquo;s own careers site. We don&rsquo;t collect applications.
        </li>
        <li className="flex gap-2.5">
          <Icon name="schedule" className="mt-0.5 shrink-0 text-[18px] text-ink-3" />
          Most postings have no closing date and can be taken down without notice, so apply early.
        </li>
        <li className="flex gap-2.5">
          <Icon name="bookmark" className="mt-0.5 shrink-0 text-[18px] text-ink-3" />
          Save a job to keep it on your list while you prepare.
        </li>
      </ul>
    </Panel>
  );
}
