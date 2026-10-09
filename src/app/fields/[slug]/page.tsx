import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { CategoryBadge, DemandBadge, DifficultyBadge } from "@/components/badges";
import { FieldIcon } from "@/components/field-icon";
import { FieldProgress } from "@/components/field/field-progress";
import { FieldTabs, type TabPanel } from "@/components/field/field-tabs";
import { LiveJobsFallback, LiveJobsSection } from "@/components/field/live-jobs";
import {
  InterviewSection,
  OverviewSection,
  ProjectsSection,
  ResourcesSection,
  ResumeSection,
  RoadmapSection,
  RolesSection,
  SalarySection,
  SkillsSection,
  StackSection,
  StartTodaySection,
} from "@/components/field/sections";
import { TAB_LABEL, type TabId } from "@/lib/constants";
import { getAllFields, getAllSlugs, getField } from "@/lib/fields";
import { getChecklistIds } from "@/lib/progress";
import type { Field } from "@/lib/types";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/fields/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const field = getField(slug);
  if (!field) return {};
  return {
    title: `${field.name} career roadmap`,
    description: `${field.tagline} Roadmap, skills, free resources, projects, interview questions and salary data.`,
  };
}

const SECTIONS: Record<TabId, (props: { field: Field }) => ReactNode> = {
  overview: OverviewSection,
  roles: RolesSection,
  skills: SkillsSection,
  stack: StackSection,
  roadmap: RoadmapSection,
  resources: ResourcesSection,
  projects: ProjectsSection,
  interview: InterviewSection,
  resume: ResumeSection,
  salary: SalarySection,
  jobs: ({ field }) => (
    <Suspense fallback={<LiveJobsFallback />}>
      <LiveJobsSection field={field} />
    </Suspense>
  ),
  start: StartTodaySection,
};

export default async function FieldPage({ params }: PageProps<"/fields/[slug]">) {
  const { slug } = await params;
  const field = getField(slug);
  if (!field) notFound();

  const all = getAllFields();
  const index = all.findIndex((f) => f.slug === field.slug);
  const prev = all[(index - 1 + all.length) % all.length];
  const next = all[(index + 1) % all.length];

  const ids = getChecklistIds(field);
  const panels: TabPanel[] = (Object.keys(SECTIONS) as TabId[]).map((id) => {
    const Section = SECTIONS[id];
    return { id, label: TAB_LABEL[id], content: <Section field={field} /> };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-muted pt-6 text-sm">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-fg">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href="/#explore" className="hover:text-fg">
              Careers
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="text-fg truncate">
            {field.name}
          </li>
        </ol>
      </nav>

      <header className="grid gap-6 py-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div>
          <div className="flex items-center gap-4">
            <FieldIcon name={field.icon} category={field.category} size="lg" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{field.name}</h1>
            </div>
          </div>
          <p className="text-muted mt-4 max-w-2xl text-lg">{field.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CategoryBadge value={field.category} />
            <DifficultyBadge value={field.difficulty} />
            <DemandBadge value={field.demand} />
          </div>
        </div>
        <FieldProgress slug={field.slug} name={field.name} ids={[...ids.start, ...ids.roadmap, ...ids.skills]} />
      </header>

      <FieldTabs panels={panels} />

      <nav
        aria-label="More careers"
        className="border-line mt-14 grid gap-3 border-t pt-6 sm:grid-cols-2"
        data-print-hide
      >
        <Link
          href={`/fields/${prev.slug}`}
          className="group border-line bg-surface hover:border-accent flex items-center gap-3 rounded-2xl border p-4 transition"
        >
          <ArrowLeft className="text-muted group-hover:text-accent size-4" aria-hidden="true" />
          <span>
            <span className="text-muted block text-xs">Previous field</span>
            <span className="font-medium">{prev.name}</span>
          </span>
        </Link>
        <Link
          href={`/fields/${next.slug}`}
          className="group border-line bg-surface hover:border-accent flex items-center justify-end gap-3 rounded-2xl border p-4 text-right transition"
        >
          <span>
            <span className="text-muted block text-xs">Next field</span>
            <span className="font-medium">{next.name}</span>
          </span>
          <ArrowRight className="text-muted group-hover:text-accent size-4" aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}
