"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface FacetConfig {
  /** query-param key */
  key: string;
  label: string;
  options: string[];
}

export interface SortOption {
  value: string;
  label: string;
  /** Shown but not selectable, with a reason. */
  disabledReason?: string;
}

interface Props {
  placeholder: string;
  facets: FacetConfig[];
  sorts: SortOption[];
  resultCount: number;
}

export function FilterBar({ placeholder, facets, sorts, resultCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [draft, setDraft] = useState(params.get("search") ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const firstRender = useRef(true);

  // Keep the box in sync when the URL changes from elsewhere (back button, chips).
  useEffect(() => {
    setDraft(params.get("search") ?? "");
  }, [params]);

  const push = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      // Any filter/search change invalidates the current page number.
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

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

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; value: string }[] = [];
    for (const facet of facets) {
      const value = params.get(facet.key);
      if (value) chips.push({ key: facet.key, label: facet.label, value });
    }
    const search = params.get("search");
    if (search) chips.push({ key: "search", label: "Search", value: search });
    return chips;
  }, [facets, params]);

  const setFacet = (key: string, value: string) =>
    push((next) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

  const clearAll = () =>
    router.push(pathname, { scroll: false });

  const selectClass =
    "min-h-[44px] w-full cursor-pointer border border-rule bg-surface-raised px-3 text-[14px] text-ink";

  const facetSelects = facets.map((facet) => (
    <label key={facet.key} className="block">
      <span className="mb-1 block text-[13px] font-bold text-ink-soft">{facet.label}</span>
      <select
        className={selectClass}
        value={params.get(facet.key) ?? ""}
        onChange={(e) => setFacet(facet.key, e.target.value)}
      >
        <option value="">All</option>
        {facet.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  ));

  return (
    <section aria-label="Search and filters" className="border border-rule bg-surface-raised p-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <label htmlFor="job-search" className="sr-only">
            {placeholder}
          </label>
          <input
            id="job-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="min-h-[44px] w-full border border-rule-strong bg-surface px-3 pr-10 text-[15px] text-ink placeholder:text-ink-faint"
          />
          {draft && (
            <button
              type="button"
              onClick={() => setDraft("")}
              aria-label="Clear search"
              className="absolute right-0 top-0 flex h-[44px] w-10 cursor-pointer items-center justify-center text-ink-soft hover:text-ink"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          className="min-h-[44px] cursor-pointer whitespace-nowrap border border-rule-strong px-4 text-[14px] font-bold text-ink md:hidden"
        >
          Filters{activeChips.length ? ` (${activeChips.length})` : ""}
        </button>
      </div>

      {/* Desktop facets */}
      <div className="mt-4 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
        {facetSelects}
        <label className="block">
          <span className="mb-1 block text-[13px] font-bold text-ink-soft">Sort by</span>
          <select
            className={selectClass}
            value={params.get("sort") ?? sorts[0]?.value ?? ""}
            onChange={(e) => setFacet("sort", e.target.value)}
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value} disabled={Boolean(s.disabledReason)}>
                {s.label}
                {s.disabledReason ? ` — ${s.disabledReason}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-rule pt-3">
          <span className="text-[13px] font-bold text-ink-soft">Active:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFacet(chip.key, "")}
              className="inline-flex min-h-[32px] cursor-pointer items-center gap-2 border border-rule-strong bg-surface px-2.5 text-[13px] text-ink hover:border-ink"
              aria-label={`Remove filter ${chip.label}: ${chip.value}`}
            >
              <span>
                {chip.label}: {chip.value}
              </span>
              <span aria-hidden="true" className="text-ink-soft">
                ×
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto min-h-[32px] cursor-pointer text-[13px] underline underline-offset-2 hover:text-ink"
          >
            Clear filters
          </button>
        </div>
      )}

      <p aria-live="polite" className="mt-4 text-[14px] text-ink-soft">
        <strong className="font-mono text-ink">{resultCount}</strong>{" "}
        {resultCount === 1 ? "job" : "jobs"} found
      </p>

      {/* Mobile drawer (spec §36, §54) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto border-t border-rule-strong bg-surface-raised p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="flex h-11 w-11 cursor-pointer items-center justify-center border border-rule text-ink"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="space-y-4">{facetSelects}</div>
            <div className="mt-6 flex gap-3 border-t border-rule pt-4">
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setDrawerOpen(false);
                }}
                className="min-h-[44px] flex-1 cursor-pointer border border-rule-strong text-[14px] text-ink"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] flex-1 cursor-pointer bg-ink text-[14px] font-bold text-surface-raised"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
