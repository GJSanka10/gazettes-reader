"use client";

import { useEffect, useRef, useState } from "react";

/** Lines of "notice text" per column, as widths in percent. */
const COL_A = [92, 78, 86, 64];
const COL_B = [88, 94, 70, 82, 58, 90, 76];
const AFTER_HIT = [84, 72];

/**
 * The homepage's one orchestrated moment, and what the site does in three
 * seconds: a Gazette page arrives, a highlighter sweeps the paragraph that
 * matters, and that paragraph lifts off the page as a job card, using the
 * newest real vacancy. Decorative (the same facts are in the feed), so it's
 * hidden from assistive tech. With reduced motion it shows the final frame.
 * Hovering or tapping replays it (hover alone would leave touch out).
 */
export function GazetteScan({
  title,
  org,
  days,
}: {
  title?: string;
  org?: string;
  /** Days until the closing date, when known. */
  days?: number | null;
}) {
  const [run, setRun] = useState(0);
  const startedAt = useRef(0);

  // The first play starts with the page; don't let an early hover cut it short.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const replay = () => {
    const now = Date.now();
    if (now - startedAt.current < 3800) return;
    startedAt.current = now;
    setRun((r) => r + 1);
  };

  const hot = days !== null && days !== undefined && days >= 0 && days <= 7;

  return (
    <div key={run} aria-hidden="true" onMouseEnter={replay} onClick={replay} className="scan cursor-pointer relative h-[292px] w-[392px] select-none">
      <div className="scan-page absolute left-0 top-0 h-[268px] w-[300px] rounded-md border border-rule bg-surface p-5 shadow-lift">
        <div className="mx-auto h-2.5 w-[46%] rounded-full bg-ink" />
        <div className="mt-2.5 h-[3px] bg-ink" />
        <div className="mt-[2px] h-px bg-ink" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {COL_A.map((w, i) => (
              <div key={i} className="scan-line h-[6px] rounded-full bg-sunk" style={{ width: `${w}%`, ["--i" as string]: i }} />
            ))}
            <div className="relative py-[3px]">
              <span className="scan-swipe absolute -inset-x-1 inset-y-0 rounded-[3px] bg-mark" />
              <div className="relative space-y-2">
                <div className="h-[6px] w-[96%] rounded-full bg-ink/70" />
                <div className="h-[6px] w-[88%] rounded-full bg-ink/70" />
                <div className="h-[6px] w-[70%] rounded-full bg-ink/70" />
              </div>
              <span className="scan-pen absolute top-[-14px] block">
                <span className="block h-[12px] w-[46px] rounded-[3px] bg-ink" />
                <span className="absolute left-[-9px] top-[2px] block h-[8px] w-[10px] rounded-l-[2px] bg-mark" />
              </span>
            </div>
            {AFTER_HIT.map((w, i) => (
              <div key={i} className="scan-line h-[6px] rounded-full bg-sunk" style={{ width: `${w}%`, ["--i" as string]: i + 5 }} />
            ))}
          </div>
          <div className="space-y-2">
            {COL_B.map((w, i) => (
              <div key={i} className="scan-line h-[6px] rounded-full bg-sunk" style={{ width: `${w}%`, ["--i" as string]: i + 1 }} />
            ))}
          </div>
        </div>
      </div>

      <div className="scan-card absolute bottom-0 right-0 grid w-[252px] grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border border-rule bg-surface p-4 shadow-lift">
        {days !== null && days !== undefined && days >= 0 ? (
          <div className="flex flex-col">
            <span className={`count text-[40px] ${hot ? "text-hot" : "text-ink"}`}>{days === 0 ? "0" : days}</span>
            <span className={`mt-1 text-[11.5px] font-semibold leading-tight ${hot ? "text-hot" : "text-ink-2"}`}>
              {days === 0 ? "closes today" : days === 1 ? "day left" : "days left"}
            </span>
          </div>
        ) : (
          <span className="block h-10 w-8 rounded bg-sunk" />
        )}
        <div className="min-w-0">
          <span className="marked inline-flex h-[20px] items-center rounded-[4px] px-1.5 text-[11.5px] font-bold">New</span>
          {title ? (
            <>
              <p className="mt-1 line-clamp-2 text-[14.5px] font-bold leading-snug text-ink">{title}</p>
              {org && <p className="truncate text-[12.5px] text-ink-3">{org}</p>}
            </>
          ) : (
            <div className="mt-2 space-y-1.5">
              <div className="h-2.5 w-[90%] rounded-full bg-ink/70" />
              <div className="h-2 w-[60%] rounded-full bg-sunk" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
