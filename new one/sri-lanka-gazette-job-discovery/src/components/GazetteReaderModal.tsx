import React, { useState } from 'react';
import { Vacancy, Language, GazetteEdition } from '../types';
import { SAMPLE_GAZETTE_PAGES } from '../data/gazettesData';
import { translations } from '../data/translations';
import {
  X,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  FileText,
  Columns,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ExternalLink,
  Download,
  Building,
  Award,
  Calendar,
  Users,
  Banknote,
  Info
} from 'lucide-react';

interface GazetteReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  gazette: GazetteEdition;
  initialVacancy?: Vacancy | null;
  vacancies: Vacancy[];
  onSelectVacancy?: (v: Vacancy) => void;
  onToggleSave?: (vId: string) => void;
  isSaved?: boolean;
}

export const GazetteReaderModal: React.FC<GazetteReaderModalProps> = ({
  isOpen,
  onClose,
  language,
  gazette,
  initialVacancy,
  vacancies = [],
  onToggleSave,
  isSaved,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const safeVacancies = Array.isArray(vacancies) ? vacancies : [];
  const [currentPage, setCurrentPage] = useState<number>(initialVacancy?.gazettePage || 14);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'docOnly' | 'briefOnly'>('split');
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy>(
    initialVacancy || vacancies[0]
  );
  const [mobileTab, setMobileTab] = useState<'doc' | 'brief' | 'pages'>('doc');
  const [contentView, setContentView] = useState<'transcript' | 'pdf'>('transcript');
  const [pdfLanguage, setPdfLanguage] = useState<'en' | 'si' | 'ta'>('en');

  const getPdfUrl = () => {
    if (pdfLanguage === 'si' && gazette.originalSinhalaPdfUrl) return gazette.originalSinhalaPdfUrl;
    if (pdfLanguage === 'ta' && gazette.originalTamilPdfUrl) return gazette.originalTamilPdfUrl;
    return gazette.originalPdfUrl || '';
  };

  // When a vacancy is clicked in the reader's sidebar:
  const handleJumpToVacancy = (vac: Vacancy) => {
    setSelectedVacancy(vac);
    setCurrentPage(vac.gazettePage);
    if (window.innerWidth < 1024) {
      setMobileTab('doc');
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 75));
  const handleResetZoom = () => setZoomLevel(100);

  // Filter or match page
  const activePageData = SAMPLE_GAZETTE_PAGES.find((p) => p.pageNumber === currentPage) || {
    pageNumber: currentPage,
    sectionHeader: `PART I : SEC. (IIA) — GAZETTE OF THE DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA — ${gazette.date}`,
    title: selectedVacancy?.title.en || 'GOVERNMENT OF SRI LANKA NOTICE',
    subHeader: `MINISTRY OF PUBLIC ADMINISTRATION\nNotice No. ${selectedVacancy?.noticeNumber || '09-400/1'}`,
    columns: [
      `POSTS — VACANT\n\nNotice is hereby given that applications are invited for recruitment to the post of ${selectedVacancy?.title.en}.\n\n1. Salary Code: ${selectedVacancy?.salary.code} (${selectedVacancy?.salary.scale})\n\n2. Number of Vacancies: ${selectedVacancy?.vacanciesCount}\n\n3. Qualifications: ${selectedVacancy?.qualifications.summary.en}\n\n4. Age Limit: ${selectedVacancy?.ageLimit.description.en}\n\nClosing Date: ${selectedVacancy?.closingDate}.`,
      `HOW TO APPLY\n\nCandidates must prepare their applications in accordance with the specimen form published in this Gazette.\n\nApplications should be sent by Registered Post to:\n${selectedVacancy?.howToApply.postalAddress.en}\n\nClosing Date for Applications: ${selectedVacancy?.closingDate}.\n\nBy Order of the Public Service Commission,\nSecretary, Ministry of Public Administration.`
    ]
  };

  // Helper to highlight search term in text
  const renderHighlightedText = (text: string) => {
    if (!docSearchQuery.trim()) {
      return text;
    }
    const query = docSearchQuery.trim();
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-[#16181b] font-semibold px-0.5 rounded-2xs">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-1 sm:p-3 overflow-hidden">
      <div className="bg-slate-950 w-full h-full max-w-[98vw] max-h-[96vh] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in duration-150 text-white">
        {/* Top Gazette Reader Toolbar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 ring-2 ring-rose-500/30"></span>
              <span className="font-display text-sm font-bold tracking-tight">
                Sri Lanka Gazette Reader
              </span>
            </div>
            <span className="hidden md:inline text-xs text-slate-400 font-mono-code bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Issue No. {gazette.gazetteNumber} • {gazette.formattedDate}
            </span>
          </div>

          {/* Search within document */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              placeholder={t.searchInDocument}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-600 transition-colors"
            />
            {docSearchQuery && (
              <button
                type="button"
                onClick={() => setDocSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Page controls & Zoom Controls */}
          <div className="flex items-center gap-2 text-xs">
            {/* Page navigation */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer rounded-lg hover:bg-slate-800"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono-code px-1.5 text-slate-300">
                {t.pageOf} <strong className="text-white">{currentPage}</strong> {t.of} {gazette.pagesCount}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(gazette.pagesCount, p + 1))}
                disabled={currentPage >= gazette.pagesCount}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer rounded-lg hover:bg-slate-800"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 text-slate-300 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800"
                title={t.zoomOut}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono-code w-10 text-center text-slate-300">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 text-slate-300 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800"
                title={t.zoomIn}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 text-slate-300 hover:text-white text-[10px] cursor-pointer rounded-lg hover:bg-slate-800"
                title={t.resetZoom}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Content View Switcher: Typeset vs Official PDF */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setContentView('transcript')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  contentView === 'transcript' ? 'bg-rose-700 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
                title="View formatted editorial transcript"
              >
                Typeset View
              </button>
              <button
                type="button"
                onClick={() => setContentView('pdf')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  contentView === 'pdf' ? 'bg-rose-700 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
                title="View original official PDF scanned document"
              >
                Official PDF
              </button>
            </div>

            {/* Desktop View Modes */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.splitView}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('docOnly')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'docOnly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.docOnly}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('briefOnly')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'briefOnly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.briefOnly}
              </button>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 flex items-center justify-around text-xs shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('doc')}
            className={`flex-1 py-2.5 text-center font-semibold border-b-2 font-display ${
              mobileTab === 'doc' ? 'border-rose-600 text-white' : 'border-transparent text-slate-400'
            }`}
          >
            {t.docOnly}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('brief')}
            className={`flex-1 py-2.5 text-center font-semibold border-b-2 font-display ${
              mobileTab === 'brief' ? 'border-rose-600 text-white' : 'border-transparent text-slate-400'
            }`}
          >
            {t.briefOnly}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('pages')}
            className={`flex-1 py-2.5 text-center font-semibold border-b-2 font-display ${
              mobileTab === 'pages' ? 'border-rose-600 text-white' : 'border-transparent text-slate-400'
            }`}
          >
            {t.switchNotice}
          </button>
        </div>

        {/* Main 3-Pane Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Pane 1: Left Index of Vacancies / Pages */}
          <div
            className={`w-72 bg-slate-950 border-r border-slate-800 flex-col shrink-0 overflow-y-auto custom-scrollbar ${
              mobileTab === 'pages' ? 'flex w-full' : 'hidden lg:flex'
            }`}
          >
            <div className="p-3.5 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between font-display">
              <span>{t.switchNotice}</span>
              <span className="text-[10px] text-slate-500 font-mono-code">{safeVacancies.length} notices</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {safeVacancies.map((vac) => {
                const isSelected = selectedVacancy.id === vac.id;
                return (
                  <button
                    key={vac.id}
                    type="button"
                    onClick={() => handleJumpToVacancy(vac)}
                    className={`w-full text-left p-3.5 transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-950/40 border-l-4 border-rose-600 text-white'
                        : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono-code text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded">
                        Pg. {vac.gazettePage}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-code">
                        {vac.noticeNumber}
                      </span>
                    </div>
                    <span className="font-semibold text-white line-clamp-2 leading-snug font-display">
                      {vac.title.en}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate font-ui">
                      {vac.institution.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pane 2: Center Official Gazette Document Viewer */}
          <div
            className={`flex-1 bg-slate-900/60 overflow-auto p-3 sm:p-6 flex justify-center items-start custom-scrollbar ${
              viewMode === 'briefOnly' ? 'hidden' : mobileTab === 'doc' || mobileTab === 'pages' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {contentView === 'pdf' ? (
              <div className="w-full h-full flex flex-col bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800 min-h-[600px]">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold text-xs">Edition Language:</span>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPdfLanguage('en')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                          pdfLanguage === 'en' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfLanguage('si')}
                        className={`px-2.5 py-1 rounded-md text-xs font-sinhala cursor-pointer ${
                          pdfLanguage === 'si' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        සිංහල
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfLanguage('ta')}
                        className={`px-2.5 py-1 rounded-md text-xs font-tamil cursor-pointer ${
                          pdfLanguage === 'ta' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        தமிழ்
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={getPdfUrl()}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-500" />
                      <span>Download Official PDF</span>
                    </a>
                    <a
                      href={getPdfUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold transition-colors shadow-xs"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                <div className="flex-1 w-full h-[650px] sm:h-[750px] relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                  <iframe
                    src={`${getPdfUrl()}#page=${currentPage}`}
                    className="w-full h-full border-0"
                    title="Official Sri Lanka Gazette PDF"
                  />
                </div>
              </div>
            ) : (
              /* Emulated authentic printed Gazette Paper Sheet */
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="gazette-paper text-slate-900 w-full max-w-[820px] min-h-[1100px] shadow-2xl p-8 sm:p-12 border border-amber-200/60 rounded-xl font-editorial transition-transform select-text bg-[#fcfbf7]"
              >
                {/* Official Gazette Top Running Header */}
                <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                  <div className="text-[11px] font-sans font-bold tracking-widest uppercase text-slate-700 flex items-center justify-between">
                    <span>Part I : SEC. (IIA)</span>
                    <span className="font-sinhala">ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජයේ ගැසට් පත්‍රය</span>
                    <span>PAGE {activePageData.pageNumber}</span>
                  </div>

                  {/* Main Crest / Masthead */}
                  <div className="my-2.5">
                    <div className="text-xs tracking-widest uppercase text-slate-600 font-sans font-medium">
                      The Gazette of the Democratic Socialist Republic of Sri Lanka
                    </div>
                    <div className="text-sm font-bold tracking-wider uppercase font-sans mt-0.5 text-slate-900">
                      EXTRAORDINARY
                    </div>
                  </div>

                  <div className="text-[11px] font-mono-code text-slate-600 flex items-center justify-between border-t border-slate-900/40 pt-1.5 mt-1">
                    <span>No. {gazette.gazetteNumber}</span>
                    <span className="font-bold uppercase">COLOMBO, {gazette.formattedDate}</span>
                    <span>Published by Authority</span>
                  </div>
                </div>

              {/* Sub-Header Notice Section */}
              <div className="text-center my-4 space-y-1">
                <div className="text-xs uppercase font-sans font-bold tracking-widest text-slate-900">
                  PART I : SECTION (IIA) — ADVERTISING
                </div>
                <div className="text-[11px] font-sans italic text-slate-600">
                  Posts — Vacant / විභාග සහ පුරප්පාඩු / அரச வெற்றிடங்கள்
                </div>
                <div className="h-0.5 w-24 bg-slate-900 mx-auto my-2"></div>
              </div>

              {/* Gazette Page Title */}
              <div className="text-center mb-6">
                <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase text-slate-950 max-w-xl mx-auto leading-tight">
                  {renderHighlightedText(activePageData.title)}
                </h2>
                {activePageData.subHeader && (
                  <p className="text-xs font-sans font-semibold text-slate-600 mt-1 whitespace-pre-line uppercase tracking-wider">
                    {renderHighlightedText(activePageData.subHeader)}
                  </p>
                )}
              </div>

              {/* 2-Column Classic Gazette Typography Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-justify">
                {activePageData.columns.map((colText, idx) => (
                  <div key={idx} className="space-y-3 font-editorial">
                    {colText.split('\n\n').map((para, pIdx) => {
                      const isHighlight =
                        selectedVacancy &&
                        para.toLowerCase().includes(selectedVacancy.title.en.toLowerCase().slice(0, 20));
                      return (
                        <p
                          key={pIdx}
                          className={`whitespace-pre-line ${
                            isHighlight
                              ? 'bg-amber-100/90 p-2.5 border-l-3 border-rose-700 text-slate-950 rounded-r-md shadow-2xs'
                              : 'text-slate-800'
                          }`}
                        >
                          {renderHighlightedText(para)}
                        </p>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Official Gazette Bottom Footer */}
              <div className="mt-12 pt-4 border-t border-slate-900/60 text-[10px] font-sans text-slate-500 flex justify-between items-center">
                <span>PRINTED AT THE DEPARTMENT OF GOVERNMENT PRINTING, SRI LANKA.</span>
                <span>TO BE PURCHASED AT THE GOVERNMENT PUBLICATIONS BUREAU, COLOMBO 01.</span>
              </div>
            </div>
            )}
          </div>

          {/* Pane 3: Right Structured Vacancy Facts Panel */}
          <div
            className={`w-96 bg-slate-950 border-l border-slate-800 flex-col shrink-0 overflow-y-auto custom-scrollbar ${
              viewMode === 'docOnly' ? 'hidden' : mobileTab === 'brief' ? 'flex w-full' : 'hidden lg:flex'
            }`}
          >
            {selectedVacancy ? (
              <div className="p-5 space-y-4 text-xs text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs uppercase font-bold text-rose-400 tracking-wider font-display">
                    Vacancy Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleSave && onToggleSave(selectedVacancy.id)}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-rose-500" />
                    <span>Save</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-white leading-snug">
                    {selectedVacancy.title.en}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium font-ui">
                    {selectedVacancy.institution.en}
                  </p>
                </div>

                {/* Key Facts Summary */}
                <div className="space-y-2.5 pt-1">
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">{t.closingDate}:</span>
                      <span className="font-semibold text-white font-mono-code">
                        {selectedVacancy.closingDate}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">{t.salary}:</span>
                      <span className="font-bold text-emerald-400 font-mono-code">
                        Rs. {selectedVacancy.salary.min.toLocaleString()} – {selectedVacancy.salary.max.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">{t.vacanciesCount}:</span>
                      <span className="font-semibold text-white">
                        {selectedVacancy.vacanciesCount} Positions
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">{t.ageRange}:</span>
                      <span className="font-semibold text-white font-mono-code">
                        {selectedVacancy.ageLimit.min}–{selectedVacancy.ageLimit.max} Years
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5 font-display">
                      {t.qualificationReq}
                    </span>
                    <p className="text-xs text-white leading-relaxed font-ui">
                      {selectedVacancy.qualifications.summary.en}
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5 font-display">
                      {t.howToApply}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-ui">
                      Send to: {selectedVacancy.howToApply.postalAddress.en}
                    </p>
                    {selectedVacancy.howToApply.onlinePortalUrl && (
                      <a
                        href={selectedVacancy.howToApply.onlinePortalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline font-semibold mt-2.5 inline-flex items-center gap-1.5"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5 font-ui">
                    <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      Original printed source: Gazette No. {selectedVacancy.gazetteNumber}, Notice No. {selectedVacancy.noticeNumber}. Verify with physical document.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Select a vacancy notice to view structured facts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
