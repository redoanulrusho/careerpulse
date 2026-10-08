"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { ArrowRight, Crown, Plus, X } from "lucide-react";
import { DemandBadge, DifficultyBadge } from "./badges";
import { FieldIcon } from "./field-icon";
import { useCompareTray } from "@/hooks/use-compare-tray";
import { DEMAND_RANK, DIFFICULTY_RANK } from "@/lib/constants";
import { MAX_COMPARE, MIN_COMPARE, bestIndex, parseCompareParam } from "@/lib/compare";
import type { CompareData } from "@/lib/compare-data";
import { formatBdtRange, formatUsd, formatUsdCompact } from "@/lib/format";

const SUGGESTED = ["ai-agents", "cybersecurity", "data-science"];

export function CompareView({ all }: { all: CompareData[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { slugs: traySlugs, replace: replaceTray } = useCompareTray();
  const validSlugs = useMemo(() => all.map((f) => f.slug), [all]);

  const fromUrl = parseCompareParam(searchParams.get("fields"), validSlugs);
  // URL wins; otherwise fall back to what the user collected in the tray.
  const selected = fromUrl.length > 0 ? fromUrl : traySlugs.filter((s) => validSlugs.includes(s));
  const picked = selected.map((s) => all.find((f) => f.slug === s)).filter((f): f is CompareData => Boolean(f));

  // Keep the header tray in sync with what is being compared.
  const selectedKey = selected.join(",");
  useEffect(() => {
    if (selectedKey && selectedKey !== traySlugs.join(",")) replaceTray(selectedKey.split(","));
  }, [selectedKey, traySlugs, replaceTray]);

  const setSelection = (next: string[]) => {
    replaceTray(next);
    router.replace(next.length ? `${pathname}?fields=${next.join(",")}` : pathname, { scroll: false });
  };

  const setSlot = (index: number, slug: string) => {
    const next = [...selected];
    if (slug === "") next.splice(index, 1);
    else next[index] = slug;
    setSelection([...new Set(next)].filter(Boolean));
  };

  const slotCount = Math.min(
    MAX_COMPARE,
    Math.max(MIN_COMPARE, selected.length + (selected.length < MAX_COMPARE ? 1 : 0)),
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: slotCount }, (_, i) => {
          const value = selected[i] ?? "";
          return (
            <label key={i} className="block">
              <span className="text-muted mb-1 block text-xs font-medium">
                Field {i + 1}
                {i >= MIN_COMPARE ? " (optional)" : ""}
              </span>
              <div className="flex gap-2">
                <select
                  value={value}
                  onChange={(e) => setSlot(i, e.target.value)}
                  className="border-line bg-surface focus:border-accent h-11 w-full rounded-xl border px-3 text-sm outline-none"
                >
                  <option value="">{value ? "Remove this field" : "Choose a field…"}</option>
                  {all.map((f) => (
                    <option key={f.slug} value={f.slug} disabled={selected.includes(f.slug) && f.slug !== value}>
                      {f.name}
                    </option>
                  ))}
                </select>
                {value && (
                  <button
                    type="button"
                    onClick={() => setSlot(i, "")}
                    aria-label={`Remove ${picked[i]?.name ?? "field"}`}
                    className="border-line text-muted hover:text-fg inline-flex size-11 shrink-0 items-center justify-center rounded-xl border"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {picked.length < MIN_COMPARE ? (
        <div className="border-line mt-8 rounded-2xl border border-dashed p-8 text-center">
          <Plus className="text-muted mx-auto size-8" aria-hidden="true" />
          <p className="mt-3 font-medium">Pick at least two fields to compare</p>
          <p className="text-muted mt-1 text-sm">Use the selectors above, or try a popular comparison:</p>
          <button
            type="button"
            onClick={() => setSelection(SUGGESTED)}
            className="bg-accent text-accent-fg mt-4 rounded-lg px-4 py-2 text-sm font-medium"
          >
            AI Agents vs Cybersecurity vs Data Science
          </button>
        </div>
      ) : (
        <CompareTable picked={picked} />
      )}
    </div>
  );
}

function CompareTable({ picked }: { picked: CompareData[] }) {
  const bestSalary = bestIndex(picked.map((f) => f.medianUsd));
  const bestBd = bestIndex(picked.map((f) => f.bdMax));
  const bestRemote = bestIndex(picked.map((f) => f.remoteMax));
  const bestDemand = bestIndex(picked.map((f) => DEMAND_RANK[f.demand]));
  const easiest = bestIndex(picked.map((f) => -DIFFICULTY_RANK[f.difficulty]));

  const rows: { label: string; render: (f: CompareData, i: number) => ReactNode }[] = [
    {
      label: "Difficulty",
      render: (f, i) => (
        <Best on={i === easiest} label="Easiest">
          <DifficultyBadge value={f.difficulty} />
        </Best>
      ),
    },
    {
      label: "Demand",
      render: (f, i) => (
        <Best on={i === bestDemand} label="Highest">
          <DemandBadge value={f.demand} />
        </Best>
      ),
    },
    {
      label: "Global salary benchmark",
      render: (f, i) => (
        <Best on={i === bestSalary} label="Highest">
          <span className="text-lg font-semibold tabular-nums">{formatUsd(f.medianUsd)}</span>
          <span className="text-muted block text-xs">{f.benchmark}</span>
        </Best>
      ),
    },
    { label: "Projected growth", render: (f) => <span className="text-sm">{f.growth}</span> },
    {
      label: "Bangladesh (per month)",
      render: (f, i) => (
        <Best on={i === bestBd} label="Highest top end">
          <span className="font-semibold tabular-nums">{formatBdtRange([f.bdMin, f.bdMax])}</span>
        </Best>
      ),
    },
    {
      label: "Remote from BD (per year)",
      render: (f, i) => (
        <Best on={i === bestRemote} label="Highest top end">
          <span className="font-semibold tabular-nums">
            {formatUsdCompact(f.remoteMin)}–{formatUsdCompact(f.remoteMax)}
          </span>
        </Best>
      ),
    },
    {
      label: "Demand in Bangladesh",
      render: (f) => <p className="text-muted text-sm leading-relaxed">{f.demandBangladesh}</p>,
    },
    { label: "Remote demand", render: (f) => <p className="text-muted text-sm leading-relaxed">{f.demandRemote}</p> },
    { label: "Top languages", render: (f) => <Tags items={f.languages} /> },
    { label: "Key tools", render: (f) => <Tags items={f.tools} /> },
    { label: "Job roles", render: (f) => <List items={f.roles} /> },
    { label: "Start with", render: (f) => <List items={f.beginnerSkills} /> },
    { label: "First 30-day milestone", render: (f) => <p className="text-sm leading-relaxed">{f.firstMilestone}</p> },
    { label: "Capstone project", render: (f) => <p className="text-sm leading-relaxed">{f.capstone}</p> },
  ];

  return (
    <div className="border-line bg-surface mt-8 overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">Side-by-side comparison of {picked.map((f) => f.name).join(", ")}</caption>
        <thead>
          <tr className="border-line border-b">
            <th scope="col" className="text-muted w-44 p-4 text-xs font-medium tracking-wide uppercase">
              Field
            </th>
            {picked.map((f) => (
              <th key={f.slug} scope="col" className="p-4 align-top">
                <div className="flex items-start gap-3">
                  <FieldIcon name={f.icon} category={f.category} size="sm" />
                  <div>
                    <p className="leading-snug font-semibold">{f.name}</p>
                    <p className="text-muted mt-1 text-xs font-normal">{f.tagline}</p>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-line even:bg-surface-2/50 border-b last:border-0">
              <th scope="row" className="text-muted p-4 align-top text-sm font-medium">
                {row.label}
              </th>
              {picked.map((f, i) => (
                <td key={f.slug} className="p-4 align-top">
                  {row.render(f, i)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row" className="p-4" />
            {picked.map((f) => (
              <td key={f.slug} className="p-4">
                <Link
                  href={`/fields/${f.slug}`}
                  className="bg-accent text-accent-fg inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90"
                >
                  View roadmap <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Best({ on, label, children }: { on: boolean; label: string; children: ReactNode }) {
  return (
    <div>
      {children}
      {on && (
        <span className="bg-good-soft text-good mt-1.5 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
          <Crown className="size-3" aria-hidden="true" /> {label}
        </span>
      )}
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="bg-surface-2 rounded-md px-2 py-0.5 text-xs">
          {t}
        </span>
      ))}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span className="bg-muted mt-2 size-1 shrink-0 rounded-full" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
}
