import React from 'react';
import { Language, UserProfile, UserSavedJob, GazetteEdition } from '../types';
import { translations } from '../data/translations';
import { Bookmark, FileText, CheckCircle2, SlidersHorizontal, ShieldCheck, Newspaper, Search, ExternalLink } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'feed' | 'jobs' | 'exams' | 'saved' | 'admin' | 'reader';
  onTabChange: (tab: 'feed' | 'jobs' | 'exams' | 'saved' | 'admin' | 'reader') => void;
  savedJobs: UserSavedJob[];
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenReader: () => void;
  gazette?: GazetteEdition;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  savedJobs,
  userProfile,
  onOpenProfile,
  onOpenReader,
  gazette,
}) => {
  const t = translations[language];

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs transition-colors">
      {/* Top Official Gazette Masthead Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider text-slate-100 uppercase text-[11px] font-display">
              {t.officialGazetteRegistry}
            </span>
            <span className="hidden md:inline text-slate-400 text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Department of Government Printing • Live Data (documents.gov.lk)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden sm:inline font-mono-code text-slate-300 text-[11px]">
              Issue No. {gazette?.gazetteNumber || '2,506'} • Part I: Section (IIA)
            </span>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-full border border-slate-800">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-rose-700 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('si')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-sinhala transition-all cursor-pointer ${
                  language === 'si'
                    ? 'bg-rose-700 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                සිංහල
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('ta')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-tamil transition-all cursor-pointer ${
                  language === 'ta'
                    ? 'bg-rose-700 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onTabChange('feed')}
            className="text-left group focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col items-center justify-center font-display font-black shadow-md border border-slate-700/60 group-hover:border-rose-500/60 transition-colors">
                <span className="text-[9px] tracking-widest uppercase text-rose-400 font-extrabold leading-tight">GZ</span>
                <span className="text-xs tracking-wider leading-none text-white">LK</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-slate-950 group-hover:text-rose-700 transition-colors flex items-center gap-2">
                  <span>
                    {language === 'si' ? 'ශ්‍රී ලංකා ගැසට් රැකියා' : language === 'ta' ? 'இலங்கை வர்த்தமானி வேலைவாய்ப்பு' : 'The Sri Lanka Gazette'}
                  </span>
                  <span className="text-xs font-ui font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full tracking-normal hidden sm:inline-block">
                    Job Discovery
                  </span>
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span>{t.editionSubtitle}</span>
                </p>
              </div>
            </div>
          </button>

          {/* Mobile Profile & Saved quick buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => onTabChange('saved')}
              className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs"
              title={t.navSaved}
            >
              <Bookmark className="w-4 h-4" />
              {(savedJobs?.length || 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {savedJobs?.length || 0}
                </span>
              )}
            </button>
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs"
              title={t.matchMe}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation items & Quick utility actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <nav className="flex items-center gap-1 text-xs sm:text-sm font-medium bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => onTabChange('feed')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {t.navHome}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('jobs')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {t.navJobs}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('exams')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{t.navExams}</span>
              <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                4
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('saved')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t.navSaved}</span>
              {(savedJobs?.length || 0) > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedJobs?.length || 0}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-rose-700 text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.navAdmin}</span>
            </button>
          </nav>

          <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

          {/* Interactive Document Reader Action */}
          <button
            type="button"
            onClick={onOpenReader}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:shadow-xs hover:border-slate-300 whitespace-nowrap cursor-pointer"
          >
            <Newspaper className="w-3.5 h-3.5 text-rose-700" />
            <span>{t.navGazetteReader}</span>
          </button>

          {/* Eligibility Profile Action */}
          <button
            type="button"
            onClick={onOpenProfile}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs hover:shadow-xs whitespace-nowrap cursor-pointer ${
              userProfile?.highestEducation || userProfile?.age
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{userProfile?.highestEducation ? 'Eligibility Active' : t.matchMe}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
