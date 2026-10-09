import { JOB_KEYWORDS, type FieldSlug } from "@/data/job-keywords";
import {
  adzunaCountriesFromEnv,
  adzunaCredentialsFromEnv,
  fetchAdzunaJobs,
  type AdzunaCountry,
  type AdzunaCredentials,
} from "./adzuna";
import { sleep } from "./http";
import { fetchRemotiveFeed, remotiveJobsForField, type RemotiveJob } from "./remotive";
import type { JobStore } from "./store";
import type { FetchLike, FieldJobs, Job, JobsSnapshot, SourceResult } from "./types";

/** Max jobs kept per field and source. */
export const JOBS_PER_SOURCE = 10;

/** Spacing between Adzuna calls: 2.6s keeps us under the 25 requests/minute limit. */
export const ADZUNA_DELAY_MS = 2_600;

export interface RefreshOptions {
  store: JobStore;
  slugs: FieldSlug[];
  fetchImpl?: FetchLike;
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
  adzunaDelayMs?: number;
}

export interface RefreshSummary {
  updatedAt: string;
  store: JobStore["kind"];
  remotive: { status: "ok" | "error"; jobsInFeed: number; error?: string };
  adzuna: { status: "ok" | "partial" | "error" | "not-configured"; requests: number; failures: number };
  fields: Record<string, { remote: number; global: number }>;
}

export function okResult(jobs: Job[], at: string): SourceResult {
  return { jobs, status: "ok", fetchedAt: at, attemptedAt: at };
}

export function failedResult(error: string, at: string): SourceResult {
  return { jobs: [], status: "error", fetchedAt: null, attemptedAt: at, error };
}

export function notConfiguredResult(at: string): SourceResult {
  return { jobs: [], status: "not-configured", fetchedAt: null, attemptedAt: at };
}

function byNewest(a: Job, b: Job) {
  return (b.postedAt ?? "").localeCompare(a.postedAt ?? "");
}

/** Removes duplicates (same title + company) that appear in several countries. */
function dedupe(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchGlobalForField(
  query: string,
  countries: AdzunaCountry[],
  credentials: AdzunaCredentials,
  fetchImpl: FetchLike | undefined,
  pause: () => Promise<void>,
  counters: { requests: number; failures: number },
): Promise<{ jobs: Job[]; errors: string[] }> {
  const jobs: Job[] = [];
  const errors: string[] = [];
  for (const country of countries) {
    if (counters.requests > 0) await pause();
    counters.requests++;
    try {
      jobs.push(...(await fetchAdzunaJobs({ country, query, credentials, fetchImpl })));
    } catch (err) {
      counters.failures++;
      errors.push(err instanceof Error ? err.message : "Adzuna: unknown error");
    }
  }
  return { jobs: dedupe(jobs).sort(byNewest).slice(0, JOBS_PER_SOURCE), errors };
}

/**
 * Fetches jobs for every field and writes one snapshot to the store.
 * Remotive: one request for the whole feed. Adzuna: one request per field per country.
 */
export async function refreshAllJobs(
  options: RefreshOptions,
): Promise<{ snapshot: JobsSnapshot; summary: RefreshSummary }> {
  const { store, slugs, fetchImpl, env = process.env, now = () => new Date() } = options;
  const delay = options.adzunaDelayMs ?? ADZUNA_DELAY_MS;
  const at = now().toISOString();

  let feed: RemotiveJob[] | null = null;
  let remotiveError: string | undefined;
  try {
    feed = await fetchRemotiveFeed(fetchImpl);
  } catch (err) {
    remotiveError = err instanceof Error ? err.message : "Remotive: unknown error";
  }

  const credentials = adzunaCredentialsFromEnv(env);
  const countries = adzunaCountriesFromEnv(env.ADZUNA_COUNTRIES);
  const counters = { requests: 0, failures: 0 };
  const pause = () => sleep(delay);

  const fields: Record<string, FieldJobs> = {};
  const counts: RefreshSummary["fields"] = {};

  for (const slug of slugs) {
    const keywords = JOB_KEYWORDS[slug];
    const remote = feed
      ? okResult(remotiveJobsForField(feed, keywords.keywords, JOBS_PER_SOURCE), at)
      : failedResult(remotiveError ?? "Remotive: unknown error", at);

    let global: SourceResult;
    if (!credentials) {
      global = notConfiguredResult(at);
    } else {
      const { jobs, errors } = await fetchGlobalForField(
        keywords.adzunaQuery,
        countries,
        credentials,
        fetchImpl,
        pause,
        counters,
      );
      // Succeed if at least one country answered; fail only if every country failed.
      global = errors.length === countries.length ? failedResult(errors.join("; "), at) : okResult(jobs, at);
    }

    fields[slug] = { remote, global };
    counts[slug] = { remote: remote.jobs.length, global: global.jobs.length };
  }

  const snapshot: JobsSnapshot = { version: 1, updatedAt: at, fields };
  await store.write(snapshot);

  const adzunaStatus: RefreshSummary["adzuna"]["status"] = !credentials
    ? "not-configured"
    : counters.failures === 0
      ? "ok"
      : counters.failures === counters.requests
        ? "error"
        : "partial";

  return {
    snapshot,
    summary: {
      updatedAt: at,
      store: store.kind,
      remotive: feed
        ? { status: "ok", jobsInFeed: feed.length }
        : { status: "error", jobsInFeed: 0, error: remotiveError },
      adzuna: { status: adzunaStatus, requests: counters.requests, failures: counters.failures },
      fields: counts,
    },
  };
}
