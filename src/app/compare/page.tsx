import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "@/components/compare-view";
import { toCompareData } from "@/lib/compare-data";
import { getAllFields } from "@/lib/fields";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Compare tech career fields side by side",
  description:
    "Compare 2–3 tech careers side by side — salaries in Bangladesh, remote and global markets, demand, difficulty, skills and tools.",
  path: "/compare",
});

export default function ComparePage() {
  const all = getAllFields().map(toCompareData);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Compare career fields</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Put two or three fields side by side to see how salary, demand, difficulty, skills and tools stack up. The best
        value in each row is highlighted.
      </p>
      <div className="mt-8">
        <Suspense
          fallback={<div className="bg-surface-2 h-40 animate-pulse rounded-2xl" aria-label="Loading comparison" />}
        >
          <CompareView all={all} />
        </Suspense>
      </div>
    </div>
  );
}
