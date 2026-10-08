import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "@/components/compare-view";
import { toCompareData } from "@/lib/compare-data";
import { getAllFields } from "@/lib/fields";

export const metadata: Metadata = {
  title: "Compare career fields",
  description: "Compare 2–3 tech career fields side by side: salary, demand, difficulty, skills and tools.",
};

export default function ComparePage() {
  const all = getAllFields().map(toCompareData);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Compare career fields</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Put two or three fields side by side to see how salary, demand, difficulty, skills and tools stack up. The best
        value in each row is highlighted.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-surface-2" aria-label="Loading comparison" />}>
          <CompareView all={all} />
        </Suspense>
      </div>
    </div>
  );
}
