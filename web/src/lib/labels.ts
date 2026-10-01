/** Display labels and the qualification ladder. Pure data — no fs — so
 *  client components (the homepage ladder) can import it. */

export const QUALIFICATION_LABEL: Record<string, string> = {
  ol: "G.C.E. O/L",
  al: "G.C.E. A/L",
  nvq: "NVQ",
  diploma: "Diploma",
  degree: "Bachelor's degree",
  masters: "Master's degree",
  professional: "Professional qualification",
};

export const JOB_TYPE_LABEL: Record<string, string> = {
  permanent: "Permanent",
  contract: "Contract",
  temporary: "Temporary",
  "open-exam": "Open competitive exam",
  "limited-exam": "Limited competitive exam",
  "interview-only": "Interview only",
};

export const SOURCE_LABEL: Record<string, string> = {
  gazette: "Gazette notice",
  "institution-notice": "Institution's own notice",
};

/**
 * The Sri Lankan education ladder, lowest first. Each rung covers the
 * qualification levels a notice can ask for at that height; NVQ sits with
 * diplomas and professional qualifications with degrees, which is how
 * government notices usually treat them as entry requirements.
 */
export const LADDER = [
  { id: "ol", short: "O/L", name: "G.C.E. O/L", hint: "Ordinary Level passes", ask: "O/L", levels: ["ol"] },
  { id: "al", short: "A/L", name: "G.C.E. A/L", hint: "Advanced Level passes", ask: "A/L or less", levels: ["al"] },
  { id: "diploma", short: "Diploma", name: "Diploma or NVQ", hint: "Diploma, Higher National Diploma or NVQ", ask: "a diploma, NVQ or less", levels: ["nvq", "diploma"] },
  { id: "degree", short: "Degree", name: "Bachelor's degree", hint: "Or a professional qualification", ask: "a degree or less", levels: ["degree", "professional"] },
  { id: "masters", short: "Postgrad", name: "Postgraduate", hint: "Master's degree or higher", ask: "a postgraduate degree or less", levels: ["masters"] },
] as const;

export type LadderId = (typeof LADDER)[number]["id"];

/** Rung index (0-based) for a qualification level, or null when unknown. */
export function rungOf(level?: string | null): number | null {
  if (!level) return null;
  const i = LADDER.findIndex((r) => (r.levels as readonly string[]).includes(level));
  return i === -1 ? null : i;
}
