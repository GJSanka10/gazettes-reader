"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { EASE_IN, EASE_OUT } from "./MotionProvider";

const noop = () => () => {};
/** True only on the client, after hydration: portals need `document`. */
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export interface FacetOption {
  value: string;
  /** Real count within the unfiltered set — never invented. */
  count: number;
  /** Display label when the URL value isn't human-readable (e.g. "7"). */
  label?: string;
}

export interface FacetConfig {
  /** query-param key */
  key: string;
  label: string;
  options: FacetOption[];
  /** OR-filtering across a comma-joined URL value. */
  multi?: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}

/** Above this many options a facet becomes a select instead of chips. */
const CHIP_LIMIT = 8;

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

export interface SearchSuggestion {
  label: string;
  /** What kind of thing it is: "Job title", "Institution", "Field", "Gazette". */
  kind: string;
}

const MAX_SUGGESTIONS = 6;

function labelFor(facet: FacetConfig, value: string) {
  return facet.options.find((o) => o.value === value)?.label ?? value;
}

export function ListToolbar({
  placeholder,
  facets,
  sorts,
  resultCount,
  quickKey,
  views,
  suggestions = [],
}: {
  placeholder: string;
  facets: FacetConfig[];
  sorts: SortOption[];
  resultCount: number;
  /** A single-select facet promoted to an inline segmented control. */
  quickKey?: string;
  /** Optional layout switch, stored in `?view=`. The first option is the default. */
  views?: { value: string; label: string; icon: string }[];
  /** Search suggestions built on the server from the listings themselves. */
  suggestions?: SearchSuggestion[];
}) {
  const { params, push, router, pathname } = usePush();
  const [draft, setDraft] = useState(params.get("search") ?? "");
  const [sheetOpen, setSheetOpen] = useState(false);
  const filtersButton = useRef<HTMLButtonElement>(null);
  const mounted = useMounted();
  const lastPushed = useRef(params.get("search") ?? "");

  // Debounced search: one navigation per pause, not per keystroke.
  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === lastPushed.current) return;
    const t = setTimeout(() => {
      lastPushed.current = trimmed;
      push((next) => {
        if (trimmed) next.set("search", trimmed);
        else next.delete("search");
      });
    }, 350);
    return () => clearTimeout(t);
  }, [draft, push]);

  const quick = facets.find((f) => f.key === quickKey);
  const sheetFacets = facets.filter((f) => f.key !== quickKey && f.options.length > 0);

  const setFacet = (key: string, value: string) =>
    push((next) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

  const toggleMulti = (key: string, value: string) =>
    push((next) => {
      const current = (next.get(key) ?? "").split(",").filter(Boolean);
      const nextValues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (nextValues.length) next.set(key, nextValues.join(","));
      else next.delete(key);
    });

  const chips = (() => {
    const list: { id: string; text: string; remove: () => void }[] = [];
    for (const facet of facets) {
      const raw = params.get(facet.key);
      if (!raw || facet.key === quickKey) continue;
      const values = facet.multi ? raw.split(",").filter(Boolean) : [raw];
      for (const value of values) {
        list.push({
          id: `${facet.key}:${value}`,
          text: labelFor(facet, value),
          remove: () =>
            facet.multi
              ? toggleMulti(facet.key, value)
              : push((next) => next.delete(facet.key)),
        });
      }
    }
    return list;
  })();

  const sheetActive = chips.length;
  const hasAny = sheetActive > 0 || Boolean(params.get("search")) || Boolean(quickKey && params.get(quickKey));

  return (
    <div className="z-30 border-b border-rule bg-surface md:sticky md:top-16">
      <div className="mx-auto max-w-[1240px] px-4 py-3 md:px-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchBox
            draft={draft}
            setDraft={setDraft}
            placeholder={placeholder}
            suggestions={suggestions}
            onPick={(label) => {
              setDraft(label);
              lastPushed.current = label;
              push((next) => next.set("search", label));
            }}
          />

          {quick && quick.options.length > 0 && (
            <div
              role="group"
              aria-label={quick.label}
              className="no-scrollbar order-last flex w-full overflow-x-auto rounded-lg bg-paper p-1 lg:order-none lg:w-auto"
            >
              {[{ value: "", label: "Any date", count: undefined as number | undefined }, ...quick.options].map((opt) => {
                const active = (params.get(quick.key) ?? "") === opt.value;
                return (
                  <button
                    key={opt.value || "any"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFacet(quick.key, opt.value)}
                    className={`h-10 shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3.5 text-[14px] font-semibold transition-colors ${
                      active ? "bg-mark text-on-mark" : "text-ink-2 hover:bg-sunk hover:text-ink"
                    }`}
                  >
                    {opt.label ?? opt.value}
                    {opt.count !== undefined && (
                      <span className={`nums ml-1.5 font-medium ${active ? "text-on-mark/75" : "text-ink-3"}`}>{opt.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {sheetFacets.length > 0 && (
            <button
              type="button"
              ref={filtersButton}
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg border border-rule-2 bg-surface px-5 text-[15px] font-semibold text-ink hover:border-ink"
            >
              <Icon name="tune" className="text-[20px]" />
              Filters
              {sheetActive > 0 && (
                <span className="nums inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-mark px-1.5 text-[12px] font-bold text-on-mark">
                  {sheetActive}
                </span>
              )}
            </button>
          )}

          <label className="relative inline-flex h-12 items-center">
            <span className="sr-only">Sort by</span>
            <Icon name="swap_vert" className="pointer-events-none absolute left-4 text-[20px] text-ink-3" />
            <select
              value={params.get("sort") ?? sorts[0]?.value ?? ""}
              onChange={(e) => setFacet("sort", e.target.value === sorts[0]?.value ? "" : e.target.value)}
              className="h-12 cursor-pointer appearance-none rounded-lg border border-rule-2 bg-surface pl-11 pr-10 text-[15px] font-semibold text-ink hover:border-ink"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <Icon name="expand_more" className="pointer-events-none absolute right-3.5 text-[20px] text-ink-3" />
          </label>
        </div>

        <div className="mt-3 flex min-h-8 flex-wrap items-center gap-2">
          <p aria-live="polite" className="text-[14px] text-ink-2">
            <strong className="nums font-semibold text-ink">{resultCount}</strong>{" "}
            {resultCount === 1 ? "listing" : "listings"}
          </p>
          {views && views.length > 1 && (
            <div role="group" aria-label="Layout" className="order-last ml-auto flex rounded-lg bg-paper p-0.5">
              {views.map((v, i) => {
                const current = params.get("view") ?? views[0].value;
                const active = current === v.value;
                return (
                  <button
                    key={v.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFacet("view", i === 0 ? "" : v.value)}
                    className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors ${
                      active ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    <Icon name={v.icon} className="text-[17px]" />
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.remove}
              aria-label={`Remove filter: ${chip.text}`}
              className="inline-flex h-8 max-w-[260px] cursor-pointer items-center gap-1 rounded-full bg-mark-soft pl-3 pr-1.5 text-[13.5px] font-medium text-ink hover:bg-mark hover:text-on-mark"
            >
              <span className="truncate">{chip.text}</span>
              <Icon name="close" className="text-[16px] text-ink-2" />
            </button>
          ))}
          {hasAny && (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                lastPushed.current = "";
                // Clearing filters shouldn't also throw away the chosen layout.
                const view = params.get("view");
                router.push(view ? `${pathname}?view=${view}` : pathname, { scroll: false });
              }}
              className="h-8 cursor-pointer rounded-md px-2 text-[13px] font-medium text-ink-2 underline underline-offset-4 hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Portalled to <body>: the sticky toolbar is its own stacking context,
          so a sheet rendered inside it would sit under the site header. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {sheetOpen && (
              <FilterSheet
                key="filters"
                facets={sheetFacets}
                params={params}
                resultCount={resultCount}
                onToggle={toggleMulti}
                onSet={setFacet}
                onClose={() => {
                  setSheetOpen(false);
                  // Back to where the person was, not the top of the page.
                  filtersButton.current?.focus();
                }}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

function FilterSheet({
  facets,
  params,
  resultCount,
  onToggle,
  onSet,
  onClose,
}: {
  facets: FacetConfig[];
  params: URLSearchParams;
  resultCount: number;
  onToggle: (key: string, value: string) => void;
  onSet: (key: string, value: string) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // Held in a ref so a parent re-render (every filter click navigates) doesn't
  // re-run the mount effect and yank focus back to the close button.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  // A side panel on wide screens, a bottom sheet on phones: it moves in
  // from the edge it's attached to, and leaves the same way, a bit faster.
  const [wide] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const offscreen = wide ? { x: 48, opacity: 0 } : { y: 64, opacity: 0 };

  return (
    <div className="fixed inset-0 z-50">
      <m.div
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_IN } }}
      />
      <m.div
        initial={offscreen}
        animate={{ x: 0, y: 0, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 38 } }}
        exit={{ ...offscreen, transition: { duration: 0.16, ease: EASE_IN } }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-surface shadow-lift md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[440px] md:rounded-2xl"
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 id="filter-title" className="headline text-[28px] text-ink">
            Filters
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-sunk"
          >
            <Icon name="close" className="text-[24px]" />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-4">
          {facets.map((facet) => {
            const selected = (params.get(facet.key) ?? "").split(",").filter(Boolean);

            if (facet.options.length > CHIP_LIMIT) {
              return (
                <label key={facet.key} className="block">
                  <span className="mb-2.5 block text-[15px] font-bold text-ink">{facet.label}</span>
                  <select
                    value={facet.multi ? "" : selected[0] ?? ""}
                    onChange={(e) =>
                      facet.multi ? e.target.value && onToggle(facet.key, e.target.value) : onSet(facet.key, e.target.value)
                    }
                    className="h-11 w-full cursor-pointer rounded-lg border border-rule-2 bg-surface px-4 text-[15px] text-ink hover:border-ink"
                  >
                    <option value="">{facet.multi ? "Add…" : "Any"}</option>
                    {facet.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {(o.label ?? o.value) + ` (${o.count})`}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <fieldset key={facet.key}>
                <legend className="mb-2.5 text-[15px] font-bold text-ink">{facet.label}</legend>
                <div className="flex flex-wrap gap-2">
                  {facet.options.map((o) => {
                    const on = selected.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          facet.multi ? onToggle(facet.key, o.value) : onSet(facet.key, on ? "" : o.value)
                        }
                        className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-left text-[14px] font-medium transition-colors ${
                          on
                            ? "border-mark bg-mark text-on-mark"
                            : "border-rule-2 bg-surface text-ink hover:border-ink"
                        }`}
                      >
                        {on && <Icon name="check" className="text-[18px]" />}
                        {o.label ?? o.value}
                        <span className={`nums ${on ? "text-on-mark/75" : "text-ink-3"}`}>{o.count}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className="border-t border-rule px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-ink text-[15px] font-bold text-paper hover:opacity-90"
          >
            Show {resultCount} {resultCount === 1 ? "listing" : "listings"}
          </button>
        </div>
      </m.div>
    </div>
  );
}

/**
 * Search input with suggestions (a WAI-ARIA combobox). Suggestions come from
 * the real listings (titles, institutions, fields, Gazette numbers), so every
 * one of them leads to at least one result.
 */
function SearchBox({
  draft,
  setDraft,
  placeholder,
  suggestions,
  onPick,
}: {
  draft: string;
  setDraft: (v: string) => void;
  placeholder: string;
  suggestions: SearchSuggestion[];
  onPick: (label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = draft.trim().toLowerCase();
  const matches = q
    ? suggestions
        .filter((s) => s.label.toLowerCase().includes(q) && s.label.toLowerCase() !== q)
        // Prefix matches first, then the rest in their original order.
        .sort((a, b) => Number(!a.label.toLowerCase().startsWith(q)) - Number(!b.label.toLowerCase().startsWith(q)))
        .slice(0, MAX_SUGGESTIONS)
    : [];
  const showList = open && matches.length > 0;

  const pick = (label: string) => {
    onPick(label);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="relative min-w-[240px] flex-1">
      <label htmlFor="job-search" className="sr-only">
        Search listings
      </label>
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-ink-2"
      />
      <input
        id="job-search"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls="job-search-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `job-search-opt-${active}` : undefined}
        autoComplete="off"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            pick(matches[active].label);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border-2 border-ink bg-surface pl-12 pr-11 text-[16px] font-medium text-ink placeholder:font-normal placeholder:text-ink-3 focus:shadow-[0_0_0_4px_var(--mark)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => setDraft("")}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-ink-2 hover:bg-sunk"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      )}
      {showList && (
        <ul
          id="job-search-suggestions"
          role="listbox"
          aria-label="Suggestions"
          className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-lg border border-rule bg-surface py-1.5 shadow-lift"
        >
          {matches.map((m, i) => (
            <li
              key={m.kind + m.label}
              id={`job-search-opt-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: the input's blur would close the list first.
              onMouseDown={(e) => {
                e.preventDefault();
                pick(m.label);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2 text-[15px] ${
                i === active ? "bg-mark-soft" : ""
              }`}
            >
              <span className="min-w-0 truncate text-ink">{m.label}</span>
              <span className="shrink-0 text-[13px] text-ink-3">{m.kind}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
