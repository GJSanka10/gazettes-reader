import type { Metadata } from "next";
import { Archivo, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { BottomNav, SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "@/components/Toaster";
import { MotionProvider } from "@/components/MotionProvider";

// One family across its width axis: condensed for countdowns, wide for
// headlines, normal for reading.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Sinhala and Tamil in the matching Noto sans cuts.
const sinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "600", "700"],
  variable: "--font-si",
  display: "swap",
});

const tamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "600", "700"],
  variable: "--font-ta",
  display: "swap",
});

const DESCRIPTION =
  "Sri Lankan Government Gazette vacancies and private-sector openings, summarised, sorted by closing date, and linked to the official source.";

export const metadata: Metadata = {
  // Absolute base for canonical and Open Graph URLs (see lib/site.ts).
  metadataBase: new URL(SITE_URL),
  title: "The Living Gazette — Government and private-sector jobs in Sri Lanka",
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  // No canonical or Open Graph title here: these are inherited by every page
  // that doesn't set its own, so a layout-level canonical of "/" would mark
  // every page a copy of the homepage. Each page sets them via pageMeta().
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_LK" },
  // Large image cards when links are shared (WhatsApp, Facebook and X all read these).
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Font variables go on <html>, not <body>: the theme's --font-sans alias is
    // declared on :root and resolves its var() references there.
    <html lang="en" className={`${archivo.variable} ${sinhala.variable} ${tamil.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-mark focus:px-4 focus:py-2 focus:font-semibold focus:text-on-mark"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <BottomNav />
          <Toaster />
        </MotionProvider>
      </body>
    </html>
  );
}
