/** Salary helpers. Pure (no env, no fs), so client components can use them. */

/**
 * A monthly salary in rupees from a Sri Lankan salary scale, e.g.
 *   "Rs.82,150-10×2,400-8×2,940-17×3,900-195,970/- (SL1-2025)"
 * which reads: start at 82,150, then 10 increments of 2,400, ... up to
 * 195,970. Increments ("10×2,400", "2400x10"), bracketed notes and anything
 * after the scale itself (";", ", initial gross ...") are dropped; the first
 * and last amounts left are the range. Amounts under Rs. 10,000 are ignored,
 * which also drops years and circular codes ("SL-01-2025"); no government
 * monthly salary is that low. Anything that doesn't fit is left out.
 */
export function parseSalaryLKR(text?: string | null) {
  if (!text || !/rs\.?|lkr|rupees|\d{2},\d{3}/i.test(text)) return undefined;
  const scale = text
    .replace(/\([^)]*\)/g, " ")
    .split(/;|,\s+(?=[a-z])/i)[0]
    .replace(/\d+\s*[x×]\s*(?:rs\.?\s*)?\d[\d,]*/gi, " ")
    .replace(/\d[\d,]*\s*[x×]\s*\d+/gi, " ");
  const amounts = [...scale.matchAll(/\d[\d,]*/g)]
    .map((m) => Number(m[0].replace(/,/g, "")))
    .filter((n) => n >= 10_000 && n < 10_000_000);
  if (amounts.length === 0) return undefined;
  const first = amounts[0];
  const last = amounts[amounts.length - 1];
  const value =
    amounts.length >= 2 && last !== first
      ? { "@type": "QuantitativeValue", minValue: Math.min(first, last), maxValue: Math.max(first, last), unitText: "MONTH" }
      : { "@type": "QuantitativeValue", value: first, unitText: "MONTH" };
  return { "@type": "MonetaryAmount", currency: "LKR", value };
}

const fmt = (n: number) => n.toLocaleString("en-LK");

/**
 * A salary short enough for a job card: "Rs. 48,470 – 82,800" from a full
 * scale with its increments and circular code. Anything the scale reader
 * can't read with confidence is shown as printed, so a card never shows a
 * figure the notice didn't state.
 */
export function salaryShort(text?: string | null): string | null {
  if (!text) return null;
  const v = parseSalaryLKR(text)?.value as
    | { value?: number; minValue?: number; maxValue?: number }
    | undefined;
  if (!v) return text;
  if (v.minValue && v.maxValue) return `Rs. ${fmt(v.minValue)} – ${fmt(v.maxValue)}`;
  return v.value ? `Rs. ${fmt(v.value)}` : text;
}
