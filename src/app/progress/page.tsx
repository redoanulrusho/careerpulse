import type { Metadata } from "next";
import { ProgressDashboard, type ProgressRow } from "@/components/progress-dashboard";
import { getAllFields } from "@/lib/fields";
import { getChecklistIds } from "@/lib/progress";

export const metadata: Metadata = {
  title: "My progress",
  description: "Your saved learning progress across CareerPulse career fields.",
};

export default function ProgressPage() {
  const rows: ProgressRow[] = getAllFields().map((f) => {
    const ids = getChecklistIds(f);
    return {
      slug: f.slug,
      name: f.name,
      icon: f.icon,
      category: f.category,
      ids: [...ids.start, ...ids.roadmap, ...ids.skills],
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">My progress</h1>
      <p className="mt-2 text-muted">
        Everything you&apos;ve ticked across all fields. Stored only in this browser — clearing site data resets it.
      </p>
      <div className="mt-8">
        <ProgressDashboard rows={rows} />
      </div>
    </div>
  );
}
