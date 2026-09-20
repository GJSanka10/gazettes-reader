"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";

const NAV = [
  { href: "/government-jobs", label: "Government Jobs" },
  { href: "/private-jobs", label: "Private Jobs" },
  { href: "/about", label: "About" },
];

export interface UrgentNotice {
  slug: string;
  titleEn: string;
  days: number;
}

export function SiteHeader({
  updatedLabel,
  urgentVacancy,
}: {
  updatedLabel: string | null;
  urgentVacancy: UrgentNotice | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Spec §55: the active item must not be identified by colour alone.
  const linkClass = (href: string) => {
    const active = pathname.startsWith(href);
    return [
      "inline-flex min-h-[44px] items-center px-1 text-[14px] font-semibold uppercase tracking-wide",
      active
        ? "border-b-2 border-ink text-ink"
        : "border-b-2 border-transparent text-ink-soft hover:text-ink",
    ].join(" ");
  };

  const days = urgentVacancy?.days ?? null;

  return (
    <header className="sticky top-0 z-40 bg-surface-raised">
      {/* State ribbon: static trilingual identification, not a language switcher —
          i18n routing isn't wired yet, so no control here should imply it is. */}
      <div className="bg-ink px-4 py-1.5 text-surface-raised md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold">Democratic Socialist Republic of Sri Lanka</span>
            <span className="hidden text-white/30 sm:inline">|</span>
            <span
              lang="si"
              className="hidden font-[family-name:var(--font-siserif)] text-[12px] normal-case text-white/75 sm:inline"
            >
              ශ්‍රී ලංකා ගැසට් පත්‍රය
            </span>
            <span className="hidden text-white/30 sm:inline">•</span>
            <span
              lang="ta"
              className="hidden text-[12px] normal-case text-white/75 sm:inline"
            >
              இலங்கை வர்த்தமானி
            </span>
          </div>
          {updatedLabel && <span className="text-white/70">Vacancy data updated {updatedLabel}</span>}
        </div>
      </div>

      <div className="border-b border-rule-strong">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-3 md:px-8">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-[20px] font-semibold tracking-tight text-ink">
              The Living Gazette
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint">
              Government &amp; Private Vacancy Register
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                className={linkClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Menu"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-rule text-ink md:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Main" className="border-t border-rule md:hidden">
            <ul className="mx-auto max-w-[1200px] px-4 py-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    className="flex min-h-[44px] items-center border-b border-rule text-[15px] text-ink last:border-0"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Real urgency ticker: only rendered when a real vacancy is genuinely
          closing within 7 days (see getMostUrgentGovVacancy). No invented copy. */}
      {urgentVacancy && days !== null && (
        <div className="border-b border-rule bg-accent-wash px-4 py-2 md:px-8">
          <div className="mx-auto flex max-w-[1200px] items-center gap-2 text-[13px]">
            <span className="inline-flex shrink-0 items-center gap-1 border border-accent px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-accent">
              {days <= 1 ? "Closing today" : `Closes in ${days}d`}
            </span>
            <p className="min-w-0 flex-1 truncate text-ink">{urgentVacancy.titleEn}</p>
            <Link
              href={`/government-jobs/${urgentVacancy.slug}`}
              className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 text-[13px] font-bold text-ink underline underline-offset-2"
            >
              View <Icon name="arrow_forward" className="text-[15px]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule-strong bg-surface-raised">
      <div className="mx-auto max-w-[1200px] px-4 py-8 text-[13px] leading-relaxed text-ink-soft md:px-8">
        <p className="max-w-[70ch]">
          The Living Gazette is an independent digest. Government vacancies are summarised from
          notices published by the Department of Government Printing; private-sector listings are
          collected from employers&rsquo; own career sites. This is not an official government
          website — always check the original source before applying.
        </p>
        <p className="mt-3 font-mono text-[11px]">© 2026 The Living Gazette</p>
      </div>
    </footer>
  );
}
