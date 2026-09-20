import type { JobStatus as Status } from "@/lib/types";
import { daysUntil } from "@/lib/jobs";

/** Spec §20 + §23: never communicate status by colour alone — every state
 *  carries a word. Badges are used sparingly; only urgency and closure earn one. */
export function JobStatusLabel({
  status,
  closingDate,
  className = "",
}: {
  status?: Status;
  closingDate?: string | null;
  className?: string;
}) {
  const days = daysUntil(closingDate);

  if (status === "closed") {
    return (
      <span
        className={`inline-flex items-center border border-rule-strong px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-soft ${className}`}
      >
        Closed
      </span>
    );
  }

  if (days === null) {
    return <span className={`text-[13px] text-ink-faint ${className}`}>No closing date given</span>;
  }

  if (days <= 2) {
    return (
      <span
        className={`inline-flex items-center border border-stamp px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-stamp ${className}`}
      >
        {days <= 0 ? "Closes today" : days === 1 ? "Closes in 1 day" : `Closes in ${days} days`}
      </span>
    );
  }

  return (
    <span className={`text-[13px] text-ink-soft ${className}`}>
      {days <= 14 ? `Closes in ${days} days` : "Open"}
    </span>
  );
}

/** Spec §21: the platform's own summary must be visually distinct from the
 *  official source it was derived from. */
export function SourceBadge({ verified }: { verified?: boolean }) {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        Pending review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-verified">
      Verified against source
    </span>
  );
}
