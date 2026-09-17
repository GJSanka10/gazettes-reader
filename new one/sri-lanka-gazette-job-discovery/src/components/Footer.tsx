import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, ExternalLink, BookOpen, Building, Mail, FileText } from 'lucide-react';

interface FooterProps {
  language: Language;
  onOpenArchive: () => void;
  onOpenReader: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onOpenArchive,
  onOpenReader,
  onOpenAdmin,
}) => {
  const t = translations[language];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs pt-12 pb-10 px-4 sm:px-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Editorial Masthead Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-700 to-rose-900 flex items-center justify-center text-white font-black text-sm shadow-md border border-rose-500/30">
                SL
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-tight block text-white leading-tight">
                  {t.appTitle}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono-code">
                  Democratic Socialist Republic of Sri Lanka
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-md text-xs font-ui">
              A curated, trilingual editorial interface for discovering, verifying, and indexing job vacancies published through the official Gazette of the Democratic Socialist Republic of Sri Lanka.
            </p>

            <div className="text-[11px] text-slate-400 bg-slate-900/80 border-l-2 border-rose-600 pl-3 py-2 rounded-r-lg">
              <span className="font-semibold text-slate-300 block mb-0.5">Official Publication Authority</span>
              Department of Government Printing, No. 118, Dr. Danister De Silva Mawatha, Colombo 08.
            </div>
          </div>

          {/* Column 2: Direct Document Discovery */}
          <div className="space-y-3">
            <h4 className="font-display font-bold uppercase tracking-wider text-white text-[11px]">
              Gazette Registry
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenReader}
                  className="hover:text-rose-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                  <span>Latest Issue Document Reader (No. 2,403)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenArchive}
                  className="hover:text-rose-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Browse Gazette Archives (2024–2026)</span>
                </button>
              </li>
              <li className="pt-1">
                <span className="text-slate-400 block text-[11px]">
                  Part I: Section (IIA) — Posts Vacant
                </span>
              </li>
              <li>
                <span className="text-slate-400 block text-[11px]">
                  Part I: Section (IIB) — Examinations
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Official Verification & Admin */}
          <div className="space-y-3">
            <h4 className="font-display font-bold uppercase tracking-wider text-white text-[11px]">
              Transparency & Verification
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="http://documents.gov.lk/en/gazette.php"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>documents.gov.lk (Official)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.psc.gov.lk"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Public Service Commission (PSC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 transition-all cursor-pointer font-semibold text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>Editorial Verification Desk</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-ui">
            Independent editorial discovery tool. All applicants must consult the official printed Gazette or documents.gov.lk before submitting applications.
          </p>
          <div className="font-mono-code text-[10px] text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Weekly Publication Cycle: Every Friday
          </div>
        </div>
      </div>
    </footer>
  );
};
