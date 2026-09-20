import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { formatUpdatedAt, getGovUpdatedAt, getMostUrgentGovVacancy } from "@/lib/jobs";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display-loaded",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-loaded",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Living Gazette — Government and private-sector jobs in Sri Lanka",
  description:
    "Search current Sri Lankan Government Gazette vacancies and private-sector job openings, with closing dates and links to the official source.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Real data only in the masthead: the true "last updated" timestamp the
  // ingestion pipeline wrote, and the single most urgent open vacancy (or
  // nothing, if nothing is actually closing soon) — never an invented
  // gazette edition number or a fabricated ticker line.
  //
  // Only a plain, serializable summary crosses into the client SiteHeader —
  // never the vacancy object itself, and never anything imported from
  // lib/jobs.ts directly inside a "use client" file, which would drag the
  // fs-based module into the browser bundle (Turbopack refuses to build it).
  const updated = formatUpdatedAt(getGovUpdatedAt());
  const mostUrgent = getMostUrgentGovVacancy();
  const urgent = mostUrgent
    ? { slug: mostUrgent.vacancy.slug, titleEn: mostUrgent.vacancy.titleEn, days: mostUrgent.days }
    : null;

  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${newsreader.variable} ${plusJakarta.variable} ${plexMono.variable} flex min-h-screen flex-col`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-ink focus:bg-surface-raised focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader updatedLabel={updated} urgentVacancy={urgent} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
