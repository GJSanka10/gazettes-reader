"use client";

import Link from "next/link";
import { daysUntil, relativeDays } from "@/lib/dates";
import { useSavedJobs } from "@/lib/saved";
import { Icon } from "./Icon";
import { Panel } from "./Rail";

const SHOWN = 3;

/**
 * Your saved jobs at a glance, soonest closing first, so the list you're
 * building stays in view while you browse. Empty, it explains the bookmark.
 */
export function SavedPanel() {
  const saved = useSavedJobs();
  const active = saved
    .filter((j) => j.status !== "not-interested")
    .sort((a, b) => (daysUntil(a.closingDate) ?? 1e6) - (daysUntil(b.closingDate) ?? 1e6));

  if (saved.length === 0) {
    return (
      <Panel title="Your saved jobs">
        <p className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mark-soft text-ink">
            <Icon name="bookmark" className="text-[19px]" />
          </span>
          Tap the bookmark on any job to keep it here with its closing date. Saved jobs stay on this device.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="Your saved jobs" action={{ href: "/saved", label: `All ${saved.length}` }}>
      <ul className="-mx-2">
        {active.slice(0, SHOWN).map((j) => {
          const days = daysUntil(j.closingDate);
          return (
            <li key={j.kind + j.slug}>
              <Link
                href={`/${j.kind === "gov" ? "government" : "private"}-jobs/${j.slug}`}
                className="block rounded-lg px-2 py-2 hover:bg-paper"
              >
                <span className="block text-[15px] font-semibold leading-snug text-ink">{j.title}</span>
                <span
                  className={`block text-[13.5px] ${days !== null && days >= 0 && days <= 7 ? "font-semibold text-hot" : "text-ink-3"}`}
                >
                  {j.closingDate ? relativeDays(days) : "No closing date"}
                  {j.status === "applied" && <span className="font-medium text-ok">, applied</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {active.length === 0 && (
        <p className="text-[14.5px] text-ink-2">Everything you saved is marked not interested.</p>
      )}
    </Panel>
  );
}
