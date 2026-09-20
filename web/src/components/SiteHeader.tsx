"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/government-jobs", label: "Government Jobs" },
  { href: "/private-jobs", label: "Private Jobs" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Spec §55: the active item must not be identified by colour alone.
  const linkClass = (href: string) => {
    const active = pathname.startsWith(href);
    return [
      "inline-flex min-h-[44px] items-center px-1 text-[15px]",
      active
        ? "border-b-2 border-ink font-bold text-ink"
        : "border-b-2 border-transparent text-ink-soft hover:text-ink",
    ].join(" ");
  };

  return (
    <header className="border-b border-rule-strong bg-surface-raised">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-3 md:px-8">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          The Living Gazette
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
          <span aria-hidden="true" className="text-lg">
            {open ? "×" : "☰"}
          </span>
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
