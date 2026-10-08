import { describe, expect, it } from "vitest";
import { bestIndex, compareHref, parseCompareParam } from "@/lib/compare";
import { getField } from "@/lib/fields";
import {
  formatBdt,
  formatBdtCompact,
  formatBdtRange,
  formatUsd,
  formatUsdCompact,
  hostname,
  slugify,
} from "@/lib/format";
import {
  checklistId,
  clearField,
  computeFieldProgress,
  computeProgress,
  getChecklistIds,
  parseStringList,
  toggleId,
} from "@/lib/progress";
import { nextPreference, resolveTheme } from "@/lib/theme";

describe("format", () => {
  it("formats currency", () => {
    expect(formatUsd(134040)).toBe("$134,040");
    expect(formatUsdCompact(134040)).toBe("$134k");
    expect(formatUsdCompact(950)).toBe("$950");
    expect(formatBdt(18345)).toBe("Tk 18,345");
    expect(formatBdtCompact(100918)).toBe("101k");
    expect(formatBdtRange([18345, 100918])).toBe("Tk 18k–101k");
  });

  it("slugifies text", () => {
    expect(slugify("Learn SQL: JOINs & GROUP BY!")).toBe("learn-sql-joins-group-by");
    expect(slugify("  Café — déjà vu ")).toBe("cafe-deja-vu");
  });

  it("extracts hostnames", () => {
    expect(hostname("https://www.bls.gov/ooh/")).toBe("bls.gov");
    expect(hostname("not a url")).toBe("not a url");
  });
});

describe("compare", () => {
  const valid = ["ai-agents", "cybersecurity", "data-science", "robotics"];

  it("parses, de-duplicates and caps at 3", () => {
    expect(parseCompareParam("ai-agents,cybersecurity,ai-agents,data-science,robotics", valid)).toEqual([
      "ai-agents",
      "cybersecurity",
      "data-science",
    ]);
  });

  it("drops unknown slugs and handles empty input", () => {
    expect(parseCompareParam("ai-agents,unknown", valid)).toEqual(["ai-agents"]);
    expect(parseCompareParam(null, valid)).toEqual([]);
    expect(parseCompareParam(" AI-Agents ", valid)).toEqual(["ai-agents"]);
  });

  it("builds hrefs", () => {
    expect(compareHref(["a", "b"])).toBe("/compare?fields=a,b");
    expect(compareHref([])).toBe("/compare");
  });

  it("finds a unique best index and reports ties", () => {
    expect(bestIndex([1, 3, 2])).toBe(1);
    expect(bestIndex([3, 3, 2])).toBe(-1);
    expect(bestIndex([])).toBe(-1);
  });
});

describe("progress", () => {
  const field = getField("cybersecurity")!;

  it("creates stable, namespaced checklist IDs", () => {
    expect(checklistId("cybersecurity", "start", "Turn on MFA!")).toBe("cybersecurity:start:turn-on-mfa");
  });

  it("collects IDs for every checkable item", () => {
    const ids = getChecklistIds(field);
    expect(ids.start).toHaveLength(field.startToday.length);
    expect(ids.roadmap).toHaveLength(field.roadmap.reduce((n, p) => n + p.goals.length, 0));
    expect(ids.skills).toHaveLength(
      field.skills.beginner.length + field.skills.intermediate.length + field.skills.advanced.length,
    );
    const all = [...ids.start, ...ids.roadmap, ...ids.skills];
    expect(new Set(all).size).toBe(all.length);
  });

  it("computes percentages", () => {
    expect(computeProgress(["a", "b", "c", "d"], new Set(["a", "c", "x"]))).toEqual({ done: 2, total: 4, percent: 50 });
    expect(computeProgress([], new Set())).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it("computes per-field progress", () => {
    const ids = getChecklistIds(field);
    const stats = computeFieldProgress(field, new Set(ids.start));
    expect(stats.done).toBe(ids.start.length);
    expect(stats.percent).toBeGreaterThan(0);
    expect(stats.percent).toBeLessThan(100);
  });

  it("toggles and clears IDs immutably", () => {
    const list = ["a:start:x"];
    expect(toggleId(list, "a:start:y")).toEqual(["a:start:x", "a:start:y"]);
    expect(toggleId(list, "a:start:x")).toEqual([]);
    expect(list).toEqual(["a:start:x"]);
    expect(clearField(["a:start:x", "ab:start:y", "b:skills:z"], "a")).toEqual(["ab:start:y", "b:skills:z"]);
  });

  it("parses stored lists defensively", () => {
    expect(parseStringList('["a","b",3]')).toEqual(["a", "b"]);
    expect(parseStringList("{bad json")).toEqual([]);
    expect(parseStringList('{"a":1}')).toEqual([]);
    expect(parseStringList(null)).toEqual([]);
  });
});

describe("theme", () => {
  it("resolves system preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("cycles light → dark → system", () => {
    expect(nextPreference("light")).toBe("dark");
    expect(nextPreference("dark")).toBe("system");
    expect(nextPreference("system")).toBe("light");
  });
});
