"use client";

import { Check, GitCompareArrows, RotateCcw } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { useCompareTray } from "@/hooks/use-compare-tray";
import { useHydrated, useProgress } from "@/hooks/use-progress";
import { computeProgress } from "@/lib/progress";

/** Progress summary + actions shown in the field header. */
export function FieldProgress({ slug, name, ids }: { slug: string; name: string; ids: string[] }) {
  const { checked, resetField } = useProgress();
  const hydrated = useHydrated();
  const { slugs, toggle } = useCompareTray();
  const stats = computeProgress(ids, checked);
  const inCompare = slugs.includes(slug);

  return (
    <div className="border-line bg-surface shadow-card rounded-2xl border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">Your progress</p>
        <p className="text-muted text-sm tabular-nums">
          {hydrated ? `${stats.done}/${stats.total} · ${stats.percent}%` : `0/${stats.total}`}
        </p>
      </div>
      <div className="mt-2">
        <ProgressBar percent={hydrated ? stats.percent : 0} label={`${name} progress`} />
      </div>
      <p className="text-muted mt-2 text-xs">Tick items in Skills, Roadmap and Start today. Saved in this browser.</p>
      <div className="mt-3 flex flex-wrap gap-2" data-print-hide>
        <button
          type="button"
          onClick={() => toggle(slug)}
          aria-pressed={inCompare}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            inCompare ? "border-accent bg-accent text-accent-fg" : "border-line hover:border-accent hover:text-accent"
          }`}
        >
          {inCompare ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <GitCompareArrows className="size-3.5" aria-hidden="true" />
          )}
          {inCompare ? "In compare list" : "Add to compare"}
        </button>
        {hydrated && stats.done > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Reset all progress for ${name}?`)) resetField(slug);
            }}
            className="text-muted hover:bg-surface-2 hover:text-fg inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
