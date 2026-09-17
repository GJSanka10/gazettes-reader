import React, { useState, useEffect, useMemo } from 'react';
import {
  Language,
  Vacancy,
  FilterState,
  UserProfile,
  UserSavedJob,
  GazetteEdition
} from './types';
import {
  INITIAL_VACANCIES,
  CURRENT_GAZETTE_EDITION,
  ARCHIVED_GAZETTES
} from './data/gazettesData';
import { translations } from './data/translations';
import { getDaysRemaining } from './utils/helpers';
import { Header } from './components/Header';
import { TodayGazetteBanner } from './components/TodayGazetteBanner';
import { SearchAndFilters } from './components/SearchAndFilters';
import { JobCardRow } from './components/JobCardRow';
import { JobDetailModal } from './components/JobDetailModal';
import { GazetteReaderModal } from './components/GazetteReaderModal';
import { ProfileMatcherModal } from './components/ProfileMatcherModal';
import { SavedJobsView } from './components/SavedJobsView';
import { AdminVerificationDesk } from './components/AdminVerificationDesk';
import { ArchiveBrowserModal } from './components/ArchiveBrowserModal';
import { Footer } from './components/Footer';
import { BookOpen, SearchX, RotateCcw, ShieldCheck, Sparkles, Filter } from 'lucide-react';

const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: '',
  qualifications: [],
  fields: [],
  organizationTypes: [],
  locations: [],
  jobTypes: [],
  closingWithinDays: null,
  onlyExams: false,
  sortBy: 'closing_soon',
};

