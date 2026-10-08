"use client";

import Link from "next/link";
import { Check, GitCompareArrows } from "lucide-react";
import { DemandBadge, DifficultyBadge } from "./badges";
import { FieldIcon } from "./field-icon";
import { ProgressBar } from "./progress-bar";
import { formatBdtRange, formatUsdCompact } from "@/lib/format";
import type { FieldSummary } from "@/lib/types";

export function FieldCard({
  field,
  progress,
  inCompare,
  onToggleCompare,
}: {
  field: FieldSummary;
  /** null until browser storage has been read. */
  progress: number | null;
  inCompare: boolean;
  onToggleCompare: (slug: string) => void;
}) {
  return (
    <article className="group border-line bg-surface shadow-card hover:border-accent/50 relative flex flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <FieldIcon name={field.icon} category={field.category} />
        <div className="min-w-0 flex-1">
          <h3 className="leading-snug font-semibold">
            <Link href={`/fields/${field.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
              {field.name}
            </Link>
          </h3>
          <p className="text-muted mt-1 line-clamp-2 text-sm">{field.tagline}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <DifficultyBadge value={field.difficulty} />
        <DemandBadge value={field.demand} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-surface-2 rounded-lg px-2 py-2">
          <dt className="text-muted">BD / month</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{formatBdtRange(field.bdRange)}</dd>
        </div>
        <div className="bg-surface-2 rounded-lg px-2 py-2">
          <dt className="text-muted">Remote / yr</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">
            {formatUsdCompact(field.remoteRange[0])}–{formatUsdCompact(field.remoteRange[1])}
          </dd>
        </div>
        <div className="bg-surface-2 rounded-lg px-2 py-2">
          <dt className="text-muted">US median</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{formatUsdCompact(field.medianUsd)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-3 pt-4">
        <div className="flex-1">
          {progress !== null && progress > 0 ? (
            <div className="space-y-1">
              <p className="text-muted text-xs">{progress}% of checklist done</p>
              <ProgressBar percent={progress} label={`${field.name} progress`} size="sm" />
            </div>
          ) : (
            <p className="text-muted text-xs">Not started yet</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggleCompare(field.slug)}
          aria-pressed={inCompare}
          className={`relative z-10 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            inCompare
              ? "border-accent bg-accent text-accent-fg"
              : "border-line text-muted hover:border-accent hover:text-accent"
          }`}
        >
          {inCompare ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <GitCompareArrows className="size-3.5" aria-hidden="true" />
          )}
          {inCompare ? "Added" : "Compare"}
          <span className="sr-only"> {field.name}</span>
        </button>
      </div>
    </article>
  );
}
