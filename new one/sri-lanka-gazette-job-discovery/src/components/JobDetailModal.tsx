import React from 'react';
import { Vacancy, Language, UserProfile, UserSavedJob } from '../types';
import { translations } from '../data/translations';
import { getDaysRemaining, evaluateEligibilityMatch } from '../utils/helpers';
import {
  X,
  Calendar,
  Award,
  Users,
  Banknote,
  MapPin,
  FileText,
  Bookmark,
  Share2,
  Printer,
  ExternalLink,
  ShieldCheck,
  Building,
  Clock,
  ArrowRight,
  Download,
  AlertTriangle,
  CheckCircle2,
  Check
} from 'lucide-react';

interface JobDetailModalProps {
  vacancy: Vacancy | null;
  language: Language;
  userProfile: UserProfile | null;
  savedJob?: UserSavedJob;
  onClose: () => void;
  onToggleSave: (vacancyId: string) => void;
  onOpenGazetteReader: (vacancy: Vacancy) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  vacancy,
  language,
  userProfile,
  savedJob,
  onClose,
  onToggleSave,
  onOpenGazetteReader,
}) => {
  if (!vacancy) return null;

  const t = translations[language];
  const daysLeft = getDaysRemaining(vacancy.closingDate);
  const matchResult = evaluateEligibilityMatch(vacancy, userProfile);

  const title = vacancy.title[language] || vacancy.title.en;
  const institution = vacancy.institution[language] || vacancy.institution.en;
  const ministry = vacancy.ministry[language] || vacancy.ministry.en;
  const qualSummary = vacancy.qualifications.summary[language] || vacancy.qualifications.summary.en;
  const qualRequirements = vacancy.qualifications.requirements[language] || vacancy.qualifications.requirements.en;
  const applySteps = vacancy.howToApply.steps[language] || vacancy.howToApply.steps.en;
  const postalAddr = vacancy.howToApply.postalAddress[language] || vacancy.howToApply.postalAddress.en;
  const recruitmentMethod = vacancy.methodOfRecruitment[language] || vacancy.methodOfRecruitment.en;

  const fontClass = language === 'si' ? 'font-sinhala' : language === 'ta' ? 'font-tamil' : '';

  const handlePrint = () => {
    window.print();
  };

  const [copied, setCopied] = React.useState(false);
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Header Bar */}
        <div className="bg-slate-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="bg-rose-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
              {vacancy.noticeNumber}
            </span>
            <span className="text-slate-400 font-mono-code text-xs hidden sm:inline">
              Gazette No. {vacancy.gazetteNumber} • {vacancy.gazettePart}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print Vacancy Brief"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors relative cursor-pointer"
              title="Copy Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar text-slate-900">
          {/* Vacancy Title Section */}
          <div className="border-b border-slate-200 pb-6 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-display">
                {vacancy.field} Service • {vacancy.jobType}
              </span>

              {/* Urgency Alert Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                daysLeft <= 3
                  ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold animate-pulse'
                  : daysLeft <= 7
                  ? 'bg-amber-50 text-amber-900 border-amber-200 font-semibold'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {daysLeft <= 0 ? t.closed : `${t.closingIn} ${daysLeft} ${daysLeft === 1 ? t.day : t.days} (${vacancy.closingDate})`}
                </span>
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-display font-extrabold text-slate-950 leading-tight ${fontClass}`}>
              {title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Building className="w-4 h-4 text-slate-400" />
                <span className={fontClass}>{institution}</span>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className={fontClass}>{ministry}</span>
            </div>

            {/* Eligibility Match Box if User Profile exists */}
            {matchResult && (
              <div className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
                matchResult.isMatch
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  {matchResult.isMatch ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  )}
                  <span className="font-display font-bold">{t.matchTitle}: Score {matchResult.score}%</span>
                </div>
                <ul className="space-y-1 list-disc list-inside">
                  {matchResult.reasons.map((r, idx) => (
                    <li key={idx} className={r.status === 'pass' ? 'text-emerald-900 font-medium' : 'text-amber-900'}>
                      {r.message}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500 mt-2 italic border-t border-slate-200/80 pt-1.5">
                  * {t.disclaimerMatch}
                </p>
              </div>
            )}
          </div>

          {/* Quick Facts Grid */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-display">
              {t.quickFacts}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Award className="w-3.5 h-3.5 text-rose-700" />
                  <span>{t.qualificationReq}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 font-display">
                  {vacancy.qualifications.level} Level
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Users className="w-3.5 h-3.5 text-rose-700" />
                  <span>{t.vacanciesCount}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 font-display">
                  {vacancy.vacanciesCount} Posts
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Banknote className="w-3.5 h-3.5 text-rose-700" />
                  <span>{t.salary}</span>
                </div>
                <div className="font-bold text-sm text-emerald-800 font-mono-code">
                  Rs. {vacancy.salary.min.toLocaleString()} – {vacancy.salary.max.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-700" />
                  <span>{t.filterLocation}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 font-display truncate">
                  {vacancy.location}
                </div>
              </div>
            </div>

            <div className="mt-2.5 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-slate-600">
                <strong className="text-slate-900">Salary Code:</strong> {vacancy.salary.code} — {vacancy.salary.scale}
              </span>
              {vacancy.salary.allowanceNote && (
                <span className="text-slate-500 text-[11px] italic">
                  {vacancy.salary.allowanceNote}
                </span>
              )}
            </div>
          </div>

          {/* Section: Eligibility & Requirements */}
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl space-y-3.5 shadow-2xs">
            <h2 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-700" />
              <span>{t.eligibilityCriteria}</span>
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="bg-slate-50 p-4 border-l-3 border-rose-700 rounded-r-xl text-xs">
                <strong className="block text-slate-950 font-bold mb-1 font-display">Summary:</strong>
                <p className={fontClass}>{qualSummary}</p>
              </div>

              <div>
                <strong className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-display">
                  Detailed Academic / Professional Standards:
                </strong>
                <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-slate-800">
                  {qualRequirements.map((req, idx) => (
                    <li key={idx} className={fontClass}>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <strong className="block text-slate-400 uppercase text-[10px] tracking-wider mb-0.5 font-display font-bold">
                    {t.ageRange}
                  </strong>
                  <p className={fontClass}>
                    {vacancy.ageLimit.description[language] || vacancy.ageLimit.description.en}
                  </p>
                </div>
                <div>
                  <strong className="block text-slate-400 uppercase text-[10px] tracking-wider mb-0.5 font-display font-bold">
                    {t.recruitmentMethod}
                  </strong>
                  <p className={fontClass}>{recruitmentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: How To Apply (Step-by-Step) */}
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl space-y-4 shadow-2xs">
            <h2 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-700" />
              <span>{t.howToApply}</span>
            </h2>

            <div className="space-y-2.5">
              {applySteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs font-mono-code">
                    {idx + 1}
                  </span>
                  <p className={`flex-1 leading-relaxed ${fontClass}`}>{step}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1 font-display">
                  {t.postalAddress}
                </span>
                <p className={`text-slate-900 font-medium leading-normal ${fontClass}`}>
                  {postalAddr}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1 font-display">
                    {t.applicationFee}
                  </span>
                  <p className="text-slate-900 font-semibold">
                    {vacancy.howToApply.applicationFee || 'No examination fee specified.'}
                  </p>
                </div>

                {vacancy.howToApply.onlinePortalUrl && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200">
                    <a
                      href={vacancy.howToApply.onlinePortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>{t.onlinePortal}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Official Gazette Source Verification Box */}
          <div className="bg-slate-50 border border-slate-200 p-5 sm:p-6 rounded-2xl space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 font-display">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.officialGazetteRecord}</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5 font-mono-code">
                  Notice {vacancy.noticeNumber} • Published in Gazette Issue No. {vacancy.gazetteNumber} on {vacancy.gazetteDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGazetteReader(vacancy);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.openDocumentReader}</span>
                </button>
              </div>
            </div>

            {/* Gazette Excerpt Text */}
            <div className="bg-amber-50/50 p-4 sm:p-5 rounded-xl border border-amber-200/80 font-editorial text-xs leading-relaxed text-slate-800 shadow-2xs">
              <div className="text-center font-bold text-sm tracking-wide uppercase border-b border-amber-200/80 pb-2 mb-2.5 text-slate-950 font-display">
                {vacancy.gazetteTextSnippet.titleHeading}
              </div>
              <p className="italic mb-2 text-slate-700">
                {vacancy.gazetteTextSnippet.preamble}
              </p>
              {vacancy.gazetteTextSnippet.bodyParagraphs.map((para, idx) => (
                <p key={idx} className="mb-2">
                  {para}
                </p>
              ))}
              <div className="mt-3.5 pt-2.5 border-t border-amber-200/80 text-[11px] text-slate-500 font-ui flex justify-between items-center font-medium">
                <span>Page {vacancy.gazettePage} of Gazette No. {vacancy.gazetteNumber}</span>
                <span>Government Press, Colombo 08</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(vacancy.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                savedJob
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{savedJob ? t.saved : t.saveJob}</span>
            </button>
            {vacancy.originalPdfUrl && (
              <a
                href={vacancy.originalPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                title="Download Official Government Gazette PDF"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>Official PDF</span>
              </a>
            )}
            {vacancy.officialGovLkUrl && (
              <a
                href={vacancy.officialGovLkUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all items-center gap-1.5"
                title="Open on documents.gov.lk"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>documents.gov.lk</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGazetteReader(vacancy);
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-rose-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>{t.openDocumentReader}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
