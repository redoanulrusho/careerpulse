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
    return <div className="h-48 animate-pulse rounded-2xl bg-surface-2" aria-label="Loading your progress" />;
  }

  const withStats = rows
    .map((r) => ({ ...r, stats: computeProgress(r.ids, checked) }))
    .sort((a, b) => b.stats.percent - a.stats.percent);
  const started = withStats.filter((r) => r.stats.done > 0);
  const totalDone = started.reduce((n, r) => n + r.stats.done, 0);

  if (started.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <ListChecks className="mx-auto size-8 text-muted" aria-hidden="true" />
        <p className="mt-3 font-medium">You haven&apos;t ticked anything yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Open any career field and tick items in Skills, the 30/60/90 roadmap or the Start today checklist. Your
          progress is saved privately in this browser.
        </p>
        <Link
          href="/#explore"
          className="mt-5 inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
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
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent"
            >
              <FieldIcon name={r.icon} category={r.category} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-sm tabular-nums text-muted">
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
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg"
      >
        <Trash2 className="size-4" aria-hidden="true" /> Reset all progress
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
