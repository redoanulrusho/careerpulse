"use client";

import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { useCompareTray } from "@/hooks/use-compare-tray";
import { compareHref } from "@/lib/compare";

/** Header link to the compare page, carrying the user's current picks. */
export function CompareNavLink() {
  const { slugs } = useCompareTray();
  return (
    <Link
      href={compareHref([...slugs])}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      <GitCompareArrows className="size-4" aria-hidden="true" />
      <span>Compare</span>
      {slugs.length > 0 && (
        <span className="rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-fg">
          {slugs.length}
        </span>
      )}
    </Link>
  );
}
