import type { Metadata } from "next";
import { ProgressDashboard, type ProgressRow } from "@/components/progress-dashboard";
import { getAllFields } from "@/lib/fields";
import { getChecklistIds } from "@/lib/progress";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Track your tech career learning progress",
  description:
    "Track roadmap checklists across all 20 CareerPulse tech career fields. Progress is saved privately in your browser — no sign-up needed.",
  path: "/progress",
});

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
      <p className="text-muted mt-2">
        Everything you&apos;ve ticked across all fields. Stored only in this browser — clearing site data resets it.
      </p>
      <div className="mt-8">
        <ProgressDashboard rows={rows} />
      </div>
    </div>
  );
}
