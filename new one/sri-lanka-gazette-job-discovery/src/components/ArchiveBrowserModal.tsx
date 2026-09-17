import React from 'react';
import { GazetteEdition, Language } from '../types';
import { ARCHIVED_GAZETTES } from '../data/gazettesData';
import { translations } from '../data/translations';
import { X, Calendar, FileText, ArrowRight, ExternalLink, BookOpen, Clock } from 'lucide-react';

interface ArchiveBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectGazette: (gazette: GazetteEdition) => void;
}

export const ArchiveBrowserModal: React.FC<ArchiveBrowserModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectGazette,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="font-display text-base font-bold tracking-tight">
              {t.gazetteArchive} — Government Publications
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <p className="text-slate-500 leading-relaxed font-ui">
            Browse weekly Government Gazette issues published under the authority of the Democratic Socialist Republic of Sri Lanka. Select an edition to inspect advertised notices.
          </p>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {ARCHIVED_GAZETTES.map((edition) => (
              <div
                key={edition.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      No. {edition.gazetteNumber}
                    </span>
                    <span className="text-slate-500 text-[11px] font-medium">
                      {edition.formattedDate}
                    </span>
                  </div>

                  <h4 className="font-display text-sm sm:text-base font-bold text-slate-950">
                    Gazette Issue No. {edition.gazetteNumber}
                  </h4>

                  <p className="text-[11px] text-slate-500 font-ui">
                    {edition.part} • {edition.pagesCount} Pages
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                  <div className="text-right mr-2 hidden sm:block">
                    <span className="block font-bold text-sm text-slate-950 font-display">
                      {edition.totalVacancies}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono-code">Vacancies</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {edition.originalPdfUrl && (
                      <a
                        href={edition.originalPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all inline-flex items-center gap-1"
                        title="Download Original Gazette PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-rose-600" />
                        <span className="hidden sm:inline">Official PDF</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectGazette(edition);
                        onClose();
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-rose-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-display"
                    >
                      <span>Read Edition</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};
