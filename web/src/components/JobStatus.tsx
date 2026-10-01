import { dayParts, daysUntil, heatFor, parseClosingDate, relativeDays, type Heat } from "@/lib/dates";

const NUMERAL_TONE: Record<Heat, string> = {
  hot: "text-hot",
  warm: "text-hot",
  cool: "text-ink",
  none: "text-ink-3",
  past: "text-ink-3",
};

/**
 * The countdown that leads every listing: days left as a condensed numeral,
 * departure-board style, with the words and the date beneath. Red only when
 * the post closes within a week. The accessible name always carries the full
 * date and the words, never the colour alone.
 */
export function Countdown({
  closingDate,
  fallback,
  size = "row",
}: {
  closingDate?: string | null;
  /** Shown when there is no closing date, e.g. an employer monogram. */
  fallback?: string;
  size?: "row" | "lg";
}) {
  const date = parseClosingDate(closingDate);
  const days = daysUntil(closingDate);
  const heat = heatFor(days);
  const lg = size === "lg";
  const numeral = lg ? "text-[96px]" : "text-[46px]";
  const word = lg ? "text-[64px]" : "text-[30px]";

  if (!date || days === null) {
    return (
      <div role="img" aria-label="No closing date given" className="flex flex-col">
        <span className={`count ${fallback ? word : numeral} text-ink-3`}>{fallback ?? "–"}</span>
        <span className={`mt-1.5 text-ink-3 ${lg ? "text-[15px]" : "text-[13px]"} leading-tight`}>No closing date</span>
      </div>
    );
  }

  const p = dayParts(date);
  const big = days < 0 ? "Closed" : days === 0 ? "Today" : String(days);
  const small = days < 0 ? `Closed ${p.day} ${p.month}` : days === 0 ? "closes today" : days === 1 ? "day left" : "days left";

  return (
    <div role="img" aria-label={`${p.long}. ${relativeDays(days)}`} className="flex flex-col">
      <span className={`count ${days > 0 ? numeral : word} ${NUMERAL_TONE[heat]}`}>{big}</span>
      <span
        className={`mt-1.5 inline-flex items-center gap-1.5 font-semibold leading-tight ${NUMERAL_TONE[heat]} ${lg ? "text-[15px]" : "text-[13px]"}`}
      >
        {/* Only the last two days pulse, so the motion keeps meaning something. */}
        {days >= 0 && days <= 1 && <span aria-hidden="true" className="pulse-dot shrink-0" />}
        {small}
      </span>
      {days >= 0 && (
        <span className={`leading-tight text-ink-3 ${lg ? "mt-0.5 text-[15px]" : "text-[13px]"}`}>
          {lg ? p.long : `${p.weekday} ${p.day} ${p.month}`}
        </span>
      )}
    </div>
  );
}

const WORDS_TONE: Record<Heat, string> = {
  hot: "font-semibold text-hot",
  warm: "font-semibold text-hot",
  cool: "text-ink-2",
  none: "text-ink-3",
  past: "text-ink-3",
};

/** The deadline in words. Colour only reinforces what the words already say. */
export function DeadlinePill({ closingDate, className = "" }: { closingDate?: string | null; className?: string }) {
  const heat = heatFor(daysUntil(closingDate));
  return (
    <span className={`text-[14px] ${WORDS_TONE[heat]} ${className}`}>{relativeDays(daysUntil(closingDate))}</span>
  );
}

/** Whether a person has checked this summary against the source. Plain text:
 *  it is a note about provenance, not a medal. */
export function SourceBadge({
  verified,
  sourceKind,
  className = "",
}: {
  verified?: boolean;
  sourceKind?: "gazette" | "institution-notice";
  className?: string;
}) {
  // Name the document that was actually checked: most listings are an
  // institution's own notice, and saying "Gazette" there would overclaim.
  return verified ? (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-ok ${className}`}>
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm3.3 5.3L7 9.6 4.7 7.3 3.6 8.4 7 11.8l5.4-5.4-1.1-1.1Z" />
      </svg>
      {sourceKind === "gazette" ? "Checked against the Gazette" : "Checked against the source notice"}
    </span>
  ) : (
    <span className={`text-[13px] text-ink-3 ${className}`}>Not yet checked against the source</span>
  );
}
