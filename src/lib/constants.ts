import type { Category, Demand, Difficulty } from "./types";

/* Display labels and rankings. Kept free of data imports so client components stay small. */

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: "Beginner-friendly",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DEMAND_LABEL: Record<Demand, string> = {
  "very-high": "Very high demand",
  high: "High demand",
  growing: "Growing demand",
  emerging: "Emerging",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  "ai-data": "AI & Data",
  "infra-security": "Cloud & Security",
  software: "Software Engineering",
  "design-product": "Design & Product",
  emerging: "Emerging Tech",
};

/** Higher = more demand. Used for sorting and compare highlighting. */
export const DEMAND_RANK: Record<Demand, number> = {
  "very-high": 4,
  high: 3,
  growing: 2,
  emerging: 1,
};

/** Lower = easier to start. */
export const DIFFICULTY_RANK: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export const TAB_IDS = [
  "overview",
  "roles",
  "skills",
  "stack",
  "roadmap",
  "resources",
  "projects",
  "interview",
  "resume",
  "salary",
  "start",
] as const;

export type TabId = (typeof TAB_IDS)[number];

export const TAB_LABEL: Record<TabId, string> = {
  overview: "Overview",
  roles: "Job roles",
  skills: "Skills",
  stack: "Languages & tools",
  roadmap: "30/60/90 roadmap",
  resources: "Free resources",
  projects: "Projects",
  interview: "Interview Q&A",
  resume: "Resume bullets",
  salary: "Salary & demand",
  start: "Start today",
};
