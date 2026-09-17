import React, { useState } from 'react';
import { Vacancy, Language, UserSavedJob } from '../types';
import { translations } from '../data/translations';
import { getDaysRemaining } from '../utils/helpers';
import {
  Bookmark,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  FileText,
  Building,
  Edit3,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface SavedJobsViewProps {
  language: Language;
  vacancies: Vacancy[];
  savedJobs: UserSavedJob[];
  recentViewedIds: string[];
  onUpdateStatus: (vacancyId: string, status: UserSavedJob['status']) => void;
  onUpdateNotes: (vacancyId: string, notes: string) => void;
  onRemoveSaved: (vacancyId: string) => void;
  onOpenDetail: (vacancy: Vacancy) => void;
  onOpenGazetteReader: (vacancy: Vacancy) => void;
  onBrowseFeed: () => void;
}

export const SavedJobsView: React.FC<SavedJobsViewProps> = ({
  language,
  vacancies,
  savedJobs,
  recentViewedIds,
  onUpdateStatus,
  onUpdateNotes,
  onRemoveSaved,
  onOpenDetail,
  onOpenGazetteReader,
  onBrowseFeed,
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'closingSoon' | 'applied' | 'recent'>('saved');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const safeSavedJobs = Array.isArray(savedJobs) ? savedJobs : [];
  const safeVacancies = Array.isArray(vacancies) ? vacancies : [];
  const safeRecentViewedIds = Array.isArray(recentViewedIds) ? recentViewedIds : [];

  const savedVacancyMap = new Map(safeVacancies.map((v) => [v.id, v]));

  // Categorize items
  const savedList = safeSavedJobs
    .map((sj) => ({ savedJob: sj, vacancy: savedVacancyMap.get(sj.vacancyId) }))
    .filter((item): item is { savedJob: UserSavedJob; vacancy: Vacancy } => Boolean(item.vacancy));

  const closingSoonList = savedList.filter(({ vacancy }) => {
    const days = getDaysRemaining(vacancy.closingDate);
    return days > 0 && days <= 7;
  });

  const appliedList = savedList.filter(({ savedJob }) => savedJob.status === 'applied');

  const recentList = safeRecentViewedIds
    .map((id) => savedVacancyMap.get(id))
    .filter((v): v is Vacancy => Boolean(v));

  const currentList =
    activeSubTab === 'saved'
      ? savedList
      : activeSubTab === 'closingSoon'
      ? closingSoonList
      : activeSubTab === 'applied'
      ? appliedList
      : [];

  const handleStartEditNotes = (vacancyId: string, currentNotes?: string) => {
    setEditingNotesId(vacancyId);
    setTempNotes(currentNotes || '');
  };

  const handleSaveNotes = (vacancyId: string) => {
    onUpdateNotes(vacancyId, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Editorial Title Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            {t.savedJobsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-ui">
            {t.savedSub}
          </p>
        </div>

        <div className="text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 shadow-2xs font-mono-code w-fit">
          {safeSavedJobs.length} tracked vacancies
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('saved')}
          className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap font-display ${
            activeSubTab === 'saved'
              ? 'border-rose-700 text-slate-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t.tabSaved} ({savedList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('closingSoon')}
          className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap font-display ${
            activeSubTab === 'closingSoon'
              ? 'border-rose-700 text-slate-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t.tabClosingSoon} ({closingSoonList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('applied')}
          className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap font-display ${
            activeSubTab === 'applied'
              ? 'border-rose-700 text-slate-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t.tabApplied} ({appliedList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('recent')}
          className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap font-display ${
            activeSubTab === 'recent'
              ? 'border-rose-700 text-slate-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t.tabRecent} ({recentList.length})
        </button>
      </div>

      {/* List Content */}
      {activeSubTab === 'recent' ? (
        recentList.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl space-y-3 shadow-sm">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-display text-lg font-bold text-slate-900">No recently viewed vacancies</h3>
            <p className="text-xs text-slate-500">Browse vacancies on the Latest Feed to record your viewing history.</p>
            <button
              type="button"
              onClick={onBrowseFeed}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Browse Latest Feed
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {recentList.map((vac) => (
              <div key={vac.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <h4
                    onClick={() => onOpenDetail(vac)}
                    className="font-display font-bold text-sm sm:text-base text-slate-950 hover:text-rose-700 cursor-pointer"
                  >
                    {vac.title.en}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{vac.institution.en}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenDetail(vac)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl self-start sm:self-auto transition-all cursor-pointer"
                >
                  View Brief
                </button>
              </div>
            ))}
          </div>
        )
      ) : currentList.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl space-y-3 shadow-sm">
          <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-display text-lg font-bold text-slate-900">No tracked vacancies in this view</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Save any interesting government vacancy notice to keep track of its closing date and application requirements.</p>
          <button
            type="button"
            onClick={onBrowseFeed}
            className="mt-2 px-4 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Explore Latest Gazette Opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {currentList.map(({ savedJob, vacancy }) => {
            const days = getDaysRemaining(vacancy.closingDate);
            return (
              <div
                key={vacancy.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3.5 hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono-code bg-slate-100 px-2 py-0.5 rounded-md">Gazette {vacancy.gazetteNumber}</span>
                      <span>•</span>
                      <span className="font-mono-code bg-slate-100 px-2 py-0.5 rounded-md">Notice {vacancy.noticeNumber}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-800 font-mono-code">
                        Rs. {vacancy.salary.min.toLocaleString()} – {vacancy.salary.max.toLocaleString()}
                      </span>
                    </div>

                    <h3
                      onClick={() => onOpenDetail(vacancy)}
                      className="font-display text-base sm:text-lg font-bold text-slate-950 hover:text-rose-700 cursor-pointer transition-colors"
                    >
                      {vacancy.title[language] || vacancy.title.en}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium">
                      {vacancy.institution[language] || vacancy.institution.en}
                    </p>
                  </div>

                  {/* Status Toggles & Closing Urgency */}
                  <div className="flex sm:flex-col items-end justify-between gap-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <select
                        value={savedJob.status}
                        onChange={(e) =>
                          onUpdateStatus(vacancy.id, e.target.value as UserSavedJob['status'])
                        }
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-rose-600 cursor-pointer shadow-2xs"
                      >
                        <option value="interested">{t.statusInterested}</option>
                        <option value="applied">{t.statusApplied}</option>
                        <option value="not_interested">{t.statusNotInterested}</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => onRemoveSaved(vacancy.id)}
                        className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                          days <= 3
                            ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold animate-pulse'
                            : days <= 7
                            ? 'bg-amber-50 text-amber-900 border-amber-200 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Closing: {vacancy.closingDate} ({days} days left)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes Strip */}
                <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between gap-2">
                  {editingNotesId === vacancy.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder={t.notesPlaceholder}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(vacancy.id)}
                        className="px-3 py-1.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer"
                      >
                        Save Note
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(null)}
                        className="text-slate-400 hover:text-slate-700 text-xs px-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEditNotes(vacancy.id, savedJob.notes)}
                      className="flex-1 text-slate-500 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                      <span>{savedJob.notes ? `Note: "${savedJob.notes}"` : 'Click to add personal application note or index no.'}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenGazetteReader(vacancy)}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{t.viewFullGazette}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(vacancy)}
                      className="text-xs font-bold text-slate-900 hover:text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{t.viewDetails}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
