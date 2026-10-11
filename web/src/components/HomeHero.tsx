import Image from "next/image";
import Link from "next/link";
import heroPhoto from "@/assets/hero-job-seeker.jpg";
import { HomeSearch } from "./HomeSearch";
import { Icon } from "./Icon";

/*
 * Photo: "Smiling woman holds a booklet, looking at the camera" by @90ml_water
 * on Unsplash (unsplash.com/photos/1JKMMf_dOyA), Unsplash License: free for
 * commercial use, no attribution required. Cropped to 4:5.
 */

export interface HeroStats {
  total: number;
  newCount: number;
  closingThisWeek: number;
}

export interface HeroJob {
  slug: string;
  title: string;
  org: string;
  days: number | null;
}

/**
 * The homepage's first screen: what the site is and a search on the left; on
 * wide screens a job seeker in an arch frame on the right, with the real
 * counts and the newest real vacancy floating around her as cards. Every
 * number is live data. Phones get the counts as a compact row instead of the
 * photo, so the listings start sooner.
 */
export function HomeHero({
  updated,
  issueNumber,
  stats,
  latest,
  fields,
}: {
  /** "11 Oct": when the listings last changed, Sri Lanka time. */
  updated: string | null;
  issueNumber: string | null;
  stats: HeroStats;
  latest: HeroJob | null;
  fields: { value: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_470px] xl:gap-14">
      <div className="min-w-0">
        {updated && (
          <p className="inline-flex h-8 items-center gap-2 rounded-full bg-surface pl-2.5 pr-3.5 text-[13.5px] font-semibold text-ink-2 shadow-[0_1px_0_var(--rule),0_0_0_1px_var(--rule)]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-ok shadow-[0_0_0_3px_color-mix(in_srgb,var(--ok)_22%,transparent)]"
            />
            Updated {updated}
            {issueNumber && <span className="font-normal text-ink-3">· Gazette No. {issueNumber}</span>}
          </p>
        )}
        <h1 className="headline mt-5 max-w-[16ch] text-[36px] text-ink sm:text-[54px] xl:text-[64px]">
          Government jobs, without the <span className="hero-mark">Gazette hunting.</span>
        </h1>
        <p className="mt-4 max-w-[50ch] text-[16.5px] leading-relaxed text-ink-2 sm:mt-5 sm:text-[17.5px]">
          Every new Sri Lankan government vacancy, with the closing date, salary, age limit and qualifications up
          front.<span className="hidden sm:inline"> The original notice is always one click away.</span>
        </p>
        <HomeSearch fields={fields} />

        {/* Phones and tablets: the counts, where the photo would be. */}
        <ul className="mt-6 grid grid-cols-3 gap-2 lg:hidden">
          <StatTile n={stats.total} label="open now" href="/government-jobs" />
          <StatTile n={stats.newCount} label="new this week" href="/government-jobs?sort=newest" />
          <StatTile n={stats.closingThisWeek} label="close in 7 days" href="/government-jobs?closing=7" hot />
        </ul>
      </div>

      <HeroArt stats={stats} latest={latest} />
    </div>
  );
}

function StatTile({ n, label, href, hot = false }: { n: number; label: string; href: string; hot?: boolean }) {
  const isHot = hot && n > 0;
  return (
    <li>
      <Link
        href={href}
        className={`flex h-full flex-col rounded-xl border bg-surface px-3 pb-2.5 pt-3 transition-colors ${
          isHot ? "border-hot/30 hover:border-hot" : "border-rule hover:border-ink"
        }`}
      >
        <span className={`count text-[34px] ${isHot ? "text-hot" : "text-ink"}`}>{n}</span>
        <span className={`mt-1.5 text-[13px] font-semibold leading-tight ${isHot ? "text-hot" : "text-ink-2"}`}>
          {label}
        </span>
      </Link>
    </li>
  );
}

/** A four-point sparkle, the highlighter's doodle. */
function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M12 0c.9 6.4 5.1 10.9 12 12-6.9 1.1-11.1 5.6-12 12-.9-6.4-5.1-10.9-12-12C6.9 10.9 11.1 6.4 12 0Z" />
    </svg>
  );
}

