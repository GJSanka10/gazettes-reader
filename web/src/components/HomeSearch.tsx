import Link from "next/link";
import { Icon } from "./Icon";

/**
 * The homepage's way in: a plain GET form to the government list, so it works
 * before any script loads, plus shortcuts to the fields that actually have
 * open posts right now. On phones the fields are one row you swipe, so they
 * don't push the listings off the first screen.
 */
export function HomeSearch({ fields }: { fields: { value: string; count: number }[] }) {
  return (
    <div className="mt-7 max-w-[660px]">
      <form
        action="/government-jobs"
        role="search"
        className="flex items-center gap-1.5 rounded-xl border-2 border-ink bg-surface p-1.5 transition-shadow focus-within:shadow-[0_0_0_4px_var(--mark)]"
      >
        <label htmlFor="home-search" className="sr-only">
          Search government jobs
        </label>
        <Icon name="search" className="ml-2.5 shrink-0 text-[22px] text-ink-2" />
        <input
          id="home-search"
          name="search"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Job, institution or degree"
          className="h-12 min-w-0 flex-1 bg-transparent px-1.5 text-[16px] font-medium text-ink placeholder:font-normal placeholder:text-ink-3 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          className="h-12 shrink-0 cursor-pointer rounded-lg bg-ink px-5 text-[16px] font-bold text-paper hover:opacity-90 sm:px-7"
        >
          Search
        </button>
      </form>

      {fields.length > 0 && (
        <div className="mt-4">
          <p className="text-[13.5px] font-semibold text-ink-3">Popular fields right now</p>
          <ul className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {fields.map((f) => (
              <li key={f.value} className="shrink-0">
                <Link
                  href={`/government-jobs?category=${encodeURIComponent(f.value)}`}
                  className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-rule-2 bg-surface px-3.5 text-[14px] font-medium text-ink transition-colors hover:border-ink hover:bg-mark-soft"
                >
                  {f.value}
                  <span className="nums rounded-full bg-sunk px-1.5 text-[12.5px] font-semibold text-ink-2">{f.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
