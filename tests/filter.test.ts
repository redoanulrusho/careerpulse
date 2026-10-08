import { describe, expect, it } from "vitest";
import { getFieldSummaries } from "@/lib/fields";
import {
  DEFAULT_FILTERS,
  applyFilters,
  countActiveFilters,
  filterFields,
  matchesQuery,
  normalize,
  sortFields,
} from "@/lib/filter";

const all = getFieldSummaries();

describe("normalize", () => {
  it("lower-cases and collapses punctuation", () => {
    expect(normalize("UI/UX  Design!")).toBe("ui ux design");
  });

  it("keeps characters meaningful in tech names", () => {
    expect(normalize("C++ and C#")).toBe("c++ and c#");
  });
});

describe("search", () => {
  it("matches by field name", () => {
    const result = filterFields(all, { ...DEFAULT_FILTERS, query: "cyber" });
    expect(result.map((f) => f.slug)).toContain("cybersecurity");
  });

  it("matches by tool or language inside the field", () => {
    const result = filterFields(all, { ...DEFAULT_FILTERS, query: "kubernetes" });
    expect(result.map((f) => f.slug)).toEqual(expect.arrayContaining(["devops-platform", "cloud-engineering"]));
  });

  it("requires every query term to match", () => {
    const summary = all.find((f) => f.slug === "mobile-development")!;
    expect(matchesQuery(summary, "flutter kotlin")).toBe(true);
    expect(matchesQuery(summary, "flutter solidity")).toBe(false);
  });

  it("returns everything for an empty query", () => {
    expect(filterFields(all, DEFAULT_FILTERS)).toHaveLength(all.length);
  });
});

describe("filters", () => {
  it("filters by difficulty", () => {
    const result = filterFields(all, { ...DEFAULT_FILTERS, difficulty: "beginner" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((f) => f.difficulty === "beginner")).toBe(true);
  });

  it("filters by demand", () => {
    const result = filterFields(all, { ...DEFAULT_FILTERS, demand: "very-high" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((f) => f.demand === "very-high")).toBe(true);
  });

  it("filters by minimum salary", () => {
    const result = filterFields(all, { ...DEFAULT_FILTERS, minSalary: 135_000 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((f) => f.medianUsd >= 135_000)).toBe(true);
  });

  it("combines filters with AND logic", () => {
    const result = filterFields(all, { ...DEFAULT_FILTERS, category: "ai-data", difficulty: "advanced" });
    expect(result.every((f) => f.category === "ai-data" && f.difficulty === "advanced")).toBe(true);
  });

  it("counts active filters", () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...DEFAULT_FILTERS, query: "ai", minSalary: 100_000 })).toBe(2);
  });
});

describe("sorting", () => {
  it("sorts by salary descending", () => {
    const sorted = sortFields(all, "salary");
    for (let i = 1; i < sorted.length; i++) expect(sorted[i - 1].medianUsd).toBeGreaterThanOrEqual(sorted[i].medianUsd);
  });

  it("sorts easiest first", () => {
    const sorted = sortFields(all, "easiest");
    expect(sorted[0].difficulty).toBe("beginner");
    expect(sorted[sorted.length - 1].difficulty).toBe("advanced");
  });

  it("sorts alphabetically", () => {
    const names = sortFields(all, "name").map((f) => f.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("does not mutate the input", () => {
    const before = all.map((f) => f.slug);
    sortFields(all, "salary");
    expect(all.map((f) => f.slug)).toEqual(before);
  });

  it("applyFilters filters then sorts", () => {
    const result = applyFilters(all, { ...DEFAULT_FILTERS, demand: "very-high", sort: "salary" });
    expect(result.every((f) => f.demand === "very-high")).toBe(true);
    expect(result[0].medianUsd).toBe(Math.max(...result.map((f) => f.medianUsd)));
  });
});
