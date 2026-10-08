import type { Category, Demand, Difficulty, Field } from "./types";

/** The subset of a field the compare page needs (kept small for the client bundle). */
export interface CompareData {
  slug: string;
  name: string;
  icon: string;
  category: Category;
  tagline: string;
  difficulty: Difficulty;
  demand: Demand;
  medianUsd: number;
  benchmark: string;
  growth: string;
  bdMin: number;
  bdMax: number;
  remoteMin: number;
  remoteMax: number;
  languages: string[];
  tools: string[];
  roles: string[];
  beginnerSkills: string[];
  firstMilestone: string;
  capstone: string;
  demandBangladesh: string;
  demandRemote: string;
  demandGlobal: string;
}

export function toCompareData(field: Field): CompareData {
  return {
    slug: field.slug,
    name: field.name,
    icon: field.icon,
    category: field.category,
    tagline: field.tagline,
    difficulty: field.difficulty,
    demand: field.demand,
    medianUsd: field.salary.global.medianUsd,
    benchmark: field.salary.global.benchmark,
    growth: field.salary.global.growth,
    bdMin: field.salary.bangladesh.minBdt,
    bdMax: field.salary.bangladesh.maxBdt,
    remoteMin: field.salary.remote.minUsd,
    remoteMax: field.salary.remote.maxUsd,
    languages: field.stack.languages,
    tools: field.stack.tools.slice(0, 6),
    roles: field.roles.map((r) => r.title),
    beginnerSkills: field.skills.beginner.slice(0, 4),
    firstMilestone: field.roadmap[0]?.milestone ?? "",
    capstone: field.projects[field.projects.length - 1]?.title ?? "",
    demandBangladesh: field.salary.demandNotes.bangladesh,
    demandRemote: field.salary.demandNotes.remote,
    demandGlobal: field.salary.demandNotes.global,
  };
}
