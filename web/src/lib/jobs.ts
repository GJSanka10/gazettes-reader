import fs from "node:fs";
import path from "node:path";
import type { GovVacancy, JobStatus, PrivateJob } from "./types";

/**
 * Both pipelines (scripts/ingest.py and scripts/private-ingest/) write to the
 * repo-root data/ directory, and that stays the single source of truth — the
 * app reads from there rather than keeping its own copy that could drift.
 *
 * Deployment note: process.cwd() is web/ in dev and build, so this resolves to
 * ../data. A real deploy will need the data inside the Next project root (or a
 * build-time copy step); flagged rather than pre-solved.
 */
const DATA_DIR = path.join(process.cwd(), "..", "data");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
  } catch {
    // Missing or malformed data is surfaced as an error state in the UI
    // (spec §43/§44) rather than crashing the route or faking a list.
    return null;
  }
}

/** Parse the closing-date strings the pipelines actually emit:
 *  "24 Sep 2026", "2026-09-24", or null. */
export function parseClosingDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function daysUntil(value?: string | null): number | null {
  const date = parseClosingDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

export function deriveStatus(closing?: string | null): JobStatus {
  const days = daysUntil(closing);
  if (days === null) return "open";
  if (days < 0) return "closed";
  if (days <= 2) return "urgent";
  if (days <= 14) return "soon";
  return "open";
}

export function getGovVacancies(): GovVacancy[] | null {
  const raw = readJson<{ vacancies?: GovVacancy[] }>("vacancies.json");
  if (!raw?.vacancies) return null;

  return raw.vacancies
    .filter((v) => v.titleEn)
    .map((v) => ({
      ...v,
      slug: v.slug || slugify(`${v.titleEn}-${v.instEn ?? ""}-${v.serial ?? ""}`),
      status: deriveStatus(v.dateEn ?? v.dateSi),
    }));
}

export function getPrivateJobs(): PrivateJob[] | null {
  const raw = readJson<{ vacancies?: PrivateJob[] }>("private-vacancies.json");
  if (!raw?.vacancies) return null;

  return raw.vacancies
    .filter((j) => j.titleEn)
    .map((j) => ({
      ...j,
      slug: j.slug || slugify(`${j.titleEn}-${j.employerName ?? ""}`),
      status: deriveStatus(j.closingDate),
    }));
}

export function getGovVacancyBySlug(slug: string): GovVacancy | null {
  return getGovVacancies()?.find((v) => v.slug === slug) ?? null;
}

export function getPrivateJobBySlug(slug: string): PrivateJob | null {
  return getPrivateJobs()?.find((j) => j.slug === slug) ?? null;
}

/** For a multi-select facet: does `value` match any of the comma-joined
 *  selections in the URL param? An empty/absent param matches everything. */
export function matchesAnyParam(value: string | undefined | null, param: string | undefined): boolean {
  if (!param) return true;
  if (!value) return false;
  return param.split(",").includes(value);
}

/** Distinct, sorted values for a facet — built from the data that actually
 *  exists rather than a hardcoded list (job.md §11.6). */
export function facetValues<T>(items: T[], pick: (item: T) => string | undefined | null): string[] {
  return [...new Set(items.map(pick).filter((v): v is string => Boolean(v && v.trim())))].sort(
    (a, b) => a.localeCompare(b),
  );
}

/** Same, but with a real count per value — for the filter ledger's
 *  "(14)" style counters. Counts are always the true count in `items`,
 *  never invented (job.md: no fabricated stats in the UI). */
export function facetCounts<T>(
  items: T[],
  pick: (item: T) => string | undefined | null,
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const v = pick(item);
    if (v && v.trim()) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/** Top-level `updatedAt` written by the ingestion pipelines — the only
 *  honest "how fresh is this" signal we have (there is no single "current
 *  gazette edition" field in the data, so the masthead must not invent one). */
export function getGovUpdatedAt(): string | null {
  return readJson<{ updatedAt?: string }>("vacancies.json")?.updatedAt ?? null;
}

export function getPrivateUpdatedAt(): string | null {
  return readJson<{ updatedAt?: string }>("private-vacancies.json")?.updatedAt ?? null;
}

/** "3 hours ago" — real relative time from a real ISO timestamp. */
export function formatUpdatedAt(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  const diffMin = Math.round(diffMs / 60_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(-diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  return rtf.format(-diffDay, "day");
}

/** The single most urgent open government vacancy, for the header ticker.
 *  Real data only — if nothing is closing soon, the caller shows nothing.
 *  Returns the computed `days` alongside it so callers never need to
 *  re-derive it (and never need to import lib/jobs.ts client-side to do so). */
export function getMostUrgentGovVacancy(): { vacancy: GovVacancy; days: number } | null {
  const all = getGovVacancies();
  if (!all) return null;
  const withDays = all
    .filter((v) => v.status !== "closed")
    .map((v) => ({ vacancy: v, days: daysUntil(v.dateEn ?? v.dateSi) }))
    .filter((x): x is { vacancy: GovVacancy; days: number } => x.days !== null && x.days >= 0 && x.days <= 7)
    .sort((a, b) => a.days - b.days);
  return withDays[0] ?? null;
}
