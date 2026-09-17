export type Language = 'en' | 'si' | 'ta';

export type QualificationLevel = 
  | 'OL'
  | 'AL'
  | 'Diploma'
  | 'Higher Diploma'
  | 'Bachelors'
  | 'Masters'
  | 'Professional';

export type FieldCategory =
  | 'ICT'
  | 'Engineering'
  | 'Management'
  | 'Finance'
  | 'Law'
  | 'Education'
  | 'Health'
  | 'Administration'
  | 'Science'
  | 'Other';

export type OrganizationType =
  | 'Ministry'
  | 'Department'
  | 'University'
  | 'Provincial Council'
  | 'State Institution';

export type JobType =
  | 'Permanent'
  | 'Contract'
  | 'Open Competitive Exam'
  | 'Limited Exam'
  | 'Temporary';

export interface LocalizedString {
  en: string;
  si: string;
  ta: string;
}

export interface LocalizedStringList {
  en: string[];
  si: string[];
  ta: string[];
}

export interface GazettePage {
  pageNumber: number;
  sectionHeader: string;
  columns: string[];
  highlightNoticeId?: string;
}

export interface GazetteEdition {
  id: string;
  gazetteNumber: string;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  part: string;
  totalVacancies: number;
  totalExams: number;
  pagesCount: number;
  pdfFileName: string;
  sourceNote: string;
  originalPdfUrl?: string;
  originalSinhalaPdfUrl?: string;
  originalTamilPdfUrl?: string;
  officialGovLkUrl?: string;
  isRealGovernmentData?: boolean;
}

export interface Vacancy {
  id: string;
  slug: string;
  title: LocalizedString;
  institution: LocalizedString;
  ministry: LocalizedString;
  gazetteNumber: string;
  gazetteDate: string; // YYYY-MM-DD
  gazettePart: string;
  gazettePage: number;
  noticeNumber: string;
  closingDate: string; // YYYY-MM-DD
  isNew: boolean;
  originalPdfUrl?: string;
  officialGovLkUrl?: string;
  isRealGovernmentData?: boolean;
  salary: {
    scale: string;
    code: string;
    min: number;
    max: number;
    allowanceNote?: string;
  };
  vacanciesCount: number;
  qualifications: {
    level: QualificationLevel;
    summary: LocalizedString;
    requirements: LocalizedStringList;
  };
  ageLimit: {
    min: number;
    max: number;
    description: LocalizedString;
  };
  location: string;
  field: FieldCategory;
  organizationType: OrganizationType;
  jobType: JobType;
  methodOfRecruitment: LocalizedString;
  howToApply: {
    steps: LocalizedStringList;
    applicationFee?: string;
    postalAddress: LocalizedString;
    onlinePortalUrl?: string;
    formDownloadUrl?: string;
  };
  gazetteTextSnippet: {
    titleHeading: string;
    preamble: string;
    bodyParagraphs: string[];
  };
  verifiedStatus: 'verified' | 'pending_verification';
}

export interface UserSavedJob {
  vacancyId: string;
  savedAt: string;
  status: 'interested' | 'applied' | 'not_interested';
  notes?: string;
}

export interface UserProfile {
  highestEducation: QualificationLevel | '';
  degreeField: string;
  age: number | '';
  preferredDistricts: string[];
  currentStatus: 'student' | 'graduate' | 'employed' | '';
}

export interface FilterState {
  searchQuery: string;
  qualifications: QualificationLevel[];
  fields: FieldCategory[];
  organizationTypes: OrganizationType[];
  locations: string[];
  jobTypes: JobType[];
  closingWithinDays: number | null;
  onlyExams: boolean;
  sortBy: 'closing_soon' | 'newest' | 'vacancies';
}
