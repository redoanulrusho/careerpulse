import { fields } from "@/data/fields";
import { CATEGORY_LABEL } from "./constants";
import type { Field, FieldSummary } from "./types";

export function getAllFields(): Field[] {
  return fields;
}

export function getField(slug: string): Field | undefined {
  return fields.find((f) => f.slug === slug);
}

export function getAllSlugs(): string[] {
  return fields.map((f) => f.slug);
}

/** Builds the lightweight, searchable summary used by cards, filters and compare. */
export function toSummary(field: Field): FieldSummary {
  const keywords = [
    field.name,
    field.tagline,
    CATEGORY_LABEL[field.category],
    ...field.roles.map((r) => r.title),
    ...field.stack.languages,
    ...field.stack.tools,
    ...field.skills.beginner,
    ...field.skills.intermediate,
    ...field.skills.advanced,
  ]
    .join(" ")
    .toLowerCase();

  return {
    slug: field.slug,
    name: field.name,
    icon: field.icon,
    tagline: field.tagline,
    category: field.category,
    difficulty: field.difficulty,
    demand: field.demand,
    medianUsd: field.salary.global.medianUsd,
    bdRange: [field.salary.bangladesh.minBdt, field.salary.bangladesh.maxBdt],
    remoteRange: [field.salary.remote.minUsd, field.salary.remote.maxUsd],
    keywords,
  };
}

export function getFieldSummaries(): FieldSummary[] {
  return fields.map(toSummary);
}

/** Every unique source URL cited by a field (used by the link checker and the Sources list). */
export function collectFieldUrls(field: Field): string[] {
  const urls = [
    ...field.overview.trendSources.map((s) => s.url),
    ...field.resources.map((r) => r.url),
    ...field.salary.bangladesh.sources.map((s) => s.url),
    ...field.salary.remote.sources.map((s) => s.url),
    ...field.salary.global.sources.map((s) => s.url),
  ];
  return [...new Set(urls)];
}
