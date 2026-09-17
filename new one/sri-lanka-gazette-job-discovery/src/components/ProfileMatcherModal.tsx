import React, { useState } from 'react';
import { UserProfile, QualificationLevel, Language } from '../types';
import { translations } from '../data/translations';
import { X, CheckCircle2, SlidersHorizontal, AlertCircle, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';

interface ProfileMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onClearProfile: () => void;
  language: Language;
}

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle'
];

export const ProfileMatcherModal: React.FC<ProfileMatcherModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onClearProfile,
  language,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const [highestEducation, setHighestEducation] = useState<QualificationLevel | ''>(
    userProfile?.highestEducation || ''
  );
  const [degreeField, setDegreeField] = useState<string>(userProfile?.degreeField || '');
  const [age, setAge] = useState<number | ''>(userProfile?.age || '');
  const [preferredDistricts, setPreferredDistricts] = useState<string[]>(
    userProfile?.preferredDistricts || []
  );
  const [currentStatus, setCurrentStatus] = useState<'student' | 'graduate' | 'employed' | ''>(
    userProfile?.currentStatus || ''
  );

  const toggleDistrict = (district: string) => {
    setPreferredDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      highestEducation,
      degreeField,
      age: age ? Number(age) : '',
      preferredDistricts,
      currentStatus,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            </div>
            <h2 className="font-display text-base font-bold tracking-tight">
              {t.matchMe} — Candidate Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-slate-700">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-slate-600 leading-relaxed font-ui">
            <p>
              Set your qualifications to highlight matching vacancies in the latest Gazette.
            </p>
          </div>

          {/* Highest Qualification */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-display">
              Highest Educational / Professional Qualification
            </label>
            <select
              value={highestEducation}
              onChange={(e) => setHighestEducation(e.target.value as QualificationLevel | '')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-600 font-medium cursor-pointer shadow-2xs"
            >
              <option value="">Select Qualification Level</option>
              <option value="OL">G.C.E. Ordinary Level (O/L)</option>
              <option value="AL">G.C.E. Advanced Level (A/L)</option>
              <option value="Diploma">National Diploma / NVQ Level 5</option>
              <option value="Higher Diploma">Higher National Diploma (HND) / NVQ 6</option>
              <option value="Bachelors">Bachelor's Degree (General / Special)</option>
              <option value="Masters">Postgraduate / Master's Degree</option>
              <option value="Professional">Attorney-at-Law / Chartered Accountant / IESL</option>
            </select>
          </div>

          {/* Discipline / Degree Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-display">
              Degree Discipline / Field of Study (e.g. Computer Science, Law, Civil Eng)
            </label>
            <input
              type="text"
              value={degreeField}
              onChange={(e) => setDegreeField(e.target.value)}
              placeholder="e.g. Software Engineering, Management, Civil Engineering, Biology"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-rose-600 shadow-2xs"
            />
          </div>

          {/* Age & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-display">
                Current Age (Years)
              </label>
              <input
                type="number"
                min="18"
                max="65"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 24"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-display">
                Current Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) =>
                  setCurrentStatus(e.target.value as 'student' | 'graduate' | 'employed' | '')
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-600 font-medium cursor-pointer shadow-2xs"
              >
                <option value="">Select Status</option>
                <option value="student">Undergraduate / Student</option>
                <option value="graduate">Recent Graduate</option>
                <option value="employed">Currently Employed</option>
              </select>
            </div>
          </div>

          {/* Preferred Districts */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-display">
              Preferred Districts for Posting (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-xl custom-scrollbar">
              {DISTRICTS.map((d) => {
                const isSelected = preferredDistricts.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDistrict(d)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-700 text-white border-rose-700 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official Disclaimer */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Official Disclaimer:</strong> {t.disclaimerMatch}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {userProfile?.highestEducation || userProfile?.age ? (
              <button
                type="button"
                onClick={() => {
                  onClearProfile();
                  onClose();
                }}
                className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1.5 cursor-pointer py-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Profile</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer font-display"
              >
                Save & Apply Matcher
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
