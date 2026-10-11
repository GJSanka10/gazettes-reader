import type { MetadataRoute } from "next";
import { getGovUpdatedAt, getGovVacancies, getPrivateJobs, getPrivateUpdatedAt } from "@/lib/jobs";
import { parseClosingDate } from "@/lib/dates";
import { absoluteUrl } from "@/lib/site";

// Jobs open and close every week; rebuild the sitemap at least hourly.
export const revalidate = 3600;

function toDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseClosingDate(value) : new Date(value);
  return d && !Number.isNaN(d.getTime()) ? d : undefined;
}

/**
 * Every page someone could usefully land on from a search: the main lists and
 * each job still open for applications. Closed jobs are left out (their pages
 * are noindex too), and so are filtered lists and the personal Saved page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const gov = (getGovVacancies() ?? []).filter((v) => v.status !== "closed");
  const priv = (getPrivateJobs() ?? []).filter((j) => j.status !== "closed");
  const govUpdated = toDate(getGovUpdatedAt());
  const privUpdated = toDate(getPrivateUpdatedAt());
  const newest = [govUpdated, privUpdated].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];

  return [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/government-jobs"), lastModified: govUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/private-jobs"), lastModified: privUpdated, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.3 },
    ...gov.map((v) => ({
      url: absoluteUrl(`/government-jobs/${v.slug}`),
      lastModified: toDate(v.firstSeenAt) ?? toDate(v.publishedDate),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...priv.map((j) => ({
      url: absoluteUrl(`/private-jobs/${j.slug}`),
      lastModified: toDate(j.datePosted),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
