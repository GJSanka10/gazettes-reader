import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Everything is open to crawlers except the personal Saved page. Filtered and
 * paginated lists aren't blocked here: they carry noindex instead, which
 * crawlers can only see if they're allowed to fetch the page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/saved"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
