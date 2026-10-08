/**
 * Content model for a CareerPulse career field.
 * Every field lives in `src/data/fields/<slug>.json` and must satisfy this shape
 * (enforced by `tests/data.test.ts`).
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Demand = "very-high" | "high" | "growing" | "emerging";
export type Category = "ai-data" | "infra-security" | "software" | "design-product" | "emerging";
export type ProjectLevel = "easy" | "medium" | "hard";
export type ResourceType = "course" | "docs" | "book" | "video" | "practice" | "guide";

export interface Source {
  label: string;
  url: string;
}

export interface Role {
  title: string;
  description: string;
}

export interface RoadmapPhase {
  /** e.g. "Days 1–30" */
  range: string;
  title: string;
  goals: string[];
  milestone: string;
}

export interface Resource {
  title: string;
  provider: string;
  url: string;
  type: ResourceType;
  /** Optional note e.g. "Free to audit" */
  note?: string;
}

export interface Project {
  title: string;
  level: ProjectLevel;
  description: string;
  skills: string[];
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface SalaryInfo {
  bangladesh: {
    /** Monthly gross salary range in BDT. */
    minBdt: number;
    maxBdt: number;
    note: string;
    sources: Source[];
  };
  remote: {
    /** Yearly USD range for remote roles hired from South Asia. */
    minUsd: number;
    maxUsd: number;
    note: string;
    sources: Source[];
  };
  global: {
    /** Yearly median in USD (US benchmark). */
    medianUsd: number;
    benchmark: string;
    growth: string;
    note: string;
    sources: Source[];
  };
  demandNotes: {
    bangladesh: string;
    remote: string;
    global: string;
  };
}

export interface Field {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  category: Category;
  difficulty: Difficulty;
  demand: Demand;
  overview: {
    summary: string;
    whyTrending: string[];
    trendSources: Source[];
  };
  roles: Role[];
  skills: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
  stack: {
    languages: string[];
    tools: string[];
    note: string;
  };
  roadmap: RoadmapPhase[];
  resources: Resource[];
  projects: Project[];
  interview: InterviewQuestion[];
  resumeBullets: string[];
  salary: SalaryInfo;
  startToday: string[];
}

/** Lightweight summary used by cards, search and compare. */
export type FieldSummary = Pick<Field, "slug" | "name" | "icon" | "tagline" | "category" | "difficulty" | "demand"> & {
  medianUsd: number;
  bdRange: [number, number];
  remoteRange: [number, number];
  keywords: string;
};
