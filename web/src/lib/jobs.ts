import fs from "node:fs";
import path from "node:path";
import type { GovVacancy, JobStatus, PrivateJob } from "./types";
import { daysUntil, parseClosingDate } from "./dates";
import { QUALIFICATION_LABEL } from "./labels";

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

function slugify(input: string, max = 80): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  if (slug.length <= max) return slug;
  // Cut at a word boundary, never mid-word.
  const cut = slug.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf("-") > 0 ? cut.lastIndexOf("-") : max);
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

export { daysUntil, parseClosingDate } from "./dates";

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
      // The serial is appended whole, after the word-boundary cut, so two notices
      // with the same long title and institution can never share a URL.
      slug: v.slug || [slugify(`${v.titleEn}-${v.instEn ?? ""}`, 70), v.serial && slugify(v.serial)].filter(Boolean).join("-"),
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

/** One closing date from either collection — the unit the homepage runway
 *  and "closing next" list are built from. */
export interface DeadlineEntry {
  kind: "gov" | "pvt";
  slug: string;
  title: string;
  org: string;
  date: Date;
  days: number;
}

export function getUpcomingDeadlines(withinDays: number): DeadlineEntry[] {
  const out: DeadlineEntry[] = [];
  for (const v of getGovVacancies() ?? []) {
    const raw = v.dateEn ?? v.dateSi;
    const date = parseClosingDate(raw);
    const days = daysUntil(raw);
    if (date && days !== null && days >= 0 && days < withinDays)
      out.push({ kind: "gov", slug: v.slug, title: v.titleEn, org: v.instEn, date, days });
  }
  for (const j of getPrivateJobs() ?? []) {
    const date = parseClosingDate(j.closingDate);
    const days = daysUntil(j.closingDate);
    if (date && days !== null && days >= 0 && days < withinDays)
      out.push({ kind: "pvt", slug: j.slug, title: j.titleEn, org: j.employerName, date, days });
  }
  return out.sort((a, b) => a.days - b.days || a.kind.localeCompare(b.kind));
}

/** "New" means this site first picked the vacancy up within the last week. It
 *  says nothing about when the Gazette printed it — that's `publishedDate`. */
export const NEW_WINDOW_DAYS = 7;

export function isNew(v: GovVacancy): boolean {
  if (!v.firstSeenAt) return false;
  const seen = new Date(v.firstSeenAt).getTime();
  return !Number.isNaN(seen) && Date.now() - seen <= NEW_WINDOW_DAYS * 86_400_000;
}

/** The most recent Gazette issue we hold vacancies from, if any. Null until the
 *  pipeline has ingested a real Part I : Section (IIA) issue — callers must fall
 *  back to "latest update" wording rather than invent an edition. */
export function getLatestGazetteIssue(): { number: string | null; date: string; vacancies: GovVacancy[] } | null {
  const fromGazette = (getGovVacancies() ?? []).filter((v) => v.sourceKind === "gazette" && v.publishedDate);
  if (!fromGazette.length) return null;
  const latest = fromGazette.map((v) => v.publishedDate!).sort().at(-1)!;
  const inIssue = fromGazette.filter((v) => v.publishedDate === latest);
  return { number: inIssue.find((v) => v.gazetteNumber)?.gazetteNumber ?? null, date: latest, vacancies: inIssue };
}

/* ---------- Listing filters ------------------------------------------------ */

export { JOB_TYPE_LABEL, QUALIFICATION_LABEL, SOURCE_LABEL } from "./labels";

/** Organisation type, grouped by keywords in the institution's name. The UI
 *  labels it as grouped by name, since no official register backs it. */
export function orgTypeOf(inst?: string | null): string {
  const n = (inst ?? "").toLowerCase();
  if (!n) return "Other institutions";
  if (n.includes("ministry")) return "Ministries";
  if (n.includes("university")) return "Universities";
  if (n.includes("provincial council") || n.includes("provincial")) return "Provincial councils";
  if (n.includes("department") || n.includes("secretariat")) return "Departments";
  if (/(board|corporation|authority|commission|bank|limited|ltd|company)/.test(n)) return "State institutions";
  return "Other institutions";
}

/** Every job-type tag that applies: the employment term plus how selection works. */
export function jobTypesOf(v: GovVacancy): string[] {
  const out: string[] = [];
  if (v.employmentTerm) out.push(v.employmentTerm);
  if (v.examType === "open") out.push("open-exam");
  if (v.examType === "limited") out.push("limited-exam");
  if (v.examType === "none") out.push("interview-only");
  return out;
}

/** Like facetCounts, for fields that hold several values per item. */
export function facetCountsMulti<T>(items: T[], pick: (item: T) => string[]): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) for (const v of new Set(pick(item))) if (v.trim()) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value));
}

export interface GovFilters {
  search?: string;
  category?: string;
  institution?: string;
  org?: string;
  qualification?: string;
  location?: string;
  term?: string;
  source?: string;
  closing?: string;
  published?: string;
}

export const GOV_FILTER_KEYS: (keyof GovFilters)[] = [
  "search", "category", "institution", "org", "qualification", "location", "term", "source", "closing", "published",
];

function searchHaystack(v: GovVacancy): string {
  return [
    v.titleEn, v.instEn, v.category, v.tag, v.qualEn, v.descEn, v.citation, v.selectionMethod,
    v.gazetteNumber && `gazette ${v.gazetteNumber} ${v.gazetteNumber.replace(/,/g, "")}`,
    v.qualificationLevel && QUALIFICATION_LABEL[v.qualificationLevel],
    ...(v.locations ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** One place that applies every listing filter, so the empty state can ask
 *  "what if this one filter were removed?" using exactly the same rules. */
export function applyGovFilters(all: GovVacancy[], f: GovFilters): GovVacancy[] {
  const within = (value: string | null | undefined, limit: string | undefined, past: boolean) => {
    const d = daysUntil(value);
    if (d === null) return false;
    return past ? d <= 0 && d >= -Number(limit) : d >= 0 && d <= Number(limit);
  };
  return all.filter((v) => {
    if (f.search) {
      const hay = searchHaystack(v);
      if (!f.search.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t))) return false;
    }
    if (f.category && !matchesAnyParam(v.category, f.category)) return false;
    if (f.institution && v.instEn !== f.institution) return false;
    if (f.org && !matchesAnyParam(orgTypeOf(v.instEn), f.org)) return false;
    if (f.qualification && !matchesAnyParam(v.qualificationLevel, f.qualification)) return false;
    if (f.location && !(v.locations ?? []).some((l) => matchesAnyParam(l, f.location))) return false;
    if (f.term && !jobTypesOf(v).some((t) => matchesAnyParam(t, f.term))) return false;
    if (f.source && !matchesAnyParam(v.sourceKind, f.source)) return false;
    if (f.closing && !within(v.dateEn ?? v.dateSi, f.closing, false)) return false;
    if (f.published && !within(v.publishedDate, f.published, true)) return false;
    return true;
  });
}
