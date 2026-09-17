import React, { useState, useRef, useEffect } from 'react';
import { Language, FilterState, QualificationLevel, FieldCategory, OrganizationType, JobType } from '../types';
import { translations } from '../data/translations';
import { POPULAR_SEARCH_SUGGESTIONS } from '../data/gazettesData';
import { Search, X, SlidersHorizontal, ChevronDown, Check, RotateCcw } from 'lucide-react';

interface SearchAndFiltersProps {
  language: Language;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const QUALIFICATIONS: QualificationLevel[] = [
  'OL',
  'AL',
  'Diploma',
  'Higher Diploma',
  'Bachelors',
  'Masters',
  'Professional'
];

const FIELDS: FieldCategory[] = [
  'ICT',
  'Administration',
  'Management',
  'Engineering',
  'Finance',
  'Law',
  'Education',
  'Health',
  'Science'
];

const ORG_TYPES: OrganizationType[] = [
  'Ministry',
  'Department',
  'University',
  'Provincial Council',
  'State Institution'
];

const JOB_TYPES: JobType[] = [
  'Permanent',
  'Open Competitive Exam',
  'Limited Exam',
  'Contract'
];

const LOCATIONS = [
  'All Island',
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Kurunegala',
  'Anuradhapura',
  'Badulla'
];

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  language,
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const t = translations[language];
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount =
    (filters.qualifications?.length || 0) +
    (filters.fields?.length || 0) +
    (filters.organizationTypes?.length || 0) +
    (filters.locations?.length || 0) +
    (filters.jobTypes?.length || 0) +
    (filters.closingWithinDays ? 1 : 0) +
    (filters.onlyExams ? 1 : 0);

  const toggleArrayFilter = <T extends string>(
    arr: T[] = [],
    val: T,
    key: keyof FilterState
  ) => {
    const safeArr = Array.isArray(arr) ? arr : [];
    const next = safeArr.includes(val) ? safeArr.filter((item) => item !== val) : [...safeArr, val];
    onFilterChange({ ...filters, [key]: next });
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onFilterChange({ ...filters, searchQuery: suggestion });
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 py-4 px-4 sm:px-8 shadow-2xs">
      <div className="max-w-7xl mx-auto space-y-3" ref={containerRef}>
        {/* Main Search Bar & Quick Toggles */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          {/* Search Input with Autocomplete */}
          <div className="relative flex-1">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Suggestions Popup */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-40 p-3 max-h-72 overflow-y-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 font-display">
                  {t.quickSearchSuggestions}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                  {POPULAR_SEARCH_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="text-left text-xs px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-rose-700 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <span className="group-hover:font-medium">{sug}</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-rose-600">Search</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isFilterPanelOpen || activeFilterCount > 0
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t.allFilters}</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isFilterPanelOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
              }
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 shadow-2xs cursor-pointer hover:border-slate-300"
            >
              <option value="closing_soon">{t.sortClosingSoon}</option>
              <option value="newest">{t.sortNewest}</option>
              <option value="vacancies">{t.sortVacancies}</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filter Drawer */}
        {isFilterPanelOpen && (
          <div className="bg-slate-50/90 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-rose-700" />
                <span>{t.allFilters}</span>
              </h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.clearFilters}</span>
                </button>
              )}
            </div>

            {/* Filter Section: Qualification */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-display">
                {t.filterQualification}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUALIFICATIONS.map((q) => {
                  const isSelected = filters.qualifications.includes(q);
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => toggleArrayFilter(filters.qualifications, q, 'qualifications')}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-700 text-white border-rose-700 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-medium'
                      }`}
                    >
                      {q === 'Bachelors' ? "Bachelor's Degree" : q === 'Masters' ? "Master's Degree" : q}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section: Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-display">
                {t.filterField}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FIELDS.map((f) => {
                  const isSelected = filters.fields.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleArrayFilter(filters.fields, f, 'fields')}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-medium'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Three Column Section: Org Type & Job Type & Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-display">
                  {t.filterOrganization}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ORG_TYPES.map((org) => {
                    const isSelected = filters.organizationTypes.includes(org);
                    return (
                      <button
                        key={org}
                        type="button"
                        onClick={() => toggleArrayFilter(filters.organizationTypes, org, 'organizationTypes')}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {org}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-display">
                  {t.filterJobType}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {JOB_TYPES.map((jt) => {
                    const isSelected = filters.jobTypes.includes(jt);
                    return (
                      <button
                        key={jt}
                        type="button"
                        onClick={() => toggleArrayFilter(filters.jobTypes, jt, 'jobTypes')}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {jt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-display">
                  {t.filterClosingSoon}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        closingWithinDays: filters.closingWithinDays === 3 ? null : 3
                      })
                    }
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      filters.closingWithinDays === 3
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Next 3 days
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        closingWithinDays: filters.closingWithinDays === 7 ? null : 7
                      })
                    }
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      filters.closingWithinDays === 7
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Next 7 days
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        closingWithinDays: filters.closingWithinDays === 14 ? null : 14
                      })
                    }
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      filters.closingWithinDays === 14
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Next 14 days
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Pills Bar & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">
              {t.showingResults}{' '}
              <strong className="text-slate-900 font-bold font-mono-code">{totalResults}</strong>{' '}
              {t.vacanciesFound}
            </span>

            {/* Active Pills */}
            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-slate-200">
                Query: "{filters.searchQuery}"
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                  className="hover:text-rose-700 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.qualifications.map((q) => (
              <span
                key={q}
                className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-rose-200"
              >
                {q}
                <button
                  type="button"
                  onClick={() => toggleArrayFilter(filters.qualifications, q, 'qualifications')}
                  className="hover:text-rose-950 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.fields.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-slate-200"
              >
                {f}
                <button
                  type="button"
                  onClick={() => toggleArrayFilter(filters.fields, f, 'fields')}
                  className="hover:text-rose-700 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.closingWithinDays && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-amber-200">
                Closing in ≤ {filters.closingWithinDays} days
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, closingWithinDays: null })}
                  className="hover:text-amber-950 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-[11px] text-rose-700 hover:text-rose-900 hover:underline font-bold ml-1.5 cursor-pointer"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
