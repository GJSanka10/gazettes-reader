"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { GovVacancy } from "@/lib/types";
import { LADDER, rungOf } from "@/lib/labels";
import { setLevel, useLevel } from "@/lib/level";
import { Sheet, VacancyRow, VacancyRowBody, vacancyRowClass } from "./Feed";
import { EASE_IN, SPRING } from "./MotionProvider";
import { LevelGlyph, QualificationDialog } from "./QualificationDialog";

export interface FeedItem {
  v: GovVacancy;
  isNew: boolean;
}

/** How long a first-time visitor sees the page before we ask. */
const ASK_AFTER_MS = 650;

/**
 * The homepage: the intro band, then the newest vacancies, filtered by the
 * person's qualification. The qualification is asked once, in a dialog, on a
 * first visit (never on a job page someone was linked to), and after that
 * lives in a one-line bar above the list with a Change button. It filters by
 * what each notice asks for; it never says anyone is eligible.
 */
export function HomeFeed({
  intro,
  items,
  aside,
  children,
}: {
  intro: React.ReactNode;
  items: FeedItem[];
  /** The side column beside the feed on wide screens. */
  aside?: React.ReactNode;
  /** More sections under the feed, in the main column. */
  children?: React.ReactNode;
}) {
  const level = useLevel();
  const rung = typeof level === "number" ? level : null;
  const [open, setOpen] = useState(false);
  const asked = useRef(false);

  // First visit only: nothing stored yet (null, not "skipped" or a number).
  useEffect(() => {
    if (level !== null || asked.current) return;
    asked.current = true;
    const t = setTimeout(() => setOpen(true), ASK_AFTER_MS);
    return () => clearTimeout(t);
  }, [level]);

  const choose = (i: number) => {
    setLevel(i);
    setOpen(false);
  };
  // Closing without an answer: remember it on a first visit so we don't ask
  // again, but never wipe out an answer given before.
  const skip = () => {
    if (typeof level !== "number") setLevel("skipped");
    setOpen(false);
  };

  const counts = LADDER.map((_, i) =>
    items.filter(({ v }) => {
      const r = rungOf(v.qualificationLevel);
      return r !== null && r <= i;
    }).length,
  );
  const unknown = items.filter(({ v }) => rungOf(v.qualificationLevel) === null);
  const matched =
    rung === null
      ? items
      : items.filter(({ v }) => {
          const r = rungOf(v.qualificationLevel);
          return r !== null && r <= rung;
        });

  const step = rung === null ? null : LADDER[rung];
  const searchHref =
    step === null
      ? "/government-jobs"
      : `/government-jobs?qualification=${LADDER.slice(0, (rung ?? 0) + 1)
          .flatMap((s) => s.levels)
          .join(",")}`;

  return (
    <>
      <div className="border-b-2 border-ink bg-surface">
        <div className="mx-auto max-w-[1240px] px-4 pb-10 pt-10 md:px-8 md:pb-12 md:pt-14">{intro}</div>
      </div>

      <div className="mx-auto mt-8 grid grid-cols-[minmax(0,1fr)] max-w-[1240px] gap-10 px-4 md:mt-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <section aria-labelledby="feed-title">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 id="feed-title" className="title text-[26px] text-ink">
                {step ? `Posts asking for ${step.ask}` : "Newest vacancies"}
              </h2>
              <Link
                href={searchHref}
                className="hidden text-[15px] font-semibold text-ink underline decoration-mark decoration-[3px] underline-offset-[5px] hover:decoration-ink sm:inline"
              >
                {step ? "See these in full search" : "Search all government jobs"}
              </Link>
            </div>

            {/* The qualification, in one line instead of a panel. */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rule bg-surface py-2 pl-3.5 pr-2">
              <LevelGlyph level={rung} className="text-ink" />
              <p aria-live="polite" className="min-w-0 flex-1 text-[15px] leading-snug text-ink-2">
                {step ? (
                  <>
                    Your level: <strong className="font-bold text-ink">{step.name}</strong>.{" "}
                    <span className="text-ink-3">
                      {matched.length} of {items.length} open posts match.
                    </span>
                  </>
                ) : (
                  <>
                    Showing all {items.length} open {items.length === 1 ? "vacancy" : "vacancies"}, newest first
                  </>
                )}
              </p>
              <div className="flex items-center gap-1">
                {step && (
                  <button
                    type="button"
                    onClick={() => setLevel("skipped")}
                    className="h-10 cursor-pointer rounded-md px-3 text-[14px] font-semibold text-ink-2 hover:bg-sunk hover:text-ink"
                  >
                    Show all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-haspopup="dialog"
                  className="h-10 cursor-pointer rounded-md bg-mark px-3.5 text-[14px] font-bold text-on-mark hover:brightness-95"
                >
                  {step ? "Change" : "Filter by my qualification"}
                </button>
              </div>
            </div>

            {matched.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-rule-2 px-6 py-10">
                <p className="title text-[20px] text-ink">
                  {items.length === 0 ? "No open government vacancies right now" : "Nothing open at your level yet"}
                </p>
                <p className="mt-1 max-w-[56ch] text-[15px] text-ink-2">
                  {items.length === 0
                    ? "New ones appear here after the weekly Gazette update."
                    : "New notices arrive with each weekly update. Meanwhile, you can see every open vacancy."}
                </p>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLevel("skipped")}
                    className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-md border border-rule-2 bg-surface px-5 text-[15px] font-semibold text-ink hover:border-ink"
                  >
                    Show all {items.length} vacancies
                  </button>
                )}
              </div>
            ) : (
              <Sheet className="relative mt-4">
                {/* Rows that stop matching fade out; the rest slide to their new
                    places. No motion on first paint (initial={false}). popLayout
                    lifts exiting rows out of flow, hence the `relative` parent. */}
                <AnimatePresence initial={false} mode="popLayout">
                  {matched.map(({ v, isNew }, i) => (
                    <m.li
                      key={v.slug}
                      layout="position"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: i * 0.04 } }}
                      exit={{ opacity: 0, transition: { duration: 0.14, ease: EASE_IN } }}
                      className={vacancyRowClass(v)}
                    >
                      <VacancyRowBody v={v} isNew={isNew} />
                    </m.li>
                  ))}
                </AnimatePresence>
              </Sheet>
            )}

            {rung !== null && unknown.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[16px] font-bold text-ink">Qualification not captured</h3>
                <p className="text-[14px] text-ink-2">We couldn&rsquo;t read the level from these notices. Check them yourself.</p>
                <Sheet className="mt-3">
                  {unknown.map(({ v, isNew }) => (
                    <VacancyRow key={v.slug} v={v} isNew={isNew} />
                  ))}
                </Sheet>
              </div>
            )}
          </section>
          {children}
        </div>
        {aside && <aside className="space-y-5">{aside}</aside>}
      </div>

      <QualificationDialog open={open} current={rung} counts={counts} onChoose={choose} onSkip={skip} />
    </>
  );
}
