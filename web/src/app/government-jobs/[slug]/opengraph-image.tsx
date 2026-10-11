import { dayParts, parseClosingDate } from "@/lib/dates";
import { QUALIFICATION_LABEL, getGovVacancyBySlug } from "@/lib/jobs";
import { OG_SIZE, jobCardImage, siteCardImage } from "@/lib/og";

export const alt = "Government job summary with closing date";
export const size = OG_SIZE;
export const contentType = "image/png";
// Same rebuild window as the page it illustrates.
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getGovVacancyBySlug(slug);
  if (!v) return siteCardImage();
  const close = parseClosingDate(v.dateEn ?? v.dateSi);
  const p = close ? dayParts(close) : null;
  return jobCardImage({
    kind: "Government job",
    title: v.titleEn,
    org: v.instEn,
    closes: close && p ? `${p.weekday} ${p.day} ${p.month} ${close.getFullYear()}` : null,
    facts: [
      v.qualificationLevel && `Needs ${QUALIFICATION_LABEL[v.qualificationLevel]}`,
      v.age && `Age ${v.age}`,
    ].filter((f): f is string => Boolean(f)),
  });
}
