import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GitCompareArrows,
  ListChecks,
  Map as MapIcon,
  MessageSquareText,
  Wallet,
} from "lucide-react";
import { FieldExplorer } from "@/components/field-explorer";
import { FieldIcon } from "@/components/field-icon";
import { sortFields } from "@/lib/filter";
import { formatUsdCompact } from "@/lib/format";
import { getAllFields, getFieldSummaries } from "@/lib/fields";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "CareerPulse — Roadmaps for 20 trending tech careers",
  description:
    "Explore 20 in-demand tech careers with 30/60/90-day roadmaps, free resources, interview prep, live jobs and salary data for Bangladesh, remote and global markets.",
  path: "/",
  absoluteTitle: true,
});
import { getChecklistIds } from "@/lib/progress";

const FEATURES = [
  {
    icon: MapIcon,
    title: "30/60/90-day roadmaps",
    text: "Step-by-step plans with milestones you can tick off as you go.",
  },
  {
    icon: BookOpen,
    title: "Free resources",
    text: "Hand-picked courses, docs and practice sites — all free to start.",
  },
  {
    icon: MessageSquareText,
    title: "Interview prep",
    text: "10 common questions per field with short, clear answers.",
  },
  {
    icon: Wallet,
    title: "Salary & demand",
    text: "Bangladesh, remote and global pay data with linked sources.",
  },
];

export default function HomePage() {
  const fields = getAllFields();
  const summaries = getFieldSummaries();
  const checklists = Object.fromEntries(
    fields.map((f) => {
      const ids = getChecklistIds(f);
      return [f.slug, [...ids.start, ...ids.roadmap, ...ids.skills]];
    }),
  );
  const trending = sortFields(summaries, "demand").slice(0, 5);
  const totals = {
    resources: fields.reduce((n, f) => n + f.resources.length, 0),
    questions: fields.reduce((n, f) => n + f.interview.length, 0),
    projects: fields.reduce((n, f) => n + f.projects.length, 0),
  };

  return (
    <>
      <section className="border-line relative overflow-hidden border-b">
        <div
          className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <p className="border-line bg-surface text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <span className="bg-good size-1.5 rounded-full" aria-hidden="true" />
              Updated for 2026 job markets
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Find your path into the <span className="text-gradient">most in-demand tech careers</span>
            </h1>
            <p className="text-muted mt-4 max-w-2xl text-base sm:text-lg">
              Clear roadmaps for 20 trending fields — from AI agents and cybersecurity to green tech — with free
              learning resources, portfolio projects, interview prep and salary data for Bangladesh, remote work and
              global markets.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#explore"
                className="bg-accent text-accent-fg shadow-card inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
              >
                Explore careers <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/compare?fields=ai-agents,cybersecurity,data-science"
                className="border-line bg-surface hover:border-accent inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition"
              >
                <GitCompareArrows className="size-4" aria-hidden="true" /> Compare fields
              </Link>
            </div>

            <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Career fields", value: fields.length },
                { label: "Free resources", value: totals.resources },
                { label: "Interview Q&As", value: totals.questions },
                { label: "Project ideas", value: totals.projects },
              ].map((s) => (
                <div key={s.label} className="border-line bg-surface rounded-xl border px-4 py-3">
                  <dt className="text-muted text-xs">{s.label}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <aside
            aria-labelledby="trending-heading"
            className="border-line bg-surface shadow-card hidden rounded-2xl border p-5 lg:block"
          >
            <div className="flex items-center justify-between">
              <h2 id="trending-heading" className="font-semibold">
                Trending now
              </h2>
              <span className="text-muted text-xs">US median pay</span>
            </div>
            <ol className="mt-4 space-y-1">
              {trending.map((f, i) => (
                <li key={f.slug}>
                  <Link
                    href={`/fields/${f.slug}`}
                    className="hover:bg-surface-2 flex items-center gap-3 rounded-xl p-2 transition"
                  >
                    <span className="text-muted w-4 text-xs font-semibold tabular-nums">{i + 1}</span>
                    <FieldIcon name={f.icon} category={f.category} size="sm" />
                    <span className="flex-1 truncate text-sm font-medium">{f.name}</span>
                    <span className="text-sm font-semibold tabular-nums">{formatUsdCompact(f.medianUsd)}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="border-line text-muted mt-4 border-t pt-3 text-xs">
              Ranked by demand, then salary. Sources: BLS 2025, WEF Future of Jobs 2025, LinkedIn Jobs on the Rise 2026.
            </p>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <FieldExplorer summaries={summaries} checklists={checklists} />

        <section className="mt-20" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-2xl font-semibold tracking-tight">
            Everything you need to start — in one place
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-line bg-surface rounded-2xl border p-5">
                <Icon className="text-accent size-5" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="text-muted mt-1 text-sm">{text}</p>
              </div>
            ))}
          </div>
          <div className="border-line bg-accent-soft mt-6 flex flex-col items-start gap-3 rounded-2xl border p-6 sm:flex-row sm:items-center">
            <ListChecks className="text-accent size-6 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm">
              <span className="font-semibold">Track your progress privately.</span> Tick off skills, roadmap goals and
              “start today” tasks — everything is saved in your browser, no account needed.
            </p>
            <Link href="/progress" className="text-accent text-sm font-semibold hover:underline">
              View my progress →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
