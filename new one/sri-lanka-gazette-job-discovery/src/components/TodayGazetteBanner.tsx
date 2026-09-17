import React from 'react';
import { Language, GazetteEdition } from '../types';
import { translations } from '../data/translations';
import { FileText, ArrowRight, Bell, Sparkles, Clock, BookOpen } from 'lucide-react';

interface TodayGazetteBannerProps {
  language: Language;
  gazette: GazetteEdition;
  onOpenReader: () => void;
  onQuickFilter: (keyword: string) => void;
  onSelectExams: () => void;
}

export const TodayGazetteBanner: React.FC<TodayGazetteBannerProps> = ({
  language,
  gazette,
  onOpenReader,
  onQuickFilter,
  onSelectExams,
}) => {
  const t = translations[language];

  // Dynamically parse date
  const dateObj = new Date(gazette.date);
  const dayStr = isNaN(dateObj.getDate()) ? '11' : String(dateObj.getDate()).padStart(2, '0');
  const monthStr = isNaN(dateObj.getMonth()) ? 'SEP' : dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const yearStr = isNaN(dateObj.getFullYear()) ? '2026' : String(dateObj.getFullYear());

  return (
    <div className="bg-gradient-to-b from-white via-slate-50/80 to-slate-100/60 border-b border-slate-200/80 py-7 sm:py-9 px-4 sm:px-8 relative overflow-hidden">
      {/* Background ambient civic accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Purpose */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Authentic Official Gazette • documents.gov.lk</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight leading-[1.2]">
              {t.editionTagline}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-ui">
              {t.editionSubtitle}
            </p>

            {/* Quick Keyword Jump Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Quick focus:</span>
              <button
                type="button"
                onClick={() => onQuickFilter('Customs Inspector')}
                className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 rounded-lg transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs"
              >
                Customs Inspector (Grade II)
              </button>
              <button
                type="button"
                onClick={() => onQuickFilter('Port State Controller')}
                className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 rounded-lg transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs"
              >
                Port State Controller
              </button>
              <button
                type="button"
                onClick={() => onQuickFilter('Foreign Service')}
                className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 rounded-lg transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs"
              >
                Foreign Service (SLFS)
              </button>
              <button
                type="button"
                onClick={() => onQuickFilter('Police')}
                className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 rounded-lg transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs"
              >
                Police ASP (Engineering)
              </button>
              <button
                type="button"
                onClick={() => onQuickFilter('Museums')}
                className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 rounded-lg transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs"
              >
                Museums Technical
              </button>
              <button
                type="button"
                onClick={() => onQuickFilter('Electro-Medical')}
                className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 rounded-lg transition-all font-semibold cursor-pointer shadow-2xs hover:shadow-xs"
              >
                Electro-Medical Tech
              </button>
            </div>
          </div>

          {/* Right Column: Visually Distinct Date & Gazette Edition Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all p-5 sm:p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

              <div className="flex items-start gap-4 sm:gap-5">
                {/* Traditional Gazette Date Block */}
                <div className="flex flex-col items-center justify-center bg-slate-950 text-white px-4 py-3 rounded-xl min-w-[80px] text-center shadow-md border border-slate-800 shrink-0">
                  <span className="text-3xl font-extrabold font-display leading-none tracking-tight text-white">{dayStr}</span>
                  <span className="text-[11px] uppercase tracking-widest font-bold text-rose-400 mt-1">{monthStr}</span>
                  <span className="text-[10px] text-slate-400 font-mono-code mt-0.5 font-medium">{yearStr}</span>
                </div>

                {/* Edition & Opportunity Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase font-bold text-rose-700 tracking-wider font-display">
                      {t.latestGazette}
                    </span>
                    <span className="text-xs font-mono-code font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      No. {gazette.gazetteNumber}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900 mt-1 truncate">
                    {gazette.formattedDate}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {gazette.part}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black font-display text-slate-950">
                          {gazette.totalVacancies}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {t.newVacancies}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 mt-1 w-fit">
                        <FileText className="w-3 h-3 inline text-emerald-600" />
                        <span>Official Gov PDF Attached ({gazette.pagesCount} pages)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {gazette.originalPdfUrl && (
                        <a
                          href={gazette.originalPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open original official PDF file"
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200/80"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-600" />
                          <span>PDF</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={onOpenReader}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-rose-700 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{t.openDocumentReader}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
