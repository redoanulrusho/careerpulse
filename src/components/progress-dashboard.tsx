"use client";

import Link from "next/link";
import { ArrowRight, ListChecks, Trash2 } from "lucide-react";
import { FieldIcon } from "./field-icon";
import { ProgressBar } from "./progress-bar";
import { useHydrated, useProgress } from "@/hooks/use-progress";
import { computeProgress } from "@/lib/progress";
import type { Category } from "@/lib/types";

export interface ProgressRow {
  slug: string;
  name: string;
  icon: string;
  category: Category;
  ids: string[];
}

export function ProgressDashboard({ rows }: { rows: ProgressRow[] }) {
  const { checked, resetAll } = useProgress();
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="bg-surface-2 h-48 animate-pulse rounded-2xl" aria-label="Loading your progress" />;
  }

  const withStats = rows
    .map((r) => ({ ...r, stats: computeProgress(r.ids, checked) }))
    .sort((a, b) => b.stats.percent - a.stats.percent);
  const started = withStats.filter((r) => r.stats.done > 0);
  const totalDone = started.reduce((n, r) => n + r.stats.done, 0);

  if (started.length === 0) {
    return (
      <div className="border-line rounded-2xl border border-dashed p-10 text-center">
        <ListChecks className="text-muted mx-auto size-8" aria-hidden="true" />
        <p className="mt-3 font-medium">You haven&apos;t ticked anything yet</p>
        <p className="text-muted mx-auto mt-1 max-w-md text-sm">
          Open any career field and tick items in Skills, the 30/60/90 roadmap or the Start today checklist. Your
          progress is saved privately in this browser.
        </p>
        <Link
          href="/#explore"
          className="bg-accent text-accent-fg mt-5 inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium"
        >
          Explore careers <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Fields started" value={started.length} />
        <Stat label="Items completed" value={totalDone} />
        <Stat label="Best progress" value={`${started[0].stats.percent}%`} />
      </div>

      <ul className="space-y-3">
        {started.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/fields/${r.slug}#roadmap`}
              className="border-line bg-surface hover:border-accent flex items-center gap-4 rounded-2xl border p-4 transition"
            >
              <FieldIcon name={r.icon} category={r.category} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-muted text-sm tabular-nums">
                    {r.stats.done}/{r.stats.total} · {r.stats.percent}%
                  </p>
                </div>
                <div className="mt-2">
                  <ProgressBar percent={r.stats.percent} label={`${r.name} progress`} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => {
          if (window.confirm("Reset progress for every field? This cannot be undone.")) resetAll();
        }}
        className="text-muted hover:bg-surface-2 hover:text-fg inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm"
      >
        <Trash2 className="size-4" aria-hidden="true" /> Reset all progress
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-line bg-surface rounded-2xl border p-4">
      <p className="text-muted text-xs">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
