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

/** Distinct, sorted values for a facet — built from the data that actually
 *  exists rather than a hardcoded list (job.md §11.6). */
export function facetValues<T>(items: T[], pick: (item: T) => string | undefined | null): string[] {
  return [...new Set(items.map(pick).filter((v): v is string => Boolean(v && v.trim())))].sort(
    (a, b) => a.localeCompare(b),
  );
}
