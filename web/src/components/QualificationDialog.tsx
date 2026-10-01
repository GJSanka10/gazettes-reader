"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LADDER } from "@/lib/labels";
import { Icon } from "./Icon";
import { EASE_IN } from "./MotionProvider";

/** Five rising bars, filled up to `level`: the qualification ladder in miniature. */
export function LevelGlyph({ level, className = "" }: { level: number | null; className?: string }) {
  return (
    <svg viewBox="0 0 30 20" aria-hidden="true" className={`h-5 w-[30px] shrink-0 ${className}`}>
      {LADDER.map((_, i) => {
        const h = 6 + i * 3.5;
        return (
          <rect
            key={i}
            x={i * 6}
            y={20 - h}
            width="4.5"
            height={h}
            rx="1"
            className={level !== null && i <= level ? "fill-current" : "fill-current opacity-20"}
          />
        );
      })}
    </svg>
  );
}

/**
 * Asks once, on a first visit, which qualification the person has, so the
 * homepage can lead with posts they could apply for. One tap on an option
 * answers and closes. Skipping (button, Escape or the backdrop) is always one
 * tap away and is remembered, so it never nags. A bottom sheet on phones, a
 * centred card on wider screens. Focus stays inside while open and returns
 * where it came from.
 */
export function QualificationDialog({
  open,
  current,
  counts,
  onChoose,
  onSkip,
}: {
  open: boolean;
  /** The rung already chosen, if any, so reopening shows it selected. */
  current: number | null;
  /** Open posts per rung, cumulative (asking for that level or less). */
  counts: number[];
  onChoose: (rung: number) => void;
  onSkip: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  // Portals need document; this runs only after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && <Panel key="qualification" current={current} counts={counts} onChoose={onChoose} onSkip={onSkip} />}
    </AnimatePresence>,
    document.body,
  );
}

function Panel({
  current,
  counts,
  onChoose,
  onSkip,
}: {
  current: number | null;
  counts: number[];
  onChoose: (rung: number) => void;
  onSkip: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const onSkipRef = useRef(onSkip);
  useEffect(() => {
    onSkipRef.current = onSkip;
  });

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    const root = dialog.current;
    // Reopened with an answer: start on it. First visit: focus the dialog
    // itself, so the question is read out first and no option looks
    // preselected; Tab or the arrow keys then move through the options.
    const current = root?.querySelector<HTMLElement>('[aria-checked="true"]');
    (current ?? root)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkipRef.current();
        return;
      }
      if (e.key !== "Tab" || !root) return;
      // Keep Tab inside the dialog.
      const items = [...root.querySelectorAll<HTMLElement>("button:not([disabled])")];
      const first = items[0];
      const last = items[items.length - 1];
      if (document.activeElement === root) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      returnTo?.focus?.();
    };
  }, []);

  // Arrow keys move between options, like any radio group.
  const onOptionKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const opts = dialog.current?.querySelectorAll<HTMLElement>("[role=radio]");
    opts?.[(i + d + LADDER.length) % LADDER.length]?.focus();
  };

  const [wide] = useState(() => window.matchMedia("(min-width: 640px)").matches);
  const hidden = wide ? { opacity: 0, scale: 0.96, y: 8 } : { opacity: 0, y: 80 };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <m.div
        aria-hidden="true"
        onClick={onSkip}
        className="absolute inset-0 bg-ink/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_IN } }}
      />
      <m.div
        ref={dialog}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="qual-title"
        aria-describedby="qual-desc"
        initial={hidden}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 420, damping: 36 } }}
        exit={{ ...hidden, transition: { duration: 0.16, ease: EASE_IN } }}
        className="relative flex max-h-[92vh] w-full flex-col outline-none overflow-hidden rounded-t-2xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-lift sm:max-w-[520px] sm:rounded-2xl sm:pb-0"
      >
        {/* A grab handle says "this is a sheet" on phones. */}
        <span aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-rule-2 sm:hidden" />

        <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-4 sm:px-7 sm:pt-7">
          <div>
            <h2 id="qual-title" className="title text-[22px] leading-tight text-ink sm:text-[24px]">
              What&rsquo;s your highest qualification?
            </h2>
            <p id="qual-desc" className="mt-1.5 text-[15px] leading-snug text-ink-2">
              We&rsquo;ll show the government jobs that ask for your level or less first. You can change this any time.
            </p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            aria-label="Close"
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-2 hover:bg-sunk hover:text-ink"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>

        <div role="radiogroup" aria-labelledby="qual-title" className="space-y-2 overflow-y-auto px-5 py-4 sm:px-7">
          {LADDER.map((s, i) => {
            const checked = current === i;
            const n = counts[i] ?? 0;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked || (current === null && i === 0) ? 0 : -1}
                onClick={() => onChoose(i)}
                onKeyDown={(e) => onOptionKey(e, i)}
                className={`group flex min-h-[64px] w-full cursor-pointer items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                  checked
                    ? "border-ink bg-mark text-on-mark"
                    : "border-rule bg-surface text-ink hover:border-ink hover:bg-mark-soft"
                }`}
              >
                <LevelGlyph level={i} className={checked ? "text-on-mark" : "text-ink"} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-bold leading-tight">{s.name}</span>
                  <span className={`block text-[14px] leading-snug ${checked ? "text-on-mark/75" : "text-ink-3"}`}>
                    {s.hint}
                  </span>
                </span>
                <span
                  className={`nums shrink-0 rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                    checked ? "bg-on-mark/10" : n ? "bg-paper text-ink-2" : "bg-paper text-ink-3"
                  }`}
                >
                  {n} {n === 1 ? "job" : "jobs"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-rule px-5 py-3 sm:px-7 sm:py-4">
          <button
            type="button"
            onClick={onSkip}
            className="-ml-2 min-h-11 cursor-pointer rounded-md px-2 text-[15px] font-semibold text-ink-2 underline underline-offset-4 hover:text-ink"
          >
            Skip, show all jobs
          </button>
          <p className="flex items-center gap-1.5 text-[13px] text-ink-3">
            <Icon name="lock" className="text-[15px]" />
            Saved on this device only
          </p>
        </div>
      </m.div>
    </div>
  );
}
