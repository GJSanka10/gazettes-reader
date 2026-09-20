export type JobStatus = "urgent" | "soon" | "open" | "closed";

/** Government Gazette vacancy — schema written by scripts/ingest.py. */
export interface GovVacancy {
  serial: string;
  slug: string;
  real?: boolean;
  titleEn: string;
  titleSi?: string;
  instEn: string;
  instSi?: string;
  /** Closing date as printed in the source, e.g. "24 Sep 2026". */
  dateEn?: string | null;
  dateSi?: string | null;
  status?: JobStatus;
  days?: string;
  elig?: "qualifies" | "check" | "not-eligible" | "closed";
  category?: string;
  tag?: string;
  citation?: string;
  citationType?: "gazette" | "circular" | null;
  sourceUrl?: string;
  pdfUrl?: string;
  descEn?: string;
  descSi?: string;
  age?: string;
  quota?: string;
  salary?: string;
  page?: string;
  qualEn?: string;
  qualSiText?: string;
  confidence?: number | null;
  verifiedAt?: string | null;
  _needsReview?: boolean;
}

/** Private-sector posting — schema written by scripts/private-ingest/.
 *  Deliberately a separate shape from GovVacancy (job.md §11.5): these come
 *  from ATS platforms, and most carry no closing date at all. */
export interface PrivateJob {
  slug: string;
  titleEn: string;
  employerName: string;
  sector?: string;
  sourceType?: string;
  descEn?: string;
  location?: string;
  employmentType?: string;
  datePosted?: string | null;
  closingDate?: string | null;
  status?: JobStatus;
  days?: string;
  salary?: string | null;
  qualEn?: string | null;
  applyUrl?: string;
  sourceUrl?: string;
  confidence?: number | null;
  verifiedAt?: string | null;
  _needsReview?: boolean;
  _legalRisk?: string;
}

export interface SearchParamsShape {
  search?: string;
  category?: string;
  institution?: string;
  education?: string;
  location?: string;
  employment?: string;
  sector?: string;
  closing?: string;
  sort?: string;
  page?: string;
}