function HeroArt({ stats, latest }: { stats: HeroStats; latest: HeroJob | null }) {
  const share = stats.total > 0 ? stats.closingThisWeek / stats.total : 0;
  const R = 22;
  const C = 2 * Math.PI * R;
  const hot = latest?.days !== null && latest?.days !== undefined && latest.days >= 0 && latest.days <= 7;

  return (
    <div className="relative hidden h-[540px] select-none lg:block">
      {/* Backdrop: the highlighter circle, a dashed orbit, doodles. */}
      <div aria-hidden="true" className="absolute right-[18px] top-[46px] h-[420px] w-[420px] rounded-full bg-mark" />
      <div
        aria-hidden="true"
        className="hero-orbit absolute right-[-12px] top-[16px] h-[480px] w-[480px] rounded-full border-2 border-dashed border-ink/15"
      />
      <Sparkle className="hero-pop absolute left-[18px] top-[10px] h-9 w-9 fill-mark stroke-ink stroke-[1.2]" />
      <Sparkle className="hero-pop absolute right-[2px] top-[150px] h-5 w-5 fill-ink [animation-delay:1.1s]" />
      <Sparkle className="hero-pop absolute bottom-[30px] right-[34px] h-7 w-7 fill-ink [animation-delay:1.3s]" />
      <span aria-hidden="true" className="absolute left-[78px] top-[120px] h-2.5 w-2.5 rounded-full bg-hot" />
      <span aria-hidden="true" className="absolute bottom-[150px] right-[6px] h-3 w-3 rounded-full border-2 border-ink" />

      {/* The person: an arch frame, like a doorway into a job. */}
      <div className="absolute bottom-0 right-[58px] h-[480px] w-[350px] overflow-hidden rounded-b-[28px] rounded-t-full border-[6px] border-surface bg-sunk shadow-lift">
        <Image
          src={heroPhoto}
          alt="A smiling young woman in a saree holding a booklet"
          fill
          sizes="350px"
          placeholder="blur"
          className="object-cover object-[50%_20%]"
        />
      </div>

      {/* Floating cards, all real data. */}
      <div className="hero-float absolute left-0 top-[86px] flex items-center gap-3 rounded-2xl bg-surface py-3 pl-3 pr-4 shadow-lift [animation-delay:.35s]">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-mark text-on-mark">
          <Icon name="work" filled className="text-[24px]" />
        </span>
        <span>
          <span className="count block text-[30px] text-ink">{stats.total}</span>
          <span className="block text-[13px] font-semibold leading-tight text-ink-2">open vacancies</span>
        </span>
        {stats.newCount > 0 && (
          <span className="ml-1 self-start rounded-full bg-mark-soft px-2 py-0.5 text-[12px] font-bold text-ink">
            +{stats.newCount} new
          </span>
        )}
      </div>

      <div className="hero-float absolute right-[-6px] top-[262px] flex items-center gap-3 rounded-2xl bg-surface py-3 pl-3 pr-4 shadow-lift [animation-delay:.55s]">
        <svg aria-hidden="true" viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
          <circle cx="28" cy="28" r={R} fill="none" strokeWidth="7" className="stroke-sunk" />
          <circle
            cx="28"
            cy="28"
            r={R}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(share * C, 0.01)} ${C}`}
            className="hero-ring stroke-hot"
            style={{ ["--ring" as string]: `${C}` }}
          />
        </svg>
        <span>
          <span className="count block text-[30px] text-hot">{stats.closingThisWeek}</span>
          <span className="block text-[13px] font-semibold leading-tight text-ink-2">
            closing within
            <br />7 days
          </span>
        </span>
      </div>

      {latest && (
        <Link
          href={`/government-jobs/${latest.slug}`}
          className="hero-float group absolute bottom-[44px] left-[-8px] grid w-[290px] grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl bg-surface p-4 shadow-lift transition-transform hover:-translate-y-0.5 [animation-delay:.75s]"
        >
          {latest.days !== null && latest.days >= 0 ? (
            <span className="flex flex-col">
              <span className={`count text-[38px] ${hot ? "text-hot" : "text-ink"}`}>{latest.days}</span>
              <span className={`mt-1 text-[11.5px] font-semibold leading-tight ${hot ? "text-hot" : "text-ink-2"}`}>
                {latest.days === 1 ? "day left" : "days left"}
              </span>
            </span>
          ) : (
            <Icon name="description" className="text-[30px] text-ink-2" />
          )}
          <span className="min-w-0">
            <span className="marked inline-flex h-[20px] items-center rounded-[4px] px-1.5 text-[11.5px] font-bold">
              Newest
            </span>
            <span className="mt-1 line-clamp-2 text-[14.5px] font-bold leading-snug text-ink group-hover:underline">
              {latest.title}
            </span>
            <span className="block truncate text-[12.5px] text-ink-3">{latest.org}</span>
          </span>
        </Link>
      )}
    </div>
  );
}

/**
 * The strip under the hero, where a landing page shows its client logos: the
 * institutions with the most open posts right now, each a link to its posts.
 * Plain names, never borrowed logos.
 */
export function HiringStrip({ items }: { items: { value: string; count: number }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-12 border-t border-ink/10 pt-5">
      <p className="text-[13.5px] font-semibold text-ink-3">Hiring now through the Gazette</p>
      <ul className="no-scrollbar -mx-4 mt-2 flex gap-x-2 overflow-x-auto px-4 lg:mx-0 lg:-ml-2 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:overflow-visible lg:px-0">
        {items.map((i) => (
          <li key={i.value} className="shrink-0 lg:min-w-0">
            <Link
              href={`/government-jobs?institution=${encodeURIComponent(i.value)}`}
              title={i.value}
              className="flex h-10 items-center gap-2 rounded-lg px-2 text-[15px] font-bold text-ink-2 transition-colors hover:bg-surface hover:text-ink"
            >
              <Icon name="account_balance" className="shrink-0 text-[20px] text-ink-3" />
              <span className="min-w-0 max-w-[300px] truncate lg:max-w-none">{shortInstitution(i.value)}</span>
              <span className="nums text-[13px] font-semibold text-ink-3">{i.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Ministry of Justice ..., Department of Prisons" -> "Department of Prisons",
 *  and "Eastern University, Sri Lanka" -> "Eastern University". Commas inside
 *  a ministry's own name ("Agriculture, Livestock, Land and Irrigation") stay. */
function shortInstitution(name: string) {
  const parts = name.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  if (/^(department|division|office|bureau|unit|branch|faculty|directorate)/i.test(last)) return last;
  if (/^sri lanka$/i.test(last)) return parts.slice(0, -1).join(", ");
  return name;
}
