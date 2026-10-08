import { describe, expect, it } from "vitest";
import { FIELD_SLUGS } from "@/data/fields/slugs";
import { collectFieldUrls, getAllFields, getAllSlugs, getField } from "@/lib/fields";
import type { Field } from "@/lib/types";

const fields = getAllFields();

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const DEMANDS = ["very-high", "high", "growing", "emerging"];
const CATEGORIES = ["ai-data", "infra-security", "software", "design-product", "emerging"];
const RESOURCE_TYPES = ["course", "docs", "book", "video", "practice", "guide"];

describe("content data set", () => {
  it("contains exactly 20 career fields", () => {
    expect(fields).toHaveLength(20);
  });

  it("uses unique, URL-safe slugs that match their file lookup", () => {
    const slugs = getAllSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(getField(slug)?.slug).toBe(slug);
    }
  });

  it("keeps the proxy slug list in sync with the content", () => {
    expect([...FIELD_SLUGS]).toEqual(getAllSlugs());
  });

  it("returns undefined for unknown slugs", () => {
    expect(getField("not-a-real-field")).toBeUndefined();
  });
});

describe.each(fields.map((f) => [f.name, f] as [string, Field]))("%s", (_name, field) => {
  it("has valid enum values", () => {
    expect(DIFFICULTIES).toContain(field.difficulty);
    expect(DEMANDS).toContain(field.demand);
    expect(CATEGORIES).toContain(field.category);
  });

  it("explains the field and why it is trending, with sources", () => {
    expect(field.overview.summary.length).toBeGreaterThan(200);
    expect(field.overview.whyTrending.length).toBeGreaterThanOrEqual(3);
    expect(field.overview.trendSources.length).toBeGreaterThanOrEqual(1);
  });

  it("lists 4–6 job roles", () => {
    expect(field.roles.length).toBeGreaterThanOrEqual(4);
    expect(field.roles.length).toBeLessThanOrEqual(6);
    for (const role of field.roles) expect(role.description.length).toBeGreaterThan(20);
  });

  it("has skills at every level and a languages/tools stack", () => {
    expect(field.skills.beginner.length).toBeGreaterThanOrEqual(4);
    expect(field.skills.intermediate.length).toBeGreaterThanOrEqual(4);
    expect(field.skills.advanced.length).toBeGreaterThanOrEqual(4);
    expect(field.stack.languages.length).toBeGreaterThanOrEqual(2);
    expect(field.stack.tools.length).toBeGreaterThanOrEqual(5);
  });

  it("has a 30/60/90-day roadmap", () => {
    expect(field.roadmap.map((p) => p.range)).toEqual(["Days 1–30", "Days 31–60", "Days 61–90"]);
    for (const phase of field.roadmap) {
      expect(phase.goals.length).toBeGreaterThanOrEqual(4);
      expect(phase.milestone).not.toBe("");
    }
  });

  it("has 8–10 free resources with valid https links and types", () => {
    expect(field.resources.length).toBeGreaterThanOrEqual(8);
    expect(field.resources.length).toBeLessThanOrEqual(10);
    for (const r of field.resources) {
      expect(RESOURCE_TYPES).toContain(r.type);
      expect(() => new URL(r.url)).not.toThrow();
      expect(r.url.startsWith("https://")).toBe(true);
    }
    expect(new Set(field.resources.map((r) => r.url)).size).toBe(field.resources.length);
  });

  it("has 5 projects ordered easy → hard", () => {
    expect(field.projects).toHaveLength(5);
    const order = { easy: 0, medium: 1, hard: 2 };
    const levels = field.projects.map((p) => order[p.level]);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
    expect(field.projects[0].level).toBe("easy");
    expect(field.projects[4].level).toBe("hard");
  });

  it("has 10 interview questions with answers and 5 resume bullets", () => {
    expect(field.interview).toHaveLength(10);
    for (const q of field.interview) {
      expect(q.question.trim().endsWith("?") || q.question.trim().endsWith(".")).toBe(true);
      expect(q.answer.length).toBeGreaterThan(40);
    }
    expect(field.resumeBullets).toHaveLength(5);
  });

  it("has sane, sourced salary data for Bangladesh, remote and global", () => {
    const { bangladesh, remote, global } = field.salary;
    expect(bangladesh.minBdt).toBeGreaterThan(5_000);
    expect(bangladesh.maxBdt).toBeGreaterThan(bangladesh.minBdt);
    expect(bangladesh.maxBdt).toBeLessThan(500_000);
    expect(remote.maxUsd).toBeGreaterThan(remote.minUsd);
    expect(global.medianUsd).toBeGreaterThan(50_000);
    expect(global.medianUsd).toBeLessThan(300_000);
    for (const part of [bangladesh, remote, global]) {
      expect(part.sources.length).toBeGreaterThanOrEqual(1);
      expect(part.note.length).toBeGreaterThan(20);
    }
  });

  it("has a start-today checklist without duplicate items", () => {
    expect(field.startToday.length).toBeGreaterThanOrEqual(5);
    expect(new Set(field.startToday).size).toBe(field.startToday.length);
  });

  it("only cites https URLs", () => {
    for (const url of collectFieldUrls(field)) expect(url).toMatch(/^https:\/\//);
  });
});
