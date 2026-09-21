"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";

export interface FacetOption {
  value: string;
  /** Real count within the current unfiltered set — never invented. */
  count: number;
}

export interface FacetConfig {
  /** query-param key */
  key: string;
  label: string;
  options: FacetOption[];
  /** True OR-filtering across a comma-joined URL value, rendered as real
   *  checkboxes — only meaningful for small option sets (see PILL_THRESHOLD).
   *  A facet above the threshold always renders as a single-select <select>
   *  regardless of this flag: a native multi-select control isn't worth the
   *  UX cost for something like "Institution". */
  multi?: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}

/** Facets with few options render as a ledger of checkboxes/pills with real
 *  counts; facets with many render as a bordered <select> instead — the same
 *  split the reference design uses between its checklists and its "Ministry"
 *  dropdown. */
const PILL_THRESHOLD = 6;

function usePush() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const push = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );
  return { params, pathname, router, push };
}

interface FilterBarProps {
  placeholder: string;
  facets: FacetConfig[];
}

export function FilterBar({ placeholder, facets }: FilterBarProps) {
  const { params, push, router, pathname } = usePush();

  const [draft, setDraft] = useState(params.get("search") ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    setDraft(params.get("search") ?? "");
  }, [params]);

  // Spec §32: debounce rather than firing per keystroke.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const current = params.get("search") ?? "";
    if (draft === current) return;

    const t = setTimeout(() => {
      push((next) => {
        if (draft.trim()) next.set("search", draft.trim());
        else next.delete("search");
      });
    }, 350);
    return () => clearTimeout(t);
  }, [draft, params, push]);

  const activeCount = useMemo(() => {
    let n = 0;
    for (const facet of facets) if (params.get(facet.key)) n++;
    if (params.get("search")) n++;
    return n;
  }, [facets, params]);

  const setFacet = (key: string, value: string) =>
    push((next) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

  const toggleMultiFacet = (key: string, value: string) =>
    push((next) => {
      const current = (next.get(key) ?? "").split(",").filter(Boolean);
      const isActive = current.includes(value);
      const nextValues = isActive ? current.filter((v) => v !== value) : [...current, value];
      if (nextValues.length) next.set(key, nextValues.join(","));
      else next.delete(key);
    });

  const clearAll = () => router.push(pathname, { scroll: false });

  const searchField = (idPrefix: string) => (
    <div>
      <label htmlFor={`${idPrefix}-job-search`} className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink">
        Search register
      </label>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-ink-faint"
        />
        <input
          id={`${idPrefix}-job-search`}
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-h-[44px] w-full border border-ink bg-surface pl-9 pr-9 text-[14px] text-ink placeholder:text-ink-faint focus:border-2"
        />
        {draft && (
          <button
            type="button"
            onClick={() => setDraft("")}
            aria-label="Clear search"
            className="absolute right-0 top-0 flex h-[44px] w-9 cursor-pointer items-center justify-center text-ink-soft hover:text-ink"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        )}
      </div>
    </div>
  );

  const facetField = (facet: FacetConfig) => {
    if (facet.options.length === 0) return null;

    if (facet.options.length <= PILL_THRESHOLD && facet.multi) {
      const selected = (params.get(facet.key) ?? "").split(",").filter(Boolean);
      return (
        <div key={facet.key} className="border-t border-rule pt-2.5">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink">
            {facet.label}
          </span>
          <div className="flex flex-col gap-1">
            {facet.options.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex min-h-[36px] cursor-pointer items-center gap-2 px-1 text-[13px] text-ink hover:bg-surface-sunken"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMultiFacet(facet.key, opt.value)}
                    className="h-4 w-4 shrink-0 accent-ink"
                  />
                  <span className="min-w-0 flex-1 truncate">{opt.value}</span>
                  <span className="font-mono text-[11px] text-ink-faint">{opt.count}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (facet.options.length <= PILL_THRESHOLD) {
      const current = params.get(facet.key) ?? "";
      return (
        <div key={facet.key} className="border-t border-rule pt-2.5">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink">
            {facet.label}
          </span>
          <div className="flex flex-col gap-1">
            {facet.options.map((opt) => {
              const active = current === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFacet(facet.key, active ? "" : opt.value)}
                  className={`flex min-h-[36px] cursor-pointer items-center justify-between gap-2 border px-2 text-left text-[13px] transition-colors ${
                    active
                      ? "border-ink bg-ink text-surface-raised"
                      : "border-transparent text-ink hover:border-rule-strong"
                  }`}
                >
                  <span className="truncate">{opt.value}</span>
                  <span className={`font-mono text-[11px] ${active ? "text-surface-raised/80" : "text-ink-faint"}`}>
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const current = params.get(facet.key) ?? "";
    return (
      <label key={facet.key} className="block border-t border-rule pt-2.5">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink">
          {facet.label}
        </span>
        <select
          className="min-h-[44px] w-full cursor-pointer border border-ink bg-surface px-2.5 text-[13px] text-ink focus:border-2"
          value={current}
          onChange={(e) => setFacet(facet.key, e.target.value)}
        >
          <option value="">All ({facet.options.reduce((n, o) => n + o.count, 0)})</option>
          {facet.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value} ({opt.count})
            </option>
          ))}
        </select>
      </label>
    );
  };

  const panelBody = (idPrefix: string) => (
    <div className="space-y-3">
      {searchField(idPrefix)}
      {facets.map(facetField)}
    </div>
  );

  return (
    <>
      {/* Mobile: a compact trigger bar above the results, not a sidebar. */}
      <div className="font-ui col-span-12 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 border border-ink px-3 text-[13px] font-bold uppercase tracking-wide text-ink"
        >
          <Icon name="tune" className="text-[18px]" />
          Filter register{activeCount ? ` (${activeCount})` : ""}
        </button>
      </div>

      {/* Desktop sidebar ledger. */}
      <aside className="font-ui col-span-12 hidden lg:col-span-4 lg:block xl:col-span-3">
        <div className="border border-rule-strong bg-surface-raised lg:sticky lg:top-20">
          <div className="flex items-center justify-between border-b-2 border-ink bg-surface-sunken px-3 py-2">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-ink">
              <Icon name="tune" className="text-[16px] text-ink-faint" />
              Filter register
            </span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer text-[11px] font-bold uppercase tracking-wide text-accent hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="p-3">{panelBody("desktop")}</div>
        </div>
      </aside>

      {/* Mobile drawer (spec §36, §54) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="font-ui absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto border-t-2 border-ink bg-surface-raised p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-bold uppercase tracking-wide text-ink">Filter register</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="flex h-11 w-11 cursor-pointer items-center justify-center border border-ink text-ink"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            {panelBody("mobile")}
            <div className="mt-6 flex gap-3 border-t border-rule pt-4">
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setDrawerOpen(false);
                }}
                className="min-h-[44px] flex-1 cursor-pointer border border-ink text-[13px] font-semibold uppercase tracking-wide text-ink hover:bg-surface-sunken"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] flex-1 cursor-pointer bg-ink text-[13px] font-semibold uppercase tracking-wide text-surface-raised hover:bg-[#163a5f]"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** The "Feed Controls & Active Meta Ribbon" bar: active-filter chips, a live
 *  result count, and sort — sitting above the card list rather than buried
 *  in the sidebar, matching the reference layout. */
export function FeedControls({
  facets,
  sorts,
  resultCount,
}: {
  facets: FacetConfig[];
  sorts: SortOption[];
  resultCount: number;
}) {
  const { params, push } = usePush();

  const chips = useMemo(() => {
    const list: { key: string; label: string; value: string; remove: () => void }[] = [];
    for (const facet of facets) {
      const raw = params.get(facet.key);
      if (!raw) continue;
      if (facet.multi) {
        for (const value of raw.split(",").filter(Boolean)) {
          list.push({
            key: `${facet.key}:${value}`,
            label: facet.label,
            value,
            remove: () =>
              push((next) => {
                const remaining = raw.split(",").filter((v) => v && v !== value);
                if (remaining.length) next.set(facet.key, remaining.join(","));
                else next.delete(facet.key);
              }),
          });
        }
      } else {
        list.push({
          key: facet.key,
          label: facet.label,
          value: raw,
          remove: () => push((next) => next.delete(facet.key)),
        });
      }
    }
    const search = params.get("search");
    if (search) {
      list.push({ key: "search", label: "Search", value: search, remove: () => push((next) => next.delete("search")) });
    }
    return list;
  }, [facets, params, push]);

  const setSort = (value: string) =>
    push((next) => {
      if (value) next.set("sort", value);
      else next.delete("sort");
    });

  return (
    <div className="font-ui flex flex-wrap items-center gap-3 border border-rule-strong bg-surface-raised px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {chips.length > 0 && (
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Active:</span>
        )}
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.remove}
            className="inline-flex min-h-[28px] cursor-pointer items-center gap-1.5 border border-rule-strong bg-surface px-2 text-[12px] text-ink hover:border-ink"
            aria-label={`Remove filter ${chip.label}: ${chip.value}`}
          >
            {chip.value}
            <Icon name="close" className="text-[13px] text-ink-soft" />
          </button>
        ))}
        <p aria-live="polite" className="text-[13px] text-ink-soft">
          <strong className="font-mono text-ink">{resultCount}</strong> {resultCount === 1 ? "result" : "results"}
        </p>
      </div>

      <label className="flex shrink-0 items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Sort</span>
        <select
          className="min-h-[36px] cursor-pointer border border-ink bg-surface px-2 text-[13px] text-ink"
          value={params.get("sort") ?? sorts[0]?.value ?? ""}
          onChange={(e) => setSort(e.target.value)}
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
