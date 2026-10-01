import { dayParts, daysUntil, heatFor, parseClosingDate, relativeDays } from "@/lib/dates";
import { BackLink } from "./Chrome";

export interface KeyFact {
  label: string;
  value?: string | null;
}

/**
 * Shared opener for both detail pages, sized so the facts that decide
 * relevance are on the first screen, phone included: a compact title block,
 * then every key fact in one ruled grid (closing date first), then the
 * actions. The long reading (eligibility, how to apply) follows below.
 */
export function DetailHeader({
  kind,
  backHref,
  backLabel,
  kicker,
  title,
  titleSi,
  org,
  meta,
  closingDate,
  facts,
  actions,
}: {
  kind: "gov" | "pvt";
  backHref: string;
  backLabel: string;
  kicker?: string | null;
  title: string;
  titleSi?: string;
  org: string;
  /** One line under the organisation, e.g. New + where the notice came from. */
  meta?: React.ReactNode;
  closingDate?: string | null;
  /** Shown after the closing date, in this order. */
  facts: KeyFact[];
  /** The primary action first (open the notice / apply), then save and share. */
  actions: React.ReactNode;
}) {
  const cells = 1 + facts.length;
  // Full rows at every width: 2 on phones; 4 or 3 across on wider screens.
  const cols = cells % 4 === 0 ? "sm:grid-cols-4" : "sm:grid-cols-3";

  return (
    <div className="border-b border-rule bg-surface">
      <header className="mx-auto max-w-[1240px] px-4 pb-6 pt-3 md:px-8 md:pb-8 md:pt-5">
        <BackLink href={backHref} label={backLabel} />

        <p className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-ink-2">
          <span className="font-bold text-ink">{kind === "gov" ? "Government job" : "Private job"}</span>
          {kicker && <span className="rounded-full border border-rule-2 px-2.5 py-0.5 text-[13px] font-medium">{kicker}</span>}
        </p>
        <h1 className="headline mt-2 max-w-[28ch] text-[28px] leading-[1.08] text-ink md:text-[40px]">{title}</h1>
        {titleSi && (
          <p lang="si" className="mt-1 text-[17px] font-semibold text-ink-2 md:text-[19px]">
            {titleSi}
          </p>
        )}
        <p className="mt-1.5 text-[16px] text-ink-2 md:text-[17px]">{org}</p>
        {meta && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">{meta}</div>}

        <dl
          className={`mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule ${cols} md:mt-6`}
        >
          <ClosingCell closingDate={closingDate} />
          {facts.map((f) => (
            <div key={f.label} className="min-w-0 bg-surface px-3.5 py-3 sm:px-4">
              <dt className="text-[13px] text-ink-3">{f.label}</dt>
              <dd className={`mt-0.5 text-[15px] leading-snug ${f.value ? "font-semibold text-ink" : "text-ink-3"}`}>
                {f.value || "Not stated"}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-5">{actions}</div>
      </header>
    </div>
  );
}

/** The closing date as the first fact: the date itself, then days left in
 *  words, red within a week. */
function ClosingCell({ closingDate }: { closingDate?: string | null }) {
  const date = parseClosingDate(closingDate);
  const days = daysUntil(closingDate);
  const heat = heatFor(days);
  const urgent = heat === "hot" || heat === "warm";
  return (
    <div className={`min-w-0 px-3.5 py-3 sm:px-4 ${urgent ? "bg-hot-soft" : "bg-surface"}`}>
      <dt className="text-[13px] text-ink-3">Applications close</dt>
      {date ? (
        <dd className="mt-0.5 leading-snug">
          <span className="block text-[15px] font-semibold text-ink">
            {dayParts(date).weekday} {dayParts(date).day} {dayParts(date).month} {date.getFullYear()}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[14px] ${urgent ? "font-bold text-hot" : heat === "past" ? "text-ink-3" : "text-ink-2"}`}
          >
            {days !== null && days >= 0 && days <= 1 && <span aria-hidden="true" className="pulse-dot shrink-0" />}
            {relativeDays(days)}
          </span>
        </dd>
      ) : (
        <dd className="mt-0.5 text-[15px] text-ink-3">Not stated</dd>
      )}
    </div>
  );
}

export function DetailSection({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-rule pt-6 first:border-t-0 first:pt-0">
      <h2 className="title text-[21px] text-ink">{title}</h2>
      <div className="mt-2.5 max-w-[68ch] text-[16.5px] leading-[1.7] text-ink-2">{children}</div>
    </section>
  );
}

/** Dates as one compact ruled row instead of a tall timeline. */
export function DateRow({ dates }: { dates: { label: string; value: string | null; note?: string | null }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-3">
      {dates.map((d) => (
        <div key={d.label} className="bg-surface px-4 py-3">
          <dt className="text-[13px] text-ink-3">{d.label}</dt>
          <dd className={`mt-0.5 text-[15.5px] ${d.value ? "font-semibold text-ink" : "text-ink-3"}`}>{d.value ?? "Not known"}</dd>
          {d.note && <dd className="text-[14px] text-ink-2">{d.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
