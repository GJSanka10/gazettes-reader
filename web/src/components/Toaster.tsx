"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toggleSaved, type SavedJob } from "@/lib/saved";
import { Icon } from "./Icon";
import { EASE_IN, SPRING } from "./MotionProvider";

const EVENT = "tlg:toast";

type Job = Omit<SavedJob, "savedAt" | "status">;

interface Toast {
  id: number;
  saved: boolean;
  job: Job;
}

/** Tell the page a job was just saved or removed, so it can confirm it. */
export function announceSave(job: Job, saved: boolean) {
  window.dispatchEvent(new CustomEvent<Omit<Toast, "id">>(EVENT, { detail: { job, saved } }));
}

/**
 * One confirmation at a time, above the phone's bottom bar: what happened,
 * how to undo it, and where saved jobs live. Stays up for six seconds, longer
 * while hovered or focused so the Undo can still be reached.
 */
export function Toaster() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [held, setHeld] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    const on = (e: Event) => {
      const detail = (e as CustomEvent<Omit<Toast, "id">>).detail;
      setToast({ ...detail, id: ++seq.current });
      setHeld(false);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  useEffect(() => {
    if (!toast || held) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast, held]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-6"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <m.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.15, ease: EASE_IN } }}
            role="status"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
            className="pointer-events-auto flex w-full max-w-[480px] items-center gap-3 rounded-xl bg-ink py-2.5 pl-3 pr-2 text-paper shadow-lift ring-1 ring-paper/20"
          >
            <span
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toast.saved ? "bg-mark text-on-mark" : "bg-paper/15"}`}
            >
              <Icon name="bookmark" filled={toast.saved} className="text-[20px]" />
            </span>
            <p className="min-w-0 flex-1 text-[15px] leading-snug">
              {toast.saved ? "Saved to your list." : "Removed from your saved jobs."}
            </p>
            <button
              type="button"
              onClick={() => {
                toggleSaved(toast.job);
                setToast(null);
              }}
              className="h-10 shrink-0 cursor-pointer rounded-md px-3 text-[14px] font-bold text-paper hover:bg-paper/10"
            >
              Undo
            </button>
            {toast.saved && (
              <Link
                href="/saved"
                onClick={() => setToast(null)}
                className="inline-flex h-10 shrink-0 items-center rounded-md bg-mark px-3 text-[14px] font-bold text-on-mark hover:brightness-95"
              >
                View
                <span className="sr-only"> saved jobs</span>
              </Link>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
