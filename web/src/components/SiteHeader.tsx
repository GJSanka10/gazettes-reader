"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSavedJobs } from "@/lib/saved";
import { Icon } from "./Icon";

const NAV = [
  { href: "/", label: "Latest" },
  { href: "/government-jobs", label: "Government" },
  { href: "/private-jobs", label: "Private" },
  { href: "/saved", label: "Saved" },
  { href: "/about", label: "About" },
];

/** Mobile bottom bar: the four things people come back for. */
const BOTTOM = [
  { href: "/", label: "Latest", icon: "today" },
  { href: "/government-jobs", label: "Government", icon: "account_balance" },
  { href: "/private-jobs", label: "Private", icon: "work" },
  { href: "/saved", label: "Saved", icon: "bookmark" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function SavedCount({ className = "" }: { className?: string }) {
  const n = useSavedJobs().length;
  if (!n) return null;
  return (
    <span
      className={`nums inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-bold text-paper ${className}`}
    >
      {n}
      <span className="sr-only"> saved</span>
    </span>
  );
}

/** A page of text with one line highlighted: what the site does, in a glyph. */
export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect x="1" y="1" width="30" height="30" rx="7" className="fill-ink" />
      <rect x="7" y="8" width="18" height="2.5" rx="1.25" className="fill-paper" opacity="0.55" />
      <rect x="5" y="13.5" width="22" height="6" rx="1.5" className="fill-mark" />
      <rect x="7" y="22.5" width="12" height="2.5" rx="1.25" className="fill-paper" opacity="0.55" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-surface/95 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="The Living Gazette, home">
          <Mark />
          <span className="headline text-[19px] leading-none text-ink">The Living Gazette</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center rounded-md px-3.5 text-[15px] font-semibold transition-colors ${
                  active ? "bg-mark text-on-mark" : "text-ink-2 hover:bg-sunk hover:text-ink"
                }`}
              >
                {item.label}
                {item.href === "/saved" && <SavedCount className="ml-2" />}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/saved"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-sunk md:hidden"
          aria-label="Saved jobs"
        >
          <Icon name="bookmark" className="text-[24px]" />
          <SavedCount className="absolute -right-0.5 -top-0.5" />
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {BOTTOM.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold ${
                  active ? "text-ink" : "text-ink-3"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-mark text-on-mark" : ""
                  }`}
                >
                  <Icon name={item.icon} filled={active} className="text-[22px]" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const OFFICIAL = [
  { href: "https://documents.gov.lk/web/gazettes", label: "Gazette archive (Government Printing)" },
  { href: "https://www.psc.gov.lk", label: "Public Service Commission" },
  { href: "https://www.pubad.gov.lk", label: "Ministry of Public Administration" },
];

export function SiteFooter() {
  return (
    <footer className="mt-28 bg-ink pb-20 text-paper md:pb-0">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 text-[15px] leading-relaxed md:grid-cols-[1.5fr_1fr_1fr] md:px-8">
        <div>
          <p className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
              <rect x="1" y="1" width="30" height="30" rx="7" className="fill-paper" />
              <rect x="7" y="8" width="18" height="2.5" rx="1.25" className="fill-ink" opacity="0.5" />
              <rect x="5" y="13.5" width="22" height="6" rx="1.5" className="fill-mark" />
              <rect x="7" y="22.5" width="12" height="2.5" rx="1.25" className="fill-ink" opacity="0.5" />
            </svg>
            <span className="headline text-[19px] leading-none">The Living Gazette</span>
          </p>
          <p className="mt-4 max-w-[46ch] text-paper/75">
            An independent digest of Sri Lankan job notices, not a government website. Check the original
            notice or the employer&rsquo;s posting before you apply.
          </p>
          <p className="mt-5 flex flex-wrap gap-x-5 text-paper/60">
            <span lang="si">ජීවමාන ගැසට්</span>
            <span lang="ta">வாழும் வர்த்தமானி</span>
          </p>
        </div>
        <nav aria-label="Official sources">
          <p className="font-bold">Official sources</p>
          <ul className="mt-3 space-y-2">
            {OFFICIAL.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper/75 underline-offset-4 hover:text-paper hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="This site">
          <p className="font-bold">This site</p>
          <ul className="mt-3 space-y-2">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/75 underline-offset-4 hover:text-paper hover:underline">
                  {l.label === "Latest" ? "Latest vacancies" : l.label === "Saved" ? "Saved jobs" : l.label === "About" ? "About this site" : `${l.label} jobs`}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