export default function App() {
  // 1. Language State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('gazette_lang');
    return (saved as Language) || 'en';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('gazette_lang', lang);
  };

  // 2. Navigation State
  const [activeNav, setActiveNav] = useState<'feed' | 'archive' | 'saved' | 'admin'>('feed');

  // 3. Gazette Edition
  const [currentEdition, setCurrentEdition] = useState<GazetteEdition>(CURRENT_GAZETTE_EDITION);

  // 4. Vacancy Data with LocalStorage Persistence for Admin Edits
  const [vacancies, setVacancies] = useState<Vacancy[]>(() => {
    const saved = localStorage.getItem('gazette_vacancies_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasRealGovData = parsed.some((p: Vacancy) => p.isRealGovernmentData);
          if (hasRealGovData) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse cached vacancies', e);
      }
    }
    return INITIAL_VACANCIES;
  });

  useEffect(() => {
    localStorage.setItem('gazette_vacancies_data', JSON.stringify(vacancies));
  }, [vacancies]);

  // Sync with live Gazette backend service
  useEffect(() => {
    fetch('/api/gazettes/dates')
      .then((res) => res.json())
      .then((data) => {
        if (data?.dates && data.dates.length > 0) {
          const latestDate = data.dates[0];
          fetch(`/api/gazettes/edition?date=${latestDate}`)
            .then((r) => r.json())
            .then((editionData) => {
              if (editionData && editionData.gazetteNumber) {
                setCurrentEdition((prev) => ({
                  ...prev,
                  gazetteNumber: editionData.gazetteNumber || prev.gazetteNumber,
                  originalPdfUrl: editionData.englishPdf || prev.originalPdfUrl,
                  originalSinhalaPdfUrl: editionData.sinhalaPdf || prev.originalSinhalaPdfUrl,
                  originalTamilPdfUrl: editionData.tamilPdf || prev.originalTamilPdfUrl,
                  liveVerified: true,
                }));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // 5. User Profile (Eligibility Matcher)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gazette_candidate_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            highestEducation: parsed.highestEducation || '',
            degreeField: parsed.degreeField || '',
            age: parsed.age || '',
            preferredDistricts: Array.isArray(parsed.preferredDistricts) ? parsed.preferredDistricts : [],
            currentStatus: parsed.currentStatus || '',
          };
        }
      } catch (e) {
        console.error('Failed to parse candidate profile', e);
      }
    }
    return null;
  });

  const handleSaveProfile = (profile: UserProfile) => {
    const sanitizedProfile: UserProfile = {
      ...profile,
      preferredDistricts: Array.isArray(profile?.preferredDistricts) ? profile.preferredDistricts : [],
    };
    setUserProfile(sanitizedProfile);
    localStorage.setItem('gazette_candidate_profile', JSON.stringify(sanitizedProfile));
  };

  const handleClearProfile = () => {
    setUserProfile(null);
    localStorage.removeItem('gazette_candidate_profile');
  };

  // 6. User Saved Jobs Tracker
  const [savedJobs, setSavedJobs] = useState<UserSavedJob[]>(() => {
    const saved = localStorage.getItem('gazette_saved_jobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved jobs', e);
      }
    }
    // Default initial saved job for instant demo
    return [
      {
        vacancyId: 'vac-1',
        savedDate: '2026-09-12',
        status: 'interested',
        notes: 'SLAS exam fee Rs. 1,000 paid at Bank of Ceylon',
      },
      {
        vacancyId: 'vac-2',
        savedDate: '2026-09-12',
        status: 'interested',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('gazette_saved_jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const handleToggleSaveJob = (vacancyId: string) => {
    setSavedJobs((prev) => {
      const exists = prev.find((item) => item.vacancyId === vacancyId);
      if (exists) {
        return prev.filter((item) => item.vacancyId !== vacancyId);
      } else {
        return [
          ...prev,
          {
            vacancyId,
            savedDate: new Date().toISOString().split('T')[0],
            status: 'interested',
          },
        ];
      }
    });
  };

  const handleUpdateJobStatus = (vacancyId: string, status: UserSavedJob['status']) => {
    setSavedJobs((prev) =>
      prev.map((item) => (item.vacancyId === vacancyId ? { ...item, status } : item))
    );
  };

  const handleUpdateJobNotes = (vacancyId: string, notes: string) => {
    setSavedJobs((prev) =>
      prev.map((item) => (item.vacancyId === vacancyId ? { ...item, notes } : item))
    );
  };

  const handleRemoveSavedJob = (vacancyId: string) => {
    setSavedJobs((prev) => prev.filter((item) => item.vacancyId !== vacancyId));
  };

  // 7. Recently Viewed Tracker
  const [recentViewedIds, setRecentViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('gazette_recent_viewed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse recent viewed', e);
      }
    }
    return ['vac-1', 'vac-2'];
  });

  const recordViewedVacancy = (vacancyId: string) => {
    setRecentViewedIds((prev) => {
      const next = [vacancyId, ...prev.filter((id) => id !== vacancyId)].slice(0, 10);
      localStorage.setItem('gazette_recent_viewed', JSON.stringify(next));
      return next;
    });
  };

  // 8. Filters State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  // 9. Modals State
  const [selectedVacancyForDetail, setSelectedVacancyForDetail] = useState<Vacancy | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [selectedVacancyForReader, setSelectedVacancyForReader] = useState<Vacancy | null>(null);
  const [isMatcherOpen, setIsMatcherOpen] = useState<boolean>(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);

  // Modal actions
  const handleOpenDetail = (vacancy: Vacancy) => {
    recordViewedVacancy(vacancy.id);
    setSelectedVacancyForDetail(vacancy);
  };

  const handleOpenReader = (vacancy?: Vacancy) => {
    const target = vacancy || vacancies[0];
    if (target) {
      recordViewedVacancy(target.id);
      setSelectedVacancyForReader(target);
    }
    setIsReaderOpen(true);
  };

  // 10. Filter and Search Logic
  const filteredVacancies = useMemo(() => {
    return vacancies
      .filter((vac) => {
        // If in standard public view, show only verified or existing items
        // (Pending verification items can still be seen in admin view)
        if (activeNav !== 'admin' && vac.verifiedStatus === 'pending_verification') {
          return false;
        }

        // Search Query
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchTitleEn = vac.title.en.toLowerCase().includes(query);
          const matchTitleSi = vac.title.si?.toLowerCase().includes(query) || false;
          const matchTitleTa = vac.title.ta?.toLowerCase().includes(query) || false;
          const matchInstEn = vac.institution.en.toLowerCase().includes(query);
          const matchMinistry = vac.ministry.en.toLowerCase().includes(query);
          const matchGazetteNum = vac.gazetteNumber.toLowerCase().includes(query);
          const matchNoticeNum = vac.noticeNumber.toLowerCase().includes(query);
          const matchQual = vac.qualifications.summary.en.toLowerCase().includes(query);
          const matchField = vac.field.toLowerCase().includes(query);
          const matchLocation = vac.location.toLowerCase().includes(query);

          if (
            !matchTitleEn &&
            !matchTitleSi &&
            !matchTitleTa &&
            !matchInstEn &&
            !matchMinistry &&
            !matchGazetteNum &&
            !matchNoticeNum &&
            !matchQual &&
            !matchField &&
            !matchLocation
          ) {
            return false;
          }
        }

        // Qualifications Filter
        if (filters.qualifications && filters.qualifications.length > 0) {
          if (!filters.qualifications.includes(vac.qualifications.level)) {
            return false;
          }
        }

        // Fields Filter
        if (filters.fields && filters.fields.length > 0) {
          if (!filters.fields.includes(vac.field)) {
            return false;
          }
        }

        // Organization Types
        if (filters.organizationTypes && filters.organizationTypes.length > 0) {
          if (!filters.organizationTypes.includes(vac.organizationType)) {
            return false;
          }
        }

        // Locations
        if (filters.locations && filters.locations.length > 0) {
          if (!filters.locations.includes(vac.location) && vac.location !== 'All Island') {
            return false;
          }
        }

        // Job Types
        if (filters.jobTypes && filters.jobTypes.length > 0) {
          if (!filters.jobTypes.includes(vac.jobType)) {
            return false;
          }
        }

        // Closing within Days
        if (filters.closingWithinDays !== null) {
          const daysLeft = getDaysRemaining(vac.closingDate);
          if (daysLeft < 0 || daysLeft > filters.closingWithinDays) {
            return false;
          }
        }

        // Only Exams
        if (filters.onlyExams) {
          if (
            vac.jobType !== 'Open Competitive Exam' &&
            vac.jobType !== 'Limited Exam'
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'closing_soon') {
          const daysA = getDaysRemaining(a.closingDate);
          const daysB = getDaysRemaining(b.closingDate);
          return daysA - daysB;
        } else if (filters.sortBy === 'newest') {
          return new Date(b.gazetteDate).getTime() - new Date(a.gazetteDate).getTime();
        } else if (filters.sortBy === 'vacancies') {
          return b.vacanciesCount - a.vacanciesCount;
        }
        return 0;
      });
  }, [vacancies, filters, activeNav]);

  // Quick Filter handlers
  const handleQuickKeywordFilter = (keyword: string) => {
    setFilters({
      ...INITIAL_FILTER_STATE,
      searchQuery: keyword,
    });
    setActiveNav('feed');
  };

  const handleQuickExamsFilter = () => {
    setFilters({
      ...INITIAL_FILTER_STATE,
      onlyExams: true,
    });
    setActiveNav('feed');
  };

  // Admin Actions
  const handleAddVacancy = (newVac: Vacancy) => {
    setVacancies((prev) => [newVac, ...prev]);
  };

  const handleUpdateVacancy = (updatedVac: Vacancy) => {
    setVacancies((prev) =>
      prev.map((item) => (item.id === updatedVac.id ? updatedVac : item))
    );
  };

  const handleTogglePublishStatus = (vacancyId: string) => {
    setVacancies((prev) =>
      prev.map((item) => {
        if (item.id === vacancyId) {
          const nextStatus =
            item.verifiedStatus === 'verified' ? 'pending_verification' : 'verified';
          return { ...item, verifiedStatus: nextStatus };
        }
        return item;
      })
    );
  };

  const handleDeleteVacancy = (vacancyId: string) => {
    setVacancies((prev) => prev.filter((item) => item.id !== vacancyId));
  };

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-ui selection:bg-rose-100 selection:text-rose-900">
      {/* Top Header & Masthead */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        gazette={currentEdition}
        activeNav={activeNav}
        onNavChange={(nav) => {
          if (nav === 'archive') {
            setIsArchiveOpen(true);
          } else {
            setActiveNav(nav);
          }
        }}
        savedCount={savedJobs?.length || 0}
        onOpenMatcher={() => setIsMatcherOpen(true)}
        hasProfile={Boolean(userProfile?.highestEducation || userProfile?.age)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeNav === 'feed' && (
          <div>
            {/* Today's Gazette Hero & Date Banner */}
            <TodayGazetteBanner
              language={language}
              gazette={currentEdition}
              onOpenReader={() => handleOpenReader()}
              onQuickFilter={handleQuickKeywordFilter}
              onSelectExams={handleQuickExamsFilter}
            />

            {/* Sticky Search & Filter Toolbar */}
            <SearchAndFilters
              language={language}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              totalResults={filteredVacancies?.length || 0}
            />

            {/* Editorial Feed Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
              {(filteredVacancies?.length || 0) === 0 ? (
                /* Empty state */
                <div className="bg-white border border-slate-200/80 p-12 text-center rounded-2xl shadow-xs space-y-3">
                  <SearchX className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {t.noVacanciesFound}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {t.tryAdjustingFilters}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.clearFilters}</span>
                  </button>
                </div>
              ) : (
                /* Informative Editorial Rows Feed */
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-display font-bold text-slate-900">
                      Gazette Issue No. {currentEdition.gazetteNumber} • Advertised Notices
                    </span>
                    <span className="text-[11px] text-slate-500 font-ui">
                      Published by Authority of the Department of Government Printing
                    </span>
                  </div>

                  {filteredVacancies.map((vacancy) => {
                    const isSaved = savedJobs.find((sj) => sj.vacancyId === vacancy.id);
                    return (
                      <JobCardRow
                        key={vacancy.id}
                        vacancy={vacancy}
                        language={language}
                        userProfile={userProfile}
                        savedJob={isSaved}
                        onToggleSave={handleToggleSaveJob}
                        onOpenDetail={handleOpenDetail}
                        onOpenGazetteReader={(vac) => handleOpenReader(vac)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Jobs & Application Tracker View */}
        {activeNav === 'saved' && (
          <SavedJobsView
            language={language}
            vacancies={vacancies}
            savedJobs={savedJobs}
            recentViewedIds={recentViewedIds}
            onUpdateStatus={handleUpdateJobStatus}
            onUpdateNotes={handleUpdateJobNotes}
            onRemoveSaved={handleRemoveSavedJob}
            onOpenDetail={handleOpenDetail}
            onOpenGazetteReader={(vac) => handleOpenReader(vac)}
            onBrowseFeed={() => setActiveNav('feed')}
          />
        )}

        {/* Admin Editorial & Verification Desk View */}
        {activeNav === 'admin' && (
          <AdminVerificationDesk
            language={language}
            vacancies={vacancies}
            onAddVacancy={handleAddVacancy}
            onUpdateVacancy={handleUpdateVacancy}
            onTogglePublishStatus={handleTogglePublishStatus}
            onDeleteVacancy={handleDeleteVacancy}
          />
        )}
      </main>

      {/* Global Modals */}

      {/* 1. Job Detail Page Modal */}
      <JobDetailModal
        vacancy={selectedVacancyForDetail}
        language={language}
        userProfile={userProfile}
        savedJob={savedJobs.find((sj) => sj.vacancyId === selectedVacancyForDetail?.id)}
        onClose={() => setSelectedVacancyForDetail(null)}
        onToggleSave={handleToggleSaveJob}
        onOpenGazetteReader={(vac) => {
          setSelectedVacancyForDetail(null);
          handleOpenReader(vac);
        }}
      />

      {/* 2. Interactive Gazette Document Reader */}
      <GazetteReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        language={language}
        gazette={currentEdition}
        initialVacancy={selectedVacancyForReader}
        vacancies={vacancies}
        onToggleSave={handleToggleSaveJob}
        isSaved={Boolean(savedJobs.find((sj) => sj.vacancyId === selectedVacancyForReader?.id))}
      />

      {/* 3. Candidate Eligibility Matcher Modal */}
      <ProfileMatcherModal
        isOpen={isMatcherOpen}
        onClose={() => setIsMatcherOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onClearProfile={handleClearProfile}
        language={language}
      />

      {/* 4. Previous Gazette Archives Browser */}
      <ArchiveBrowserModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        language={language}
        onSelectGazette={(edition) => {
          setCurrentEdition(edition);
          setActiveNav('feed');
        }}
      />

      {/* Editorial Footer */}
      <Footer
        language={language}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenReader={() => handleOpenReader()}
        onOpenAdmin={() => setActiveNav('admin')}
      />
    </div>
  );
}
