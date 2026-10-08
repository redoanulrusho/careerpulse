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
      className="text-muted hover:bg-surface-2 hover:text-fg inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition"
    >
      <GitCompareArrows className="size-4" aria-hidden="true" />
      <span>Compare</span>
      {slugs.length > 0 && (
        <span className="bg-accent text-accent-fg rounded-full px-1.5 text-xs font-semibold">{slugs.length}</span>
      )}
    </Link>
  );
}
