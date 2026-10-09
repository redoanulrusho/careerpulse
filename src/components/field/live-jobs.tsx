import { AlertTriangle, Building2, CalendarDays, Clock, ExternalLink, Globe, Laptop, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { getLiveJobsSnapshot } from "@/lib/jobs/read";
import { formatJobDate, formatUpdatedAt } from "@/lib/jobs/format";
import type { Job, SourceResult } from "@/lib/jobs/types";
import type { Field } from "@/lib/types";

const PENDING: SourceResult = { jobs: [], status: "pending", fetchedAt: null, attemptedAt: null };

function StatusNote({ tone, children }: { tone: "info" | "warn"; children: ReactNode }) {
  return (
    <div
      className={`flex gap-2 rounded-xl p-3 text-sm ${tone === "warn" ? "bg-warn-soft text-fg" : "bg-surface-2 text-muted"}`}
      role={tone === "warn" ? "status" : undefined}
    >
      {tone === "warn" && <AlertTriangle className="text-warn mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      <p>{children}</p>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const posted = formatJobDate(job.postedAt);
  return (
    <li className="border-line bg-surface hover:border-accent rounded-xl border p-4 transition">
      <div className="flex items-start justify-between gap-3">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent leading-snug font-medium"
        >
          {job.title}
          <ExternalLink className="text-muted ml-1 inline size-3.5 align-baseline" aria-hidden="true" />
          <span className="sr-only"> (opens the original posting)</span>
        </a>
        {job.source === "adzuna" ? (
          // Adzuna's terms: label each advert "Adzuna" (min. 116×23px), linked to Adzuna.
          <a
            href="https://www.adzuna.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border-line text-muted hover:text-fg inline-flex min-h-[23px] min-w-[116px] shrink-0 items-center justify-center rounded-md border px-2 text-xs font-semibold"
          >
            Jobs by Adzuna
          </a>
        ) : (
          <span className="text-muted shrink-0 text-xs">via Remotive</span>
        )}
      </div>
      <dl className="text-muted mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <div className="flex items-center gap-1">
          <dt className="sr-only">Company</dt>
          <Building2 className="size-3.5" aria-hidden="true" />
          <dd>{job.company}</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="sr-only">Location</dt>
          <MapPin className="size-3.5" aria-hidden="true" />
          <dd>{job.location}</dd>
        </div>
        {posted && (
          <div className="flex items-center gap-1">
            <dt className="sr-only">Posted</dt>
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <dd>
              <time dateTime={job.postedAt ?? undefined}>{posted}</time>
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}

function SourceColumn({
  title,
  icon,
  result,
  attribution,
  notConfigured,
  emptyHint,
}: {
  title: string;
  icon: ReactNode;
  result: SourceResult;
  attribution: ReactNode;
  notConfigured: string;
  emptyHint: string;
}) {
  const lastGood = formatUpdatedAt(result.fetchedAt);
  const lastTry = formatUpdatedAt(result.attemptedAt);
  return (
    <section className="min-w-0">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          {icon}
          {title}
          {result.jobs.length > 0 && <span className="text-muted text-sm font-normal">({result.jobs.length})</span>}
        </h3>
        <p className="text-muted text-xs">{attribution}</p>
      </div>
      <div className="space-y-3">
        {result.status === "pending" && (
          <StatusNote tone="info">Jobs are refreshed once a day. The first refresh hasn&apos;t run yet.</StatusNote>
        )}
        {result.status === "not-configured" && <StatusNote tone="info">{notConfigured}</StatusNote>}
        {result.status === "error" && (
          <StatusNote tone="warn">
            We couldn&apos;t load these jobs{lastTry ? ` on ${lastTry}` : ""}. We&apos;ll try again in the next daily
            refresh.
          </StatusNote>
        )}
        {result.status === "stale" && (
          <StatusNote tone="warn">
            The latest refresh{lastTry ? ` (${lastTry})` : ""} failed, so these are the last good results
            {lastGood ? ` from ${lastGood}` : ""}.
          </StatusNote>
        )}
        {(result.status === "ok" || result.status === "stale") && result.jobs.length === 0 && (
          <StatusNote tone="info">{emptyHint}</StatusNote>
        )}
        {result.jobs.length > 0 && (
          <ul className="space-y-3">
            {result.jobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export async function LiveJobsSection({ field }: { field: Field }) {
  const snapshot = await getLiveJobsSnapshot();
  const jobs = snapshot?.fields[field.slug];
  const updated = formatUpdatedAt(snapshot?.updatedAt ?? null);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Live jobs</h2>
          <p className="text-muted mt-1 text-sm">
            Recent openings matching {field.name}, refreshed once a day. Click a job to apply on the original site.
          </p>
        </div>
        <p className="text-muted inline-flex items-center gap-1.5 text-sm">
          <Clock className="size-4" aria-hidden="true" />
          {updated ? (
            <>
              Last updated <time dateTime={snapshot?.updatedAt}>{updated}</time>
            </>
          ) : (
            "Not updated yet"
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SourceColumn
          title="Remote jobs"
          icon={<Laptop className="text-accent size-4" aria-hidden="true" />}
          result={jobs?.remote ?? PENDING}
          attribution={
            <>
              Source:{" "}
              <a
                className="text-accent hover:underline"
                href="https://remotive.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Remotive
              </a>{" "}
              (listed 24h after posting)
            </>
          }
          notConfigured="Remote jobs aren't available right now."
          emptyHint="No matching remote jobs in today's feed. Remotive's free feed is small, so check back tomorrow."
        />
        <SourceColumn
          title="Global jobs"
          icon={<Globe className="text-accent size-4" aria-hidden="true" />}
          result={jobs?.global ?? PENDING}
          attribution={
            <>
              Source:{" "}
              <a
                className="text-accent hover:underline"
                href="https://www.adzuna.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Adzuna
              </a>
            </>
          }
          notConfigured="Global job listings are switched off on this site because Adzuna API keys haven't been added."
          emptyHint="No matching jobs were posted in the last 30 days. Check back tomorrow."
        />
      </div>
    </section>
  );
}

export function LiveJobsFallback() {
  return (
    <div aria-label="Loading live jobs" className="grid gap-6 lg:grid-cols-2">
      <div className="bg-surface-2 h-64 animate-pulse rounded-2xl" />
      <div className="bg-surface-2 h-64 animate-pulse rounded-2xl" />
    </div>
  );
}
