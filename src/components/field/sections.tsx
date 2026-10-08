import type { ReactNode } from "react";
import {
  BookOpen,
  Briefcase,
  ExternalLink,
  FileText,
  Flag,
  Globe,
  GraduationCap,
  Info,
  Laptop,
  MapPin,
  Rocket,
  Target,
  Wrench,
} from "lucide-react";
import { DemandBadge, DifficultyBadge } from "@/components/badges";
import { formatBdt, formatUsd, hostname } from "@/lib/format";
import { checklistId } from "@/lib/progress";
import type { Field, ProjectLevel, ResourceType, Source } from "@/lib/types";
import { ChecklistItem } from "./checklist-item";
import { CopyButton } from "./copy-button";

/* ---------- small shared pieces ---------- */

function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>{children}</div>;
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-sm">
      {children}
    </span>
  );
}

function ExternalA({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export function SourceList({ sources, title = "Sources" }: { sources: Source[]; title?: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {sources.map((s) => (
          <li key={s.url} className="text-sm">
            <ExternalA href={s.url} className="inline-flex items-start gap-1 text-accent hover:underline">
              <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{s.label}</span>
            </ExternalA>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Overview ---------- */

export function OverviewSection({ field }: { field: Field }) {
  const { salary } = field;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <section>
          <SectionTitle>What is {field.name}?</SectionTitle>
          <p className="leading-relaxed">{field.overview.summary}</p>
        </section>
        <section>
          <SectionTitle>Why it&apos;s trending now</SectionTitle>
          <ul className="space-y-3">
            {field.overview.whyTrending.map((reason) => (
              <li key={reason} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
          <SourceList sources={field.overview.trendSources} />
        </section>
      </div>
      <aside>
        <Card className="space-y-4">
          <h3 className="font-semibold">Quick facts</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Difficulty</dt>
              <dd>
                <DifficultyBadge value={field.difficulty} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Demand</dt>
              <dd>
                <DemandBadge value={field.demand} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Bangladesh</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatBdt(salary.bangladesh.minBdt)}–{formatBdt(salary.bangladesh.maxBdt)}
                <span className="block text-xs font-normal text-muted">per month</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Remote (from BD)</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatUsd(salary.remote.minUsd)}–{formatUsd(salary.remote.maxUsd)}
                <span className="block text-xs font-normal text-muted">per year, estimate</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Global benchmark</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatUsd(salary.global.medianUsd)}
                <span className="block text-xs font-normal text-muted">median per year</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Job roles</dt>
              <dd className="font-medium">{field.roles.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Top languages</dt>
              <dd className="text-right font-medium">{field.stack.languages.slice(0, 3).join(", ")}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted">See the Salary &amp; demand tab for sources and notes.</p>
        </Card>
      </aside>
    </div>
  );
}

/* ---------- Roles ---------- */

export function RolesSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="Common job titles you'll see in listings, and what each one actually does.">
        Job roles
      </SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {field.roles.map((role) => (
          <Card key={role.title}>
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-accent" aria-hidden="true" />
              <h3 className="font-semibold">{role.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{role.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------- Skills ---------- */

const SKILL_LEVELS = [
  { key: "beginner", label: "Beginner", hint: "Start here" },
  { key: "intermediate", label: "Intermediate", hint: "Job-ready core" },
  { key: "advanced", label: "Advanced", hint: "Stand out" },
] as const;

export function SkillsSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="Tick skills as you learn them — your progress is saved in this browser.">
        Skills from beginner to advanced
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-3">
        {SKILL_LEVELS.map((level, i) => (
          <Card key={level.key}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">
                <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
                  {i + 1}
                </span>
                {level.label}
              </h3>
              <span className="text-xs text-muted">{level.hint}</span>
            </div>
            <ul className="-mx-2 space-y-0.5">
              {field.skills[level.key].map((skill) => (
                <ChecklistItem key={skill} id={checklistId(field.slug, "skills", skill)} label={skill} />
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------- Stack ---------- */

export function StackSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="What employers mention most often in current job listings for this field.">
        Most-requested languages &amp; tools
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="flex items-center gap-2 font-semibold">
            <FileText className="size-4 text-accent" aria-hidden="true" /> Languages
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {field.stack.languages.map((l) => (
              <Chip key={l}>{l}</Chip>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 font-semibold">
            <Wrench className="size-4 text-accent" aria-hidden="true" /> Tools &amp; platforms
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {field.stack.tools.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-4 flex gap-3 rounded-2xl border border-line bg-accent-soft p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        <p>{field.stack.note}</p>
      </div>
    </section>
  );
}

/* ---------- Roadmap ---------- */

export function RoadmapSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="About 1–2 hours a day. Tick goals as you complete them.">30/60/90-day roadmap</SectionTitle>
      <ol className="relative space-y-6 border-l-2 border-line pl-6 sm:pl-8">
        {field.roadmap.map((phase, i) => (
          <li key={phase.range} className="relative">
            <span
              className="absolute -left-[2.1rem] top-1 inline-flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-fg sm:-left-[2.6rem]"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{phase.range}</p>
              <h3 className="mt-1 text-lg font-semibold">{phase.title}</h3>
              <ul className="-mx-2 mt-3 space-y-0.5">
                {phase.goals.map((goal) => (
                  <ChecklistItem key={goal} id={checklistId(field.slug, "roadmap", goal)} label={goal} />
                ))}
              </ul>
              <div className="mt-4 flex gap-2 rounded-xl bg-surface-2 p-3 text-sm">
                <Flag className="mt-0.5 size-4 shrink-0 text-good" aria-hidden="true" />
                <p>
                  <span className="font-semibold">Milestone: </span>
                  {phase.milestone}
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Resources ---------- */

const RESOURCE_LABEL: Record<ResourceType, string> = {
  course: "Course",
  docs: "Docs",
  book: "Book",
  video: "Video",
  practice: "Practice",
  guide: "Guide",
};

export function ResourcesSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="All free to start. Some courses offer paid certificates — auditing is free.">
        Free learning resources
      </SectionTitle>
      <ul className="grid gap-3 md:grid-cols-2">
        {field.resources.map((r) => (
          <li key={r.url}>
            <ExternalA
              href={r.url}
              className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                {r.type === "course" ? (
                  <GraduationCap className="size-4" aria-hidden="true" />
                ) : (
                  <BookOpen className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-medium group-hover:text-accent">{r.title}</span>
                  <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {r.provider} · {RESOURCE_LABEL[r.type]} · {hostname(r.url)}
                </span>
                {r.note && (
                  <span className="mt-2 inline-block rounded-full bg-good-soft px-2 py-0.5 text-xs font-medium text-good">
                    {r.note}
                  </span>
                )}
              </span>
            </ExternalA>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Projects ---------- */

const LEVEL_STYLE: Record<ProjectLevel, string> = {
  easy: "bg-good-soft text-good",
  medium: "bg-accent-soft text-accent",
  hard: "bg-warn-soft text-warn",
};

export function ProjectsSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="Build these in order. Put each one on GitHub with a clear README and a short demo.">
        Portfolio project ideas
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {field.projects.map((p, i) => (
          <Card key={p.title} className={i === field.projects.length - 1 ? "md:col-span-2" : ""}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">
                <Rocket className="mr-1.5 inline size-4 text-accent" aria-hidden="true" />
                {p.title}
              </h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${LEVEL_STYLE[p.level]}`}>
                {p.level}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <span key={s} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs">
                  {s}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------- Interview ---------- */

export function InterviewSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="Try answering out loud first, then open the short model answer.">
        10 interview questions
      </SectionTitle>
      <div className="space-y-2">
        {field.interview.map((q, i) => (
          <details key={q.question} className="group rounded-2xl border border-line bg-surface open:border-accent/50">
            <summary className="flex cursor-pointer list-none items-start gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
                {i + 1}
              </span>
              <span className="flex-1">{q.question}</span>
              <span className="text-muted transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="px-4 pb-4 pl-13 text-sm leading-relaxed text-muted">{q.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------- Resume ---------- */

export function ResumeSection({ field }: { field: Field }) {
  return (
    <section>
      <SectionTitle subtitle="Replace the [brackets] with your real numbers. Quantified results stand out to recruiters.">
        Resume bullet templates
      </SectionTitle>
      <ul className="space-y-3">
        {field.resumeBullets.map((b) => (
          <li key={b} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
            <Target className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="flex-1 text-sm leading-relaxed">{b}</p>
            <CopyButton text={b} label="Copy resume bullet" />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-3 rounded-2xl border border-line bg-surface-2 p-4 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Formula: <span className="font-medium text-fg">action verb + what you built + tools + measurable result</span>.
          Only claim numbers you can explain in an interview.
        </p>
      </div>
    </section>
  );
}

/* ---------- Salary ---------- */

export function SalarySection({ field }: { field: Field }) {
  const { bangladesh, remote, global, demandNotes } = field.salary;
  const cards = [
    {
      icon: MapPin,
      title: "Bangladesh",
      value: `${formatBdt(bangladesh.minBdt)} – ${formatBdt(bangladesh.maxBdt)}`,
      unit: "gross per month",
      note: bangladesh.note,
      demand: demandNotes.bangladesh,
      sources: bangladesh.sources,
    },
    {
      icon: Laptop,
      title: "Remote (from Bangladesh)",
      value: `${formatUsd(remote.minUsd)} – ${formatUsd(remote.maxUsd)}`,
      unit: "per year",
      note: remote.note,
      demand: demandNotes.remote,
      sources: remote.sources,
    },
    {
      icon: Globe,
      title: "Global benchmark",
      value: formatUsd(global.medianUsd),
      unit: global.benchmark,
      note: `${global.note} Projected growth: ${global.growth}.`,
      demand: demandNotes.global,
      sources: global.sources,
    },
  ];

  return (
    <section>
      <SectionTitle subtitle="Ranges vary by company, city, experience and negotiation. Always check the linked sources for the latest figures.">
        Salary &amp; demand
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map(({ icon: Icon, ...c }) => (
          <Card key={c.title} className="flex flex-col">
            <h3 className="flex items-center gap-2 font-semibold">
              <Icon className="size-4 text-accent" aria-hidden="true" /> {c.title}
            </h3>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">{c.value}</p>
            <p className="text-xs text-muted">{c.unit}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{c.note}</p>
            <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Demand</p>
              <p className="mt-1 leading-relaxed">{c.demand}</p>
            </div>
            <div className="mt-auto">
              <SourceList sources={c.sources} />
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex gap-3 rounded-2xl border border-line bg-warn-soft p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden="true" />
        <p>
          <span className="font-semibold">How to read these numbers:</span> Bangladesh ranges are Paylab&apos;s
          10th–90th percentile gross monthly salaries (top product companies often pay more). Remote ranges are
          CareerPulse estimates informed by Arc&apos;s Bangladesh remote-developer data. Global figures are US medians
          from the Bureau of Labor Statistics (May 2025 data, 2025–35 projections) unless stated otherwise.
        </p>
      </div>
    </section>
  );
}

/* ---------- Start today ---------- */

export function StartTodaySection({ field }: { field: Field }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <SectionTitle subtitle="Small, concrete actions you can finish today. Momentum beats perfect plans.">
          Start today checklist
        </SectionTitle>
        <Card>
          <ul className="-mx-2 space-y-0.5">
            {field.startToday.map((item) => (
              <ChecklistItem key={item} id={checklistId(field.slug, "start", item)} label={item} />
            ))}
          </ul>
        </Card>
      </div>
      <aside>
        <Card className="bg-accent-soft">
          <h3 className="font-semibold">Your first week plan</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Finish this checklist.</li>
            <li>Start the first resource in the Free resources tab.</li>
            <li>Begin the Days 1–30 goals in the roadmap.</li>
            <li>Create a GitHub repo for project #1 and push something small.</li>
            <li>Share what you learned on LinkedIn — it builds your public portfolio.</li>
          </ol>
        </Card>
      </aside>
    </section>
  );
}
