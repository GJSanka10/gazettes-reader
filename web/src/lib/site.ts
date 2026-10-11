import type { Metadata } from "next";

/**
 * The site's public address, for canonical links, the sitemap and share cards.
 *
 * Order: NEXT_PUBLIC_SITE_URL (set this once a custom domain exists), then
 * the production address Vercel provides automatically, then localhost for
 * development. Without the Vercel fallback, a deploy that forgot the variable
 * would tell Google that every page lives at http://localhost:3000.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "The Living Gazette";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Title, description, canonical and share-card text for one page, kept in
 * step. Every indexable page uses this, so none inherits another's canonical.
 */
export function pageMeta({
  title,
  description,
  path,
  type = "website",
  siteImage = true,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Use the site's default share card. Job pages pass false: they have
   *  their own opengraph-image route, which Next attaches automatically.
   *  (A page that sets openGraph without images loses the inherited one,
   *  so the default has to be named here explicitly.) */
  siteImage?: boolean;
}): Metadata {
  const images = siteImage
    ? [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The Living Gazette: Sri Lankan government jobs" }]
    : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName: SITE_NAME, locale: "en_LK", ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images: ["/opengraph-image"] } : {}) },
  };
}

/** "Title — Organisation", which says the most in a search result. A title
 *  that's already long on its own stands alone: adding the organisation
 *  would only push the part people read past where results cut off. */
export function jobTitle(title: string, org: string): string {
  return title.length > 45 ? title : `${title} — ${org}`;
}
