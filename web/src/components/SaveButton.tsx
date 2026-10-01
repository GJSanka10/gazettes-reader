"use client";

import { m } from "motion/react";
import { useState } from "react";
import { isSaved, toggleSaved, useSavedJobs, type SavedJob } from "@/lib/saved";
import { Icon } from "./Icon";
import { announceSave } from "./Toaster";

type Job = Omit<SavedJob, "savedAt" | "status">;

/**
 * Bookmark a job in this browser. `compact` is the icon-only form used in feed
 * rows; it sits above the row's full-size link, so it stays independently
 * clickable. It presses in under a tap, and the icon pops on save to confirm
 * it (MotionConfig drops the scale for people who prefer reduced motion).
 */
export function SaveButton({ job, compact = false }: { job: Job; compact?: boolean }) {
  const list = useSavedJobs();
  const saved = isSaved(list, job.slug, job.kind);
  const [popKey, setPopKey] = useState(0);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(job);
    announceSave(job, !saved);
    if (!saved) setPopKey((k) => k + 1);
  };

  const label = saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`;

  if (compact) {
    return (
      <m.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        aria-pressed={saved}
        aria-label={label}
        title={saved ? "Saved" : "Save job"}
        className={`relative z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md transition-colors ${
          saved ? "bg-mark text-on-mark" : "text-ink-3 hover:bg-sunk hover:text-ink"
        }`}
      >
        <Pop run={popKey}>
          <Icon name="bookmark" filled={saved} className="text-[22px]" />
        </Pop>
      </m.button>
    );
  }

  return (
    <m.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      aria-pressed={saved}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-[15px] font-bold transition-colors ${
        saved ? "border-mark bg-mark text-on-mark" : "border-ink bg-ink text-paper hover:opacity-90"
      }`}
    >
      <Pop run={popKey}>
        <Icon name="bookmark" filled={saved} className="text-[20px]" />
      </Pop>
      {saved ? "Saved" : "Save job"}
    </m.button>
  );
}

/** Replays a quick overshoot each time `run` goes up; still at 0. */
function Pop({ run, children }: { run: number; children: React.ReactNode }) {
  return (
    <m.span
      key={run}
      className="inline-flex"
      animate={run ? { scale: [1, 1.4, 0.94, 1] } : undefined}
      transition={{ duration: 0.36, ease: "easeOut" }}
    >
      {children}
    </m.span>
  );
}

/**
 * Share a job the way notices actually travel in Sri Lanka: WhatsApp first,
 * the phone's own share sheet where there is one, and copy-link as the fallback.
 */
export function ShareButtons({ title, org, path }: { title: string; org: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window === "undefined" ? path : new URL(path, window.location.origin).toString());
  const text = () => `${title} — ${org}\n${url()}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing to do, the link is still in the address bar.
    }
  };

  return (
    // `contents`: the two buttons join the caller's own flex row instead of
    // wrapping as one block, so a phone fits Save and both shares on one line.
    <div className="contents">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${org}\n${path}`)}`}
        onClick={(e) => {
          e.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(text())}`;
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-rule-2 bg-surface px-4 text-[15px] font-semibold text-ink hover:border-ink"
      >
        <Icon name="chat" className="text-[19px]" />
        <span className="hidden sm:inline">Share on WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Link copied" : "Copy link"}
        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-rule-2 bg-surface px-3 text-[15px] font-semibold text-ink hover:border-ink sm:px-4"
      >
        <Icon name={copied ? "check" : "link"} className="text-[19px]" />
        <span aria-live="polite" className="hidden sm:inline">
          {copied ? "Link copied" : "Copy link"}
        </span>
      </button>
    </div>
  );
}
