"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { RotateCcw, Search, SearchX } from "lucide-react";
import { FieldCard } from "./field-card";
import { CompareTray } from "./compare-tray";
import { useCompareTray } from "@/hooks/use-compare-tray";
import { useHydrated, useProgress } from "@/hooks/use-progress";
import { CATEGORY_LABEL, DEMAND_LABEL, DIFFICULTY_LABEL } from "@/lib/constants";
import {
  DEFAULT_FILTERS,
  SALARY_OPTIONS,
  SORT_OPTIONS,
  applyFilters,
  countActiveFilters,
  type FilterState,
  type SortKey,
} from "@/lib/filter";
import { computeProgress } from "@/lib/progress";
import type { Category, Demand, Difficulty, FieldSummary } from "@/lib/types";

const selectClass =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg outline-none transition focus:border-accent";

export function FieldExplorer({
  summaries,
  checklists,
}: {
  summaries: FieldSummary[];
  /** Checklist item IDs per field slug, precomputed on the server to keep the client bundle small. */
  checklists: Record<string, string[]>;
}) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const deferredQuery = useDeferredValue(filters.query);
  const { checked } = useProgress();
  const hydrated = useHydrated();
  const { slugs: compareSlugs, toggle: toggleCompare } = useCompareTray();

  const results = useMemo(
    () => applyFilters(summaries, { ...filters, query: deferredQuery }),
    [summaries, filters, deferredQuery],
  );

  const progressBySlug = useMemo(() => {
    const map = new Map<string, number>();
    for (const [slug, ids] of Object.entries(checklists)) map.set(slug, computeProgress(ids, checked).percent);
    return map;
  }, [checklists, checked]);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const active = countActiveFilters(filters);

  return (
    <section id="explore" className="scroll-mt-20" aria-labelledby="explore-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="explore-heading" className="text-2xl font-semibold tracking-tight">
            Explore 20 career fields
          </h2>
          <p className="text-muted mt-1 text-sm">
            Search by job title, skill, language or tool — e.g. “Python”, “Figma”, “Kubernetes”.
          </p>
        </div>
      </div>

      <div className="border-line bg-surface shadow-card mt-5 rounded-2xl border p-4">
        <label className="relative block">
          <span className="sr-only">Search career fields</span>
          <Search
            className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
            placeholder="Search fields, roles, skills or tools…"
            className="border-line bg-bg placeholder:text-muted focus:border-accent h-11 w-full rounded-xl border pr-3 pl-10 text-sm transition outline-none"
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
          <label className="block">
            <span className="text-muted mb-1 block text-xs font-medium">Difficulty</span>
            <select
              className={selectClass}
              value={filters.difficulty}
              onChange={(e) => update("difficulty", e.target.value as Difficulty | "all")}
            >
              <option value="all">Any difficulty</option>
              {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABEL[d]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-muted mb-1 block text-xs font-medium">Demand</span>
            <select
              className={selectClass}
              value={filters.demand}
              onChange={(e) => update("demand", e.target.value as Demand | "all")}
            >
              <option value="all">Any demand</option>
              {(Object.keys(DEMAND_LABEL) as Demand[]).map((d) => (
                <option key={d} value={d}>
                  {DEMAND_LABEL[d]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-muted mb-1 block text-xs font-medium">Salary (US median)</span>
            <select
              className={selectClass}
              value={filters.minSalary}
              onChange={(e) => update("minSalary", Number(e.target.value))}
            >
              {SALARY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-muted mb-1 block text-xs font-medium">Category</span>
            <select
              className={selectClass}
              value={filters.category}
              onChange={(e) => update("category", e.target.value as Category | "all")}
            >
              <option value="all">All categories</option>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 block md:col-span-1">
            <span className="text-muted mb-1 block text-xs font-medium">Sort by</span>
            <select
              className={selectClass}
              value={filters.sort}
              onChange={(e) => update("sort", e.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-muted" aria-live="polite">
            Showing <span className="text-fg font-semibold">{results.length}</span> of {summaries.length} fields
          </p>
          {active > 0 && (
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-muted hover:bg-surface-2 hover:text-fg inline-flex items-center gap-1 rounded-lg px-2 py-1"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Reset filters ({active})
            </button>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((field) => (
            <FieldCard
              key={field.slug}
              field={field}
              progress={hydrated ? (progressBySlug.get(field.slug) ?? 0) : null}
              inCompare={compareSlugs.includes(field.slug)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      ) : (
        <div className="border-line mt-6 flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center">
          <SearchX className="text-muted size-8" aria-hidden="true" />
          <p className="mt-3 font-medium">No fields match these filters</p>
          <p className="text-muted mt-1 text-sm">Try a broader search or reset the filters.</p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="bg-accent text-accent-fg mt-4 rounded-lg px-4 py-2 text-sm font-medium"
          >
            Reset filters
          </button>
        </div>
      )}

      <CompareTray summaries={summaries} />
    </section>
  );
}
