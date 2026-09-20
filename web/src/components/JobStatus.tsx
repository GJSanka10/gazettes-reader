import type { JobStatus as Status } from "@/lib/types";
import { daysUntil } from "@/lib/jobs";
import { Icon } from "./Icon";

/** Spec §20 + §23: never communicate status by colour alone — every state
 *  carries a word. Badges are used sparingly; only urgency and closure earn one.
 *  Urgent = the design system's "Closing Date Tag": a filled crimson square
 *  badge with a preceding square indicator — crimson is reserved strictly for
 *  deadlines/urgency in this system, never used elsewhere. */
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
        className={`font-ui inline-flex items-center gap-1 border border-rule-strong px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft ${className}`}
      >
        <Icon name="lock" className="text-[13px]" />
        Closed
      </span>
    );
  }

  if (days === null) {
    return (
      <span className={`font-ui text-[13px] text-ink-faint ${className}`}>No closing date given</span>
    );
  }

  if (days <= 2) {
    return (
      <span
        className={`font-ui inline-flex items-center gap-1.5 border border-stamp bg-stamp-wash px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stamp ${className}`}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-stamp" />
        {days <= 0 ? "Closes today" : days === 1 ? "Closes in 1 day" : `Closes in ${days} days`}
      </span>
    );
  }

  return (
    <span className={`font-ui text-[13px] text-ink-soft ${className}`}>
      {days <= 14 ? `Closes in ${days} days` : "Open"}
    </span>
  );
}

/** Spec §21: the platform's own summary must be visually distinct from the
 *  official source it was derived from. "Verified" reads as an official
 *  seal — gold, this system's colour for prestige/official marks. */
export function SourceBadge({ verified }: { verified?: boolean }) {
  if (!verified) {
    return (
      <span className="font-ui inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-faint">
        Pending review
      </span>
    );
  }
  return (
    <span className="font-ui inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-verified">
      <Icon name="verified" className="text-[13px]" />
      Verified against source
    </span>
  );
}
