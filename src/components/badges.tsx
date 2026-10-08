import { Flame, Gauge, TrendingUp } from "lucide-react";
import { CATEGORY_LABEL, DEMAND_LABEL, DIFFICULTY_LABEL } from "@/lib/constants";
import type { Category, Demand, Difficulty } from "@/lib/types";

const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  beginner: "bg-good-soft text-good",
  intermediate: "bg-accent-soft text-accent",
  advanced: "bg-warn-soft text-warn",
};

const DEMAND_STYLE: Record<Demand, string> = {
  "very-high": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  growing: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  emerging: "bg-surface-2 text-muted",
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return (
    <span className={`${base} ${DIFFICULTY_STYLE[value]}`}>
      <Gauge className="size-3" aria-hidden="true" />
      {DIFFICULTY_LABEL[value]}
    </span>
  );
}

export function DemandBadge({ value }: { value: Demand }) {
  const Icon = value === "very-high" ? Flame : TrendingUp;
  return (
    <span className={`${base} ${DEMAND_STYLE[value]}`}>
      <Icon className="size-3" aria-hidden="true" />
      {DEMAND_LABEL[value]}
    </span>
  );
}

export function CategoryBadge({ value }: { value: Category }) {
  return <span className={`${base} border-line text-muted border`}>{CATEGORY_LABEL[value]}</span>;
}
