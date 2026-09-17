import React, { useState } from 'react';
import { Vacancy, Language, QualificationLevel, FieldCategory, OrganizationType, JobType } from '../types';
import { translations } from '../data/translations';
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  UploadCloud,
  FileCheck,
  Eye,
  FileText,
  X,
  Sparkles
} from 'lucide-react';

interface AdminVerificationDeskProps {
  language: Language;
  vacancies: Vacancy[];
  onAddVacancy: (newVacancy: Vacancy) => void;
  onUpdateVacancy: (updatedVacancy: Vacancy) => void;
  onTogglePublishStatus: (vacancyId: string) => void;
  onDeleteVacancy: (vacancyId: string) => void;
}

export const AdminVerificationDesk: React.FC<AdminVerificationDeskProps> = ({
  language,
  vacancies,
  onAddVacancy,
  onUpdateVacancy,
  onTogglePublishStatus,
  onDeleteVacancy,
}) => {
  const t = translations[language];
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  // Form states for new/edit vacancy
  const [titleEn, setTitleEn] = useState('');
  const [titleSi, setTitleSi] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [institutionEn, setInstitutionEn] = useState('');
  const [ministryEn, setMinistryEn] = useState('');
  const [gazetteNumber, setGazetteNumber] = useState('2,403');
  const [noticeNumber, setNoticeNumber] = useState('09-440/1');
  const [closingDate, setClosingDate] = useState('2026-10-15');
  const [field, setField] = useState<FieldCategory>('ICT');
  const [qualLevel, setQualLevel] = useState<QualificationLevel>('Bachelors');
  const [qualSummaryEn, setQualSummaryEn] = useState('');
  const [salaryMin, setSalaryMin] = useState(52000);
  const [salaryMax, setSalaryMax] = useState(89800);
  const [vacanciesCount, setVacanciesCount] = useState(10);
  const [location, setLocation] = useState('All Island');
  const [jobType, setJobType] = useState<JobType>('Open Competitive Exam');
  const [postalAddressEn, setPostalAddressEn] = useState('Ministry of Public Administration, Independence Square, Colombo 07');
  const [isVerifiedCheck, setIsVerifiedCheck] = useState(false);

  const resetForm = () => {
    setTitleEn('');
    setTitleSi('');
    setTitleTa('');
    setInstitutionEn('');
    setMinistryEn('');
    setGazetteNumber('2,403');
    setNoticeNumber('09-440/1');
    setClosingDate('2026-10-15');
    setField('ICT');
    setQualLevel('Bachelors');
    setQualSummaryEn('');
    setSalaryMin(52000);
    setSalaryMax(89800);
    setVacanciesCount(10);
    setLocation('All Island');
    setJobType('Open Competitive Exam');
    setPostalAddressEn('Ministry of Public Administration, Independence Square, Colombo 07');
    setIsVerifiedCheck(false);
    setEditingVacancy(null);
  };

  const handleOpenEdit = (vac: Vacancy) => {
    setEditingVacancy(vac);
    setTitleEn(vac.title.en);
    setTitleSi(vac.title.si || '');
    setTitleTa(vac.title.ta || '');
    setInstitutionEn(vac.institution.en);
    setMinistryEn(vac.ministry.en);
    setGazetteNumber(vac.gazetteNumber);
    setNoticeNumber(vac.noticeNumber);
    setClosingDate(vac.closingDate);
    setField(vac.field);
    setQualLevel(vac.qualifications.level);
    setQualSummaryEn(vac.qualifications.summary.en);
    setSalaryMin(vac.salary.min);
    setSalaryMax(vac.salary.max);
    setVacanciesCount(vac.vacanciesCount);
    setLocation(vac.location);
    setJobType(vac.jobType);
    setPostalAddressEn(vac.howToApply.postalAddress.en);
    setIsVerifiedCheck(vac.verifiedStatus === 'verified');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vacancyData: Vacancy = {
      id: editingVacancy ? editingVacancy.id : `custom-vac-${Date.now()}`,
      slug: editingVacancy ? editingVacancy.slug : `custom-vac-${Date.now()}`,
      title: {
        en: titleEn || 'New Vacancy Notice',
        si: titleSi || titleEn,
        ta: titleTa || titleEn,
      },
      institution: {
        en: institutionEn || 'Government Department',
        si: institutionEn,
        ta: institutionEn,
      },
      ministry: {
        en: ministryEn || 'Line Ministry',
        si: ministryEn,
        ta: ministryEn,
      },
      gazetteNumber,
      gazetteDate: '2026-09-12',
      gazettePart: 'Part I: Section (IIA) — Posts Vacant',
      gazettePage: 10,
      noticeNumber,
      closingDate,
      isNew: true,
      salary: {
        scale: `Rs. ${salaryMin.toLocaleString()} – ${salaryMax.toLocaleString()} p.m.`,
        code: 'MN-2016',
        min: Number(salaryMin),
        max: Number(salaryMax),
      },
      vacanciesCount: Number(vacanciesCount),
      qualifications: {
        level: qualLevel,
        summary: {
          en: qualSummaryEn || "Degree or equivalent qualification recognized by UGC.",
          si: qualSummaryEn || "විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව විසින් පිළිගත් උපාධියක්.",
          ta: qualSummaryEn || "அங்கீகரிக்கப்பட்ட பல்கலைக்கழகப் பட்டம்.",
        },
        requirements: {
          en: [qualSummaryEn || 'Recognized qualification requirement'],
          si: [qualSummaryEn || 'පිළිගත් සුදුසුකම'],
          ta: [qualSummaryEn || 'அங்கீகரிக்கப்பட்ட தகைமை'],
        },
      },
      ageLimit: {
        min: 21,
        max: 35,
        description: {
          en: 'Between 21 and 35 years as of closing date.',
          si: 'වයස අවුරුදු 21 ත් 35 ත් අතර.',
          ta: '21 முதல் 35 வயதுக்குள்.',
        },
      },
      location,
      field,
      organizationType: 'Department',
      jobType,
      methodOfRecruitment: {
        en: 'Written competitive examination and structured interview.',
        si: 'ලිඛිත තරඟ විභාගය සහ ව්‍යුහගත සම්මුඛ පරීක්ෂණය.',
        ta: 'எழுத்துப் பரீட்சை மற்றும் நேர்முகப் பரීක්ෂை.',
      },
      howToApply: {
        steps: {
          en: [
            'Prepare application according to Gazette specimen format.',
            'Send by registered post before closing date.'
          ],
          si: [
            'ගැසට් ආකෘතියට අනුව අයදුම්පත සකස් කරන්න.',
            'අවසන් දිනට පෙර ලියාපදිංචි තැපෑලෙන් එවන්න.'
          ],
          ta: [
            'மாதிரிப் படிவத்திற்கு அமைய விண்ணப்பத்தைத் தயாரிக்கவும்.',
            'பதிவுத் தபாலில் அனுப்பவும்.'
          ],
        },
        postalAddress: {
          en: postalAddressEn,
          si: postalAddressEn,
          ta: postalAddressEn,
        },
      },
      gazetteTextSnippet: {
        titleHeading: titleEn.toUpperCase(),
        preamble: 'APPLICATIONS are invited from citizens of Sri Lanka for recruitment.',
        bodyParagraphs: [
          `Notice No: ${noticeNumber}. Vacancies: ${vacanciesCount}. Closing Date: ${closingDate}.`
        ],
      },
      verifiedStatus: isVerifiedCheck ? 'verified' : 'pending_verification',
    };

    if (editingVacancy) {
      onUpdateVacancy(vacancyData);
    } else {
      onAddVacancy(vacancyData);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const safeVacancies = Array.isArray(vacancies) ? vacancies : [];
  const verifiedCount = safeVacancies.filter((v) => v.verifiedStatus === 'verified').length;
  const pendingCount = safeVacancies.filter((v) => v.verifiedStatus === 'pending_verification').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Official Gazette Editorial Desk</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t.adminTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-ui">
            {t.adminSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createNewVacancy}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5 font-display">
            Total Gazette Notices
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono-code">{safeVacancies.length}</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5 font-display">
            {t.publishedLive}
          </span>
          <span className="text-2xl font-bold text-emerald-600 font-mono-code">{verifiedCount}</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5 font-display">
            {t.pendingVerification}
          </span>
          <span className="text-2xl font-bold text-amber-600 font-mono-code">{pendingCount}</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5 font-display">
            Current Gazette Issue
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono-code">No. 2,403</span>
        </div>
      </div>

      {/* Editorial Notice Verification Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold text-slate-900">
            Published & Incoming Vacancy Notices
          </h3>
          <span className="text-xs text-slate-500 font-ui">
            Rule: Unverified notices do not publish without editorial confirmation
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {safeVacancies.map((vac) => {
            const isVerified = vac.verifiedStatus === 'verified';
            return (
              <div
                key={vac.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-mono-code bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-medium">
                      Notice {vac.noticeNumber}
                    </span>
                    <span className="text-slate-500 font-ui">Gazette {vac.gazetteNumber}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-medium font-ui">{vac.field}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-rose-700 font-mono-code">Closing {vac.closingDate}</span>
                  </div>

                  <h4 className="font-display text-base font-bold text-slate-900">
                    {vac.title.en}
                  </h4>
                  <p className="text-xs text-slate-500 font-ui">{vac.institution.en}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Verified Badge / Toggle */}
                  <button
                    type="button"
                    onClick={() => onTogglePublishStatus(vac.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition-all ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    }`}
                    title="Click to toggle publish status"
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{isVerified ? t.publishedLive : t.verifyPublish}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(vac)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Edit vacancy notice"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteVacancy(vac.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Vacancy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-rose-500" />
                <h3 className="font-display text-base font-bold">
                  {editingVacancy ? 'Edit Gazette Vacancy Notice' : 'Add New Gazette Vacancy Notice'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700 max-h-[80vh] overflow-y-auto custom-scrollbar font-ui">
              {/* Title Fields */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-display">
                  Vacancy Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Sri Lanka Customs Inspector — Grade II"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-600 focus:ring-1 focus:ring-rose-600/30 transition-all"
                />

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 font-display">Sinhala Title</label>
                    <input
                      type="text"
                      value={titleSi}
                      onChange={(e) => setTitleSi(e.target.value)}
                      placeholder="ශ්‍රී ලංකා රේගු පරීක්ෂක..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sinhala focus:outline-hidden focus:border-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 font-display">Tamil Title</label>
                    <input
                      type="text"
                      value={titleTa}
                      onChange={(e) => setTitleTa(e.target.value)}
                      placeholder="இலங்கை சுங்கப் பரிசோதகர்..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-tamil focus:outline-hidden focus:border-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Institution & Ministry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Institution / Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionEn}
                    onChange={(e) => setInstitutionEn(e.target.value)}
                    placeholder="e.g. Sri Lanka Customs"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Line Ministry
                  </label>
                  <input
                    type="text"
                    value={ministryEn}
                    onChange={(e) => setMinistryEn(e.target.value)}
                    placeholder="e.g. Ministry of Finance"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Gazette reference & Closing date */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Gazette Issue No.
                  </label>
                  <input
                    type="text"
                    value={gazetteNumber}
                    onChange={(e) => setGazetteNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono-code focus:outline-hidden focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Notice Reference No.
                  </label>
                  <input
                    type="text"
                    value={noticeNumber}
                    onChange={(e) => setNoticeNumber(e.target.value)}
                    placeholder="09-415/2"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono-code focus:outline-hidden focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono-code focus:outline-hidden focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Category, Qualification, Job Type */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Field / Service
                  </label>
                  <select
                    value={field}
                    onChange={(e) => setField(e.target.value as FieldCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-600"
                  >
                    <option value="ICT">ICT</option>
                    <option value="Administration">Administration</option>
                    <option value="Management">Management</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Law">Law</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Min Qualification
                  </label>
                  <select
                    value={qualLevel}
                    onChange={(e) => setQualLevel(e.target.value as QualificationLevel)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-600"
                  >
                    <option value="OL">G.C.E. O/L</option>
                    <option value="AL">G.C.E. A/L</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Higher Diploma">Higher Diploma</option>
                    <option value="Bachelors">Bachelor's Degree</option>
                    <option value="Masters">Master's Degree</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Employment Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as JobType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-600"
                  >
                    <option value="Open Competitive Exam">Open Competitive Exam</option>
                    <option value="Limited Exam">Limited Exam</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              {/* Salary & Vacancies */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Salary Min (Rs.)
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono-code focus:outline-hidden focus:border-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Salary Max (Rs.)
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono-code focus:outline-hidden focus:border-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                    Vacancies Count
                  </label>
                  <input
                    type="number"
                    value={vacanciesCount}
                    onChange={(e) => setVacanciesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono-code focus:outline-hidden focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Qualification Summary */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-display">
                  Qualification Summary Statement
                </label>
                <textarea
                  rows={2}
                  value={qualSummaryEn}
                  onChange={(e) => setQualSummaryEn(e.target.value)}
                  placeholder="Bachelor's degree in relevant discipline recognized by UGC..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-600"
                />
              </div>

              {/* Verification confirmation checkbox */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={isVerifiedCheck}
                  onChange={(e) => setIsVerifiedCheck(e.target.checked)}
                  className="mt-1 accent-rose-700 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="verifiedCheck" className="text-xs text-slate-700 cursor-pointer">
                  <strong className="font-display text-slate-900">Verification Audit:</strong> I confirm that I have verified the qualifications, salary scale, and closing date directly against the official Government Gazette document.
                </label>
              </div>

              {/* Modal footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {editingVacancy ? 'Update Notice' : 'Publish Notice to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
