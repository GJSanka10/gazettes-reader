"use client";

import { useSyncExternalStore } from "react";
import { LADDER } from "./labels";

/**
 * The person's highest qualification, as a rung index into LADDER, kept in
 * this browser only. Three states:
 *   undefined  not known yet (server render, before hydration)
 *   null       never asked, so the homepage may ask once
 *   "skipped"  asked and declined: never ask again unprompted
 *   0..4       the chosen rung
 * Storage access is wrapped: a private window just means nothing is kept.
 */
export type Level = number | "skipped" | null;

const KEY = "tlg:rung:v1";
const EVENT = "tlg:level-change";

// Fallback for when storage is blocked: remembered for this visit only.
let memory: Level = null;

function read(): Level {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return memory;
    if (raw === "skipped") return "skipped";
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 && n < LADDER.length ? n : null;
  } catch {
    return memory;
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLevel(): Level | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function setLevel(level: number | "skipped") {
  memory = level;
  try {
    window.localStorage.setItem(KEY, String(level));
  } catch {
    // Not remembered this visit; the filter still applies via the event.
  }
  window.dispatchEvent(new Event(EVENT));
}
