export { BackLink } from "./BackLink";

/** Page opener for the collection pages, on the white band: a wide heavy title
 *  and a sentence or two. Counts belong in that sentence, not in big numbers. */
export function PageIntro({
  title,
  lede,
  flush = false,
}: {
  title: string;
  lede: React.ReactNode;
  /** A toolbar continues the band below, so leave off the bottom edge. */
  flush?: boolean;
}) {
  return (
    <div className={`bg-surface ${flush ? "" : "border-b border-rule"}`}>
      <header className={`mx-auto max-w-[1240px] px-4 pt-10 md:px-8 md:pt-14 ${flush ? "pb-4" : "pb-10"}`}>
        <h1 className="headline text-[38px] text-ink md:text-[56px]">{title}</h1>
        <div className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-ink-2">{lede}</div>
      </header>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-rule-2 px-6 py-12">
      <h2 className="title text-[22px] text-ink">{title}</h2>
      <p className="mt-1.5 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">{body}</p>
      {action ? <div className="mt-6 flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ what }: { what: string }) {
  return (
    <div role="alert" className="rounded-2xl bg-hot-soft px-6 py-12">
      <h2 className="title text-[22px] text-ink">The {what} list didn&rsquo;t load</h2>
      <p className="mt-1.5 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">
        The listings file couldn&rsquo;t be read. Reload the page. If it keeps happening, the data update may still
        be running.
      </p>
    </div>
  );
}

/** Loading placeholder shaped like the real rows (countdown, title,
 *  institution, facts), so the page doesn't jump when the data arrives. */
export function JobListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="divide-y divide-rule overflow-hidden rounded-2xl border border-rule bg-surface">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 px-4 py-5 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-x-6 sm:px-6">
          <div className="space-y-2">
            <div className="skeleton h-10 w-10 rounded" />
            <div className="skeleton h-3 w-12 rounded" />
          </div>
          <div className="space-y-2.5">
            <div className="skeleton h-5 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-3.5 w-5/6 rounded" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading vacancies</span>
    </div>
  );
}

export const buttonClass = {
  solid:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-5 text-[15px] font-semibold text-paper transition-opacity hover:opacity-90",
  mark: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-mark px-5 text-[15px] font-bold text-on-mark transition-[filter] hover:brightness-95",
  outline:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-rule-2 bg-surface px-5 text-[15px] font-semibold text-ink hover:border-ink",
};
