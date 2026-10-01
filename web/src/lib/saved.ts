"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved jobs, kept in this browser only (no accounts yet — see the design
 * brief §13). Every storage access is wrapped: private windows, blocked site
 * data and quota errors must never break the page, they just mean nothing is
 * remembered.
 */

export type SavedStatus = "interested" | "applied" | "not-interested";

export interface SavedJob {
  slug: string;
  kind: "gov" | "pvt";
  title: string;
  org: string;
  closingDate: string | null;
  savedAt: string;
  status: SavedStatus;
}

const KEY = "tlg:saved:v1";
const EVENT = "tlg:saved-change";
const EMPTY: SavedJob[] = [];

let cache: SavedJob[] | null = null;

function read(): SavedJob[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: SavedJob[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: keep the in-memory copy for this visit.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null; // another tab changed it
      onChange();
    }
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** All saved jobs. Empty during server render and before hydration. */
export function useSavedJobs(): SavedJob[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function isSaved(list: SavedJob[], slug: string, kind: SavedJob["kind"]) {
  return list.some((j) => j.slug === slug && j.kind === kind);
}

export function toggleSaved(job: Omit<SavedJob, "savedAt" | "status">) {
  const list = read();
  if (isSaved(list, job.slug, job.kind)) {
    write(list.filter((j) => !(j.slug === job.slug && j.kind === job.kind)));
  } else {
    write([{ ...job, savedAt: new Date().toISOString(), status: "interested" }, ...list]);
  }
}

export function setSavedStatus(slug: string, kind: SavedJob["kind"], status: SavedStatus) {
  write(read().map((j) => (j.slug === slug && j.kind === kind ? { ...j, status } : j)));
}

export function removeSaved(slug: string, kind: SavedJob["kind"]) {
  write(read().filter((j) => !(j.slug === slug && j.kind === kind)));
}
