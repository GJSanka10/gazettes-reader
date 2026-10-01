"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

const KEY = "tlg:back:v1";

interface Back {
  href: string;
  label: string;
}

/**
 * Records the list page the person is on (with its search and filters), so a
 * job page's back link returns there instead of to an unfiltered list. Session
 * storage only: it's navigation help, nothing more.
 */
export function RememberListPage({ label, filteredLabel }: { label: string; filteredLabel?: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const qs = params.toString();

  useEffect(() => {
    try {
      const back: Back = { href: qs ? `${pathname}?${qs}` : pathname, label: qs && filteredLabel ? filteredLabel : label };
      window.sessionStorage.setItem(KEY, JSON.stringify(back));
    } catch {
      // Storage unavailable: back links fall back to the plain list.
    }
  }, [pathname, qs, label, filteredLabel]);

  return null;
}

/** A single step back: to the list you came from if we know it, otherwise to
 *  the default list for this kind of job. */
export function BackLink({ href, label }: { href: string; label: string }) {
  const [back, setBack] = useState<Back>({ href, label });

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      const stored = raw ? (JSON.parse(raw) as Back) : null;
      // Only trust our own relative paths.
      if (stored?.href?.startsWith("/") && !stored.href.startsWith("//") && stored.label) {
        // Read after hydration so the server render and first client render match.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBack(stored);
      }
    } catch {
      // Keep the default.
    }
  }, []);

  return (
    <Link
      href={back.href}
      className="-ml-2 inline-flex h-10 items-center gap-1 rounded-md pl-1.5 pr-3 text-[15px] font-semibold text-ink-2 hover:bg-sunk hover:text-ink"
    >
      <Icon name="arrow_back" className="text-[20px]" />
      {back.label}
    </Link>
  );
}
