import { dayParts, parseClosingDate } from "@/lib/dates";
import { getPrivateJobBySlug } from "@/lib/jobs";
import { OG_SIZE, jobCardImage, siteCardImage } from "@/lib/og";

export const alt = "Private job summary";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = getPrivateJobBySlug(slug);
  if (!j) return siteCardImage();
  const close = parseClosingDate(j.closingDate);
  const p = close ? dayParts(close) : null;
  return jobCardImage({
    kind: "Private job",
    title: j.titleEn,
    org: j.employerName,
    closes: close && p ? `${p.weekday} ${p.day} ${p.month} ${close.getFullYear()}` : null,
    facts: [j.location?.replace(", Sri Lanka", ""), j.employmentType].filter((f): f is string => Boolean(f)),
  });
}
