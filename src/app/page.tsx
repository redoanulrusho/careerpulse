import Link from "next/link";
import { ArrowRight, BookOpen, GitCompareArrows, ListChecks, Map as MapIcon, MessageSquareText, Wallet } from "lucide-react";
import { FieldExplorer } from "@/components/field-explorer";
import { getAllFields, getFieldSummaries } from "@/lib/fields";
import { getChecklistIds } from "@/lib/progress";

const FEATURES = [
  { icon: MapIcon, title: "30/60/90-day roadmaps", text: "Step-by-step plans with milestones you can tick off as you go." },
  { icon: BookOpen, title: "Free resources", text: "Hand-picked courses, docs and practice sites — all free to start." },
  { icon: MessageSquareText, title: "Interview prep", text: "10 common questions per field with short, clear answers." },
  { icon: Wallet, title: "Salary & demand", text: "Bangladesh, remote and global pay data with linked sources." },
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
  const totals = {
    resources: fields.reduce((n, f) => n + f.resources.length, 0),
    questions: fields.reduce((n, f) => n + f.interview.length, 0),
    projects: fields.reduce((n, f) => n + f.projects.length, 0),
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-good" aria-hidden="true" />
            Updated for 2026 job markets
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Find your path into the <span className="text-gradient">most in-demand tech careers</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Clear roadmaps for 20 trending fields — from AI agents and cybersecurity to green tech — with free learning
            resources, portfolio projects, interview prep and salary data for Bangladesh, remote work and global markets.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#explore"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-fg shadow-card transition hover:opacity-90"
            >
              Explore careers <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/compare?fields=ai-agents,cybersecurity,data-science"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold transition hover:border-accent"
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
              <div key={s.label} className="rounded-xl border border-line bg-surface px-4 py-3">
                <dt className="text-xs text-muted">{s.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
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
              <div key={title} className="rounded-2xl border border-line bg-surface p-5">
                <Icon className="size-5 text-accent" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-line bg-accent-soft p-6 sm:flex-row sm:items-center">
            <ListChecks className="size-6 shrink-0 text-accent" aria-hidden="true" />
            <p className="flex-1 text-sm">
              <span className="font-semibold">Track your progress privately.</span> Tick off skills, roadmap goals and
              “start today” tasks — everything is saved in your browser, no account needed.
            </p>
            <Link href="/progress" className="text-sm font-semibold text-accent hover:underline">
              View my progress →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
