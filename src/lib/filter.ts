import { DEMAND_RANK, DIFFICULTY_RANK } from "./constants";
import type { Category, Demand, Difficulty, FieldSummary } from "./types";

export type SortKey = "featured" | "salary" | "demand" | "easiest" | "name";

export interface FilterState {
  query: string;
  difficulty: Difficulty | "all";
  demand: Demand | "all";
  category: Category | "all";
  /** Minimum US median salary in USD (0 = any). */
  minSalary: number;
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  query: "",
  difficulty: "all",
  demand: "all",
  category: "all",
  minSalary: 0,
  sort: "featured",
};

export const SALARY_OPTIONS = [
  { value: 0, label: "Any salary" },
  { value: 100000, label: "$100k+ median" },
  { value: 120000, label: "$120k+ median" },
  { value: 135000, label: "$135k+ median" },
] as const;

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "salary", label: "Highest salary" },
  { value: "demand", label: "Highest demand" },
  { value: "easiest", label: "Easiest to start" },
  { value: "name", label: "A–Z" },
];

/** Lower-cases and strips punctuation so "ui/ux" and "UI UX" match. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.]+/gu, " ")
    .trim();
}

/** Every whitespace-separated term in the query must appear in the summary. */
export function matchesQuery(summary: FieldSummary, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(summary.keywords);
  return terms.every((term) => haystack.includes(term));
}

export function filterFields(list: FieldSummary[], state: FilterState): FieldSummary[] {
  return list.filter(
    (f) =>
      matchesQuery(f, state.query) &&
      (state.difficulty === "all" || f.difficulty === state.difficulty) &&
      (state.demand === "all" || f.demand === state.demand) &&
      (state.category === "all" || f.category === state.category) &&
      f.medianUsd >= state.minSalary,
  );
}

export function sortFields(list: FieldSummary[], sort: SortKey): FieldSummary[] {
  const copy = [...list];
  switch (sort) {
    case "salary":
      return copy.sort((a, b) => b.medianUsd - a.medianUsd);
    case "demand":
      return copy.sort((a, b) => DEMAND_RANK[b.demand] - DEMAND_RANK[a.demand] || b.medianUsd - a.medianUsd);
    case "easiest":
      return copy.sort(
        (a, b) =>
          DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
          DEMAND_RANK[b.demand] - DEMAND_RANK[a.demand],
      );
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return copy;
  }
}

export function applyFilters(list: FieldSummary[], state: FilterState): FieldSummary[] {
  return sortFields(filterFields(list, state), state.sort);
}

export function countActiveFilters(state: FilterState): number {
  return [
    state.query.trim() !== "",
    state.difficulty !== "all",
    state.demand !== "all",
    state.category !== "all",
    state.minSalary > 0,
  ].filter(Boolean).length;
}
