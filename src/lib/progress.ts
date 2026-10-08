import { slugify } from "./format";
import type { Field } from "./types";

/** Sections of a field that contain checkable items. */
export type ChecklistSection = "start" | "roadmap" | "skills";

export const PROGRESS_STORAGE_KEY = "careerpulse:progress:v1";

/** Stable ID for one checklist item, derived from its text so reordering content keeps progress. */
export function checklistId(slug: string, section: ChecklistSection, text: string): string {
  return `${slug}:${section}:${slugify(text)}`;
}

/** All checkable item IDs for a field, grouped by section. */
export function getChecklistIds(field: Field): Record<ChecklistSection, string[]> {
  return {
    start: field.startToday.map((t) => checklistId(field.slug, "start", t)),
    roadmap: field.roadmap.flatMap((phase) => phase.goals.map((g) => checklistId(field.slug, "roadmap", g))),
    skills: [...field.skills.beginner, ...field.skills.intermediate, ...field.skills.advanced].map((s) =>
      checklistId(field.slug, "skills", s),
    ),
  };
}

export interface ProgressStats {
  done: number;
  total: number;
  percent: number;
}

export function computeProgress(ids: string[], checked: ReadonlySet<string>): ProgressStats {
  const total = ids.length;
  const done = ids.filter((id) => checked.has(id)).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function computeFieldProgress(field: Field, checked: ReadonlySet<string>): ProgressStats {
  const groups = getChecklistIds(field);
  return computeProgress([...groups.start, ...groups.roadmap, ...groups.skills], checked);
}

/** Parses a stored JSON string list safely; anything unexpected yields an empty list. */
export function parseStringList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function toggleId(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Removes every stored ID belonging to one field (used by "Reset progress"). */
export function clearField(list: readonly string[], slug: string): string[] {
  return list.filter((id) => !id.startsWith(`${slug}:`));
}
