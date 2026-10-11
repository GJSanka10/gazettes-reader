import type { GovVacancy, PrivateJob } from "./types";
import { parseClosingDate, shortDate } from "./dates";
import { QUALIFICATION_LABEL } from "./labels";
import { parseSalaryLKR } from "./salary";
import { absoluteUrl } from "./site";

/**
 * Structured data and search snippets for job pages. Everything here is built
 * only from what the notice or posting actually states: a field we don't have
 * is left out, never guessed. Google for Jobs reads the JobPosting; the
 * BreadcrumbList gives the "Home > Government jobs > ..." trail in results.
 */

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** End of the closing day, Sri Lanka time, as Google expects for validThrough. */
function validThrough(value?: string | null) {
  const d = parseClosingDate(value);
  return d ? `${isoDay(d)}T23:59:59+05:30` : undefined;
}

const GOV_EMPLOYMENT: Record<string, string> = { permanent: "FULL_TIME", contract: "CONTRACTOR", temporary: "TEMPORARY" };

export function govJobPostingLd(v: GovVacancy) {
  const posted = v.publishedDate ?? v.firstSeenAt?.slice(0, 10);
  const place = (v.locations ?? []).find((l) => l.toLowerCase() !== "island-wide");
  const employmentType = v.employmentTerm ? GOV_EMPLOYMENT[v.employmentTerm] : undefined;
  const salary = parseSalaryLKR(v.salary);
  const through = validThrough(v.dateEn ?? v.dateSi);
  const description = [
    v.descEn,
    v.qualEn && `Qualifications: ${v.qualEn}`,
    v.age && `Age: ${v.age}`,
    v.howToApply?.length && `How to apply: ${v.howToApply.join(" ")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: v.titleEn,
    description: description || `${v.titleEn}, ${v.instEn}. See the original notice for full details.`,
    url: absoluteUrl(`/government-jobs/${v.slug}`),
    hiringOrganization: { "@type": "Organization", name: v.instEn },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "LK", ...(place ? { addressLocality: place } : {}) },
    },
    directApply: false,
    ...(posted ? { datePosted: posted } : {}),
    ...(through ? { validThrough: through } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(salary ? { baseSalary: salary } : {}),
    ...(v.quota && /^\d+/.test(v.quota) ? { totalJobOpenings: Number(v.quota.match(/^\d+/)![0]) } : {}),
  };
}

function privateEmployment(type?: string) {
  const t = (type ?? "").toLowerCase();
  if (/intern/.test(t)) return "INTERN";
  if (/part/.test(t)) return "PART_TIME";
  if (/contract|fixed/.test(t)) return "CONTRACTOR";
  if (/temp/.test(t)) return "TEMPORARY";
  if (/full/.test(t)) return "FULL_TIME";
  return undefined;
}

export function privateJobPostingLd(j: PrivateJob) {
  // "Colombo, Western Province, Sri Lanka" -> locality and region.
  const parts = (j.location ?? "").split(",").map((p) => p.trim()).filter((p) => p && !/^sri lanka$/i.test(p));
  const employmentType = privateEmployment(j.employmentType);
  const salary = parseSalaryLKR(j.salary);
  const through = validThrough(j.closingDate);
  const posted = j.datePosted ? parseClosingDate(j.datePosted) : null;
  const description = [j.descEn, j.qualEn && `What they're looking for: ${j.qualEn}`].filter(Boolean).join("\n\n");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.titleEn,
    description: description || `${j.titleEn} at ${j.employerName}. See the employer's posting for full details.`,
    url: absoluteUrl(`/private-jobs/${j.slug}`),
    hiringOrganization: { "@type": "Organization", name: j.employerName },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "LK",
        ...(parts[0] ? { addressLocality: parts[0] } : {}),
        ...(parts[1] ? { addressRegion: parts[1] } : {}),
      },
    },
    ...(posted ? { datePosted: isoDay(posted) } : {}),
    ...(through ? { validThrough: through } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(salary ? { baseSalary: salary } : {}),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path),
    })),
  };
}

/** A search-result description built from the facts people scan for, so it
 *  is useful even when the notice has no prose description. Max ~160 chars. */
export function govSnippet(v: GovVacancy): string {
  const closing = parseClosingDate(v.dateEn ?? v.dateSi);
  const bits = [
    `${v.titleEn}, ${v.instEn}.`,
    closing && `Closes ${shortDate(closing)} ${closing.getFullYear()}.`,
    v.qualificationLevel && `Needs ${QUALIFICATION_LABEL[v.qualificationLevel]}.`,
    v.age && `Age ${v.age}.`,
    v.salary && `Salary ${v.salary}.`,
  ].filter(Boolean) as string[];
  return clip(bits.join(" "));
}

export function privateSnippet(j: PrivateJob): string {
  const closing = parseClosingDate(j.closingDate);
  const bits = [
    `${j.titleEn} at ${j.employerName}`,
    j.location ? `, ${j.location.replace(", Sri Lanka", "")}.` : ".",
    j.employmentType && ` ${j.employmentType}.`,
    closing && ` Closes ${shortDate(closing)} ${closing.getFullYear()}.`,
    j.descEn && ` ${j.descEn}`,
  ].filter(Boolean) as string[];
  return clip(bits.join(""));
}

function clip(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 100 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/** Safe to drop into a <script type="application/ld+json">: escaping "<"
 *  means notice text can't close the script tag early. */
export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

