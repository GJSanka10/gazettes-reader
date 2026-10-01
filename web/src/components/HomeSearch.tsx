import Link from "next/link";
import { Icon } from "./Icon";

/**
 * The homepage's way in: a plain GET form to the government list, so it works
 * before any script loads, plus shortcuts to the fields that actually have
 * open posts right now.
 */
export function HomeSearch({ fields }: { fields: { value: string; count: number }[] }) {
  return (
    <div className="mt-7 max-w-[640px]">
      <form action="/government-jobs" role="search" className="flex gap-2">
        <label htmlFor="home-search" className="sr-only">
          Search government jobs
        </label>
        <div className="relative min-w-0 flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-ink-2"
          />
          <input
            id="home-search"
            name="search"
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Job, institution or degree"
            className="h-14 w-full rounded-lg border-2 border-ink bg-surface pl-12 pr-3 text-[16px] font-medium text-ink placeholder:font-normal placeholder:text-ink-3 focus:shadow-[0_0_0_4px_var(--mark)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        <button
          type="submit"
          className="h-14 shrink-0 cursor-pointer rounded-lg bg-ink px-5 text-[16px] font-bold text-paper hover:opacity-90 sm:px-7"
        >
          Search
        </button>
      </form>

      {fields.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-ink-3">Browse by field</span>
          {fields.map((f) => (
            <Link
              key={f.value}
              href={`/government-jobs?category=${encodeURIComponent(f.value)}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rule-2 bg-surface px-3.5 text-[14px] font-medium text-ink hover:border-ink"
            >
              {f.value}
              <span className="nums text-ink-3">{f.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
