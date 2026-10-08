import {
  Atom,
  Blocks,
  Bot,
  BrainCircuit,
  ChartColumn,
  CircuitBoard,
  Cloud,
  CodeXml,
  Cog,
  Compass,
  Database,
  Glasses,
  Infinity as InfinityIcon,
  Leaf,
  Palette,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Atom,
  Blocks,
  Bot,
  BrainCircuit,
  ChartColumn,
  CircuitBoard,
  Cloud,
  CodeXml,
  Cog,
  Compass,
  Database,
  Glasses,
  Infinity: InfinityIcon,
  Leaf,
  Palette,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
};

/** Tile colours per category; each pair works in light and dark themes. */
const CATEGORY_TILE: Record<Category, string> = {
  "ai-data": "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "infra-security": "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  software: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "design-product": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  emerging: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

export function FieldIcon({
  name,
  category,
  size = "md",
}: {
  name: string;
  category: Category;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = ICONS[name] ?? Sparkles;
  const box = size === "lg" ? "size-14 rounded-2xl" : size === "sm" ? "size-8 rounded-lg" : "size-11 rounded-xl";
  const icon = size === "lg" ? "size-7" : size === "sm" ? "size-4" : "size-5";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${box} ${CATEGORY_TILE[category]}`}>
      <Icon className={icon} aria-hidden="true" />
    </span>
  );
}
