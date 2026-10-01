"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { daysUntil } from "@/lib/dates";
import { removeSaved, setSavedStatus, useSavedJobs, type SavedJob, type SavedStatus } from "@/lib/saved";
import { Icon } from "./Icon";
import { Countdown } from "./JobStatus";
import { buttonClass } from "./Chrome";
import { EASE_IN, SPRING } from "./MotionProvider";

const TABS = [
  { id: "all", label: "All saved" },
  { id: "soon", label: "Closing soon" },
  { id: "applied", label: "Applied" },
] as const;

const STATUS_LABEL: Record<SavedStatus, string> = {
  interested: "Interested",
  applied: "Applied",
  "not-interested": "Not interested",
};

function closingOrder(a: SavedJob, b: SavedJob) {
  const da = daysUntil(a.closingDate);
  const db = daysUntil(b.closingDate);
  const rank = (d: number | null) => (d === null ? 1e6 : d < 0 ? 1e7 + -d : d);
  return rank(da) - rank(db);
}

function closingSoon(j: SavedJob) {
  const d = daysUntil(j.closingDate);
  return d !== null && d >= 0 && d <= 7 && j.status !== "not-interested";
}

export function SavedList() {
  const saved = useSavedJobs();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");

  const counts = {
    all: saved.length,
    soon: saved.filter(closingSoon).length,
    applied: saved.filter((j) => j.status === "applied").length,
  };

  const shown = [...saved]
    .filter((j) => (tab === "applied" ? j.status === "applied" : tab === "soon" ? closingSoon(j) : true))
    .sort(closingOrder);

  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rule-2 px-6 py-12">
        <h2 className="title text-[22px] text-ink">No saved jobs yet</h2>
        <p className="mt-1.5 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">
          Tap the bookmark on any vacancy to keep it here with its closing date. Saved jobs stay in this browser on
          this device.
        </p>
        <Link href="/government-jobs" className={`${buttonClass.solid} mt-6`}>
          Browse government vacancies
        </Link>
      </div>
    );
  }

  return (
    <>
      <div role="tablist" aria-label="Saved jobs" className="inline-flex rounded-lg bg-sunk p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative h-10 cursor-pointer rounded-md px-4 text-[15px] font-semibold transition-colors ${
              tab === t.id ? "text-on-mark" : "text-ink-2 hover:text-ink"
            }`}
          >
            {/* One highlight that slides between tabs, so the eye follows it. */}
            {tab === t.id && (
              <m.span layoutId="saved-tab" transition={SPRING} className="absolute inset-0 rounded-md bg-mark" />
            )}
            <span className="relative">
              {t.label}
              <span className={`nums ml-1.5 font-medium ${tab === t.id ? "text-on-mark/75" : "text-ink-3"}`}>
                {counts[t.id]}
              </span>
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-[16px] text-ink-2">
          {tab === "applied"
            ? "Nothing marked as applied yet. Change a job's status once you've sent your application."
            : "None of your saved jobs close in the next 7 days."}
        </p>
      ) : (
        <ul role="tabpanel" className="relative mt-5 divide-y divide-rule overflow-hidden rounded-2xl border border-rule bg-surface">
          {/* Removing a job lets it fade out while the rest close the gap. */}
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((j) => {
              const href = `/${j.kind === "gov" ? "government" : "private"}-jobs/${j.slug}`;
              return (
                <m.li
                  key={j.kind + j.slug}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  // Opacity lives here, not in a class: motion's inline style would override it.
                  animate={{ opacity: j.status === "not-interested" ? 0.6 : 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.16, ease: EASE_IN } }}
                  transition={SPRING}
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 gap-y-3 px-4 py-5 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-6"
                >
                  <Countdown closingDate={j.closingDate} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-3">{j.kind === "gov" ? "Government job" : "Private job"}</p>
                    <Link
                      href={href}
                      className="title text-[19px] leading-snug text-ink decoration-mark decoration-[3px] underline-offset-[5px] hover:underline"
                    >
                      {j.title}
                    </Link>
                    <p className="text-[15px] text-ink-2">{j.org}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:self-center">
                    <label className="relative inline-flex items-center">
                      <span className="sr-only">Status for {j.title}</span>
                      <select
                        value={j.status}
                        onChange={(e) => setSavedStatus(j.slug, j.kind, e.target.value as SavedStatus)}
                        className={`h-10 cursor-pointer appearance-none rounded-md border pl-3 pr-9 text-[14px] font-semibold hover:border-ink ${
                          j.status === "applied" ? "border-ink bg-ink text-paper" : "border-rule-2 bg-surface text-ink"
                        }`}
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Icon
                        name="expand_more"
                        className={`pointer-events-none absolute right-2.5 text-[18px] ${j.status === "applied" ? "text-paper/70" : "text-ink-3"}`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSaved(j.slug, j.kind)}
                      aria-label={`Remove ${j.title} from saved jobs`}
                      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-ink-3 hover:bg-sunk hover:text-ink"
                    >
                      <Icon name="close" className="text-[20px]" />
                    </button>
                  </div>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      <p className="mt-6 text-[14px] text-ink-3">Saved jobs are stored in this browser only. Clearing site data removes them.</p>
    </>
  );
}
