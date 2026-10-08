"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useCompareTray } from "@/hooks/use-compare-tray";
import { MAX_COMPARE, MIN_COMPARE, compareHref } from "@/lib/compare";
import type { FieldSummary } from "@/lib/types";

/** Floating bar that appears once the user adds fields to compare. */
export function CompareTray({ summaries }: { summaries: FieldSummary[] }) {
  const { slugs, toggle, clear } = useCompareTray();
  if (slugs.length === 0) return null;

  const picked = slugs.map((s) => summaries.find((f) => f.slug === s)).filter((f): f is FieldSummary => Boolean(f));
  const ready = picked.length >= MIN_COMPARE;

  return (
    <div
      data-print-hide
      className="border-line bg-surface/95 shadow-card fixed inset-x-0 bottom-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-3xl rounded-2xl border p-3 backdrop-blur"
      role="region"
      aria-label="Fields selected for comparison"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-1 text-sm font-medium">
          Compare ({picked.length}/{MAX_COMPARE})
        </span>
        {picked.map((f) => (
          <span
            key={f.slug}
            className="bg-accent-soft text-accent inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-xs font-medium"
          >
            {f.name}
            <button
              type="button"
              onClick={() => toggle(f.slug)}
              className="hover:bg-accent/15 rounded-full p-0.5"
              aria-label={`Remove ${f.name} from comparison`}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={clear} className="text-muted hover:text-fg rounded-lg px-2 py-1.5 text-xs">
            Clear
          </button>
          {ready ? (
            <Link
              href={compareHref(picked.map((f) => f.slug))}
              className="bg-accent text-accent-fg inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-90"
            >
              Compare now <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span className="text-muted text-xs">Pick at least {MIN_COMPARE}</span>
          )}
        </div>
      </div>
    </div>
  );
}
