import { OG_SIZE, siteCardImage } from "@/lib/og";

export const alt = "The Living Gazette: Sri Lankan government jobs, summarised with closing dates";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return siteCardImage();
}
