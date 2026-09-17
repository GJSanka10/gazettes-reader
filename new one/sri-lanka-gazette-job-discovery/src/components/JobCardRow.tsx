import React from 'react';
import { Vacancy, Language, UserProfile, UserSavedJob } from '../types';
import { translations } from '../data/translations';
import { getDaysRemaining, evaluateEligibilityMatch } from '../utils/helpers';
import { Bookmark, FileText, CheckCircle2, AlertCircle, ArrowUpRight, Calendar, Users, Award, Banknote, ShieldAlert } from 'lucide-react';

interface JobCardRowProps {
  vacancy: Vacancy;
  language: Language;
  userProfile: UserProfile | null;
  savedJob?: UserSavedJob;
  onToggleSave: (vacancyId: string) => void;
  onOpenDetail: (vacancy: Vacancy) => void;
  onOpenGazetteReader: (vacancy: Vacancy) => void;
}

export const JobCardRow: React.FC<JobCardRowProps> = ({
  vacancy,
  language,
  userProfile,
  savedJob,
  onToggleSave,
  onOpenDetail,
  onOpenGazetteReader,
}) => {
  const t = translations[language];
  const daysLeft = getDaysRemaining(vacancy.closingDate);
  const matchResult = evaluateEligibilityMatch(vacancy, userProfile);

  // Closing urgency badge styling
  let urgencyClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let urgencyText = `${t.closingIn} ${daysLeft} ${daysLeft === 1 ? t.day : t.days}`;

  if (daysLeft <= 0) {
    urgencyClass = 'bg-slate-100 text-slate-500 border-slate-200';
    urgencyText = t.closed;
  } else if (daysLeft <= 3) {
    urgencyClass = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
    urgencyText = `${t.closingIn} ${daysLeft} ${daysLeft === 1 ? t.day : t.days}`;
  } else if (daysLeft <= 7) {
    urgencyClass = 'bg-amber-50 text-amber-900 border-amber-200 font-semibold';
    urgencyText = `${t.closingIn} ${daysLeft} ${t.days}`;
  }

  // Localized texts
  const title = vacancy.title[language] || vacancy.title.en;
  const institution = vacancy.institution[language] || vacancy.institution.en;
  const qualificationSummary = vacancy.qualifications.summary[language] || vacancy.qualifications.summary.en;

  const fontClass = language === 'si' ? 'font-sinhala' : language === 'ta' ? 'font-tamil' : '';

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 rounded-2xl p-5 sm:p-6 mb-3.5 group relative">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-5">
        {/* Main Content Area */}
        <div className="flex-1 space-y-3">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {vacancy.isNew && (
              <span className="bg-rose-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-2xs">
                {t.badgeNew}
              </span>
            )}

            {vacancy.jobType === 'Open Competitive Exam' && (
              <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                {t.badgeExam}
              </span>
            )}

            <span className="text-slate-600 font-mono-code font-semibold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
              Gazette {vacancy.gazetteNumber} • Notice {vacancy.noticeNumber}
            </span>

            <span className="text-slate-600 text-[11px] font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              {vacancy.field} Service
            </span>

            {/* Urgency Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] border ml-auto md:ml-0 ${urgencyClass}`}
            >
              <Calendar className="w-3 h-3" />
              <span>{urgencyText}</span>
            </span>
          </div>

          {/* Job Title & Ministry */}
          <div>
            <h3
              onClick={() => onOpenDetail(vacancy)}
              className={`text-base sm:text-xl font-display font-bold text-slate-950 group-hover:text-rose-700 transition-colors cursor-pointer leading-snug ${fontClass}`}
            >
              {title}
            </h3>
            <p className={`text-xs sm:text-sm text-slate-600 mt-1 font-medium ${fontClass}`}>
              {institution}
            </p>
          </div>

          {/* Quick Structured Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-display">
                {t.salary}
              </span>
              <span className="font-bold text-emerald-800 block truncate mt-0.5" title={vacancy.salary.scale}>
                Rs. {vacancy.salary.min.toLocaleString()} – {vacancy.salary.max.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-display">
                {t.vacanciesCount}
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {vacancy.vacanciesCount} Positions
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-display">
                {t.ageRange}
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {vacancy.ageLimit.min}–{vacancy.ageLimit.max} Years
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-display">
                {t.filterLocation}
              </span>
              <span className="font-bold text-slate-900 block mt-0.5 truncate">
                {vacancy.location}
              </span>
            </div>
          </div>

          {/* Qualification Summary Snippet */}
          <div className="bg-slate-50/80 border border-slate-200/60 p-3 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <Award className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <p className={`line-clamp-2 leading-relaxed ${fontClass}`}>
              <strong className="text-slate-900 font-semibold">Requirement: </strong>
              {qualificationSummary}
            </p>
          </div>

          {/* Match Profile preview if active */}
          {matchResult && (
            <div className={`text-xs px-3 py-2 rounded-xl flex items-center gap-2 border ${
              matchResult.isMatch
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {matchResult.isMatch ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="font-medium text-[11px]">
                {matchResult.isMatch ? 'Profile Match:' : 'Eligibility Alert:'} {matchResult.reasons[0]?.message}
              </span>
            </div>
          )}
        </div>

        {/* Right Action Column */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleSave(vacancy.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                savedJob
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-950 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title={savedJob ? t.saved : t.saveJob}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenGazetteReader(vacancy)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              <span>{t.viewFullGazette}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDetail(vacancy)}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-rose-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-md"
            >
              <span>{t.viewDetails}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
