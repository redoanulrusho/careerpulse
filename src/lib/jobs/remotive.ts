import { fetchJson, JobFetchError } from "./http";
import { buildKeywordMatcher } from "./match";
import type { FetchLike, Job } from "./types";

/*
 * Remotive public API — https://remotive.com/api-documentation
 * Terms (from the API's own legal notice): link back to the Remotive job URL,
 * mention Remotive as the source, don't request more than a few times a day
 * (max ~4/day; more than 2/minute is blocked), and don't gate listings behind
 * sign-ups. Jobs are delayed by 24 hours.
 *
 * The public feed currently returns one recent set of jobs regardless of
 * search/category parameters, so we fetch it ONCE per refresh and filter it
 * locally for every field. That keeps us at 1 request per day.
 */

export const REMOTIVE_URL = "https://remotive.com/api/remote-jobs";

/** A Remotive job plus the extra fields we match keywords against. */
export interface RemotiveJob extends Job {
  tags: string[];
  category: string;
}

interface RawRemotiveJob {
  id?: number | string;
  url?: string;
  title?: string;
  company_name?: string;
  category?: string;
  tags?: unknown;
  publication_date?: string;
  candidate_required_location?: string;
}

/** Remotive dates have no timezone ("2026-10-07T01:11:09"); they are UTC. */
function toIsoUtc(value: string | undefined): string | null {
  if (!value) return null;
  const withZone = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizeRemotiveJob(raw: RawRemotiveJob): RemotiveJob | null {
  if (!raw.id || !raw.title || !raw.url || !/^https:\/\//.test(raw.url)) return null;
  return {
    id: `remotive-${raw.id}`,
    title: raw.title.trim(),
    company: raw.company_name?.trim() || "Unknown company",
    location: raw.candidate_required_location?.trim() || "Remote",
    postedAt: toIsoUtc(raw.publication_date),
    url: raw.url,
    source: "remotive",
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : [],
    category: raw.category ?? "",
  };
}

/** Fetches the whole public Remotive feed (one request). Throws JobFetchError on failure. */
export async function fetchRemotiveFeed(fetchImpl?: FetchLike): Promise<RemotiveJob[]> {
  const data = await fetchJson(REMOTIVE_URL, { fetchImpl, label: "Remotive" });
  const jobs = (data as { jobs?: unknown })?.jobs;
  if (!Array.isArray(jobs)) throw new JobFetchError("Remotive: unexpected response shape");
  return jobs.map((j) => normalizeRemotiveJob(j as RawRemotiveJob)).filter((j): j is RemotiveJob => j !== null);
}

/** Picks the jobs relevant to one field by matching its keywords against title and tags. */
export function remotiveJobsForField(feed: RemotiveJob[], keywords: string[], limit = 10): Job[] {
  const matches = buildKeywordMatcher(keywords);
  return feed
    .filter((job) => matches(job.title) || job.tags.some((tag) => matches(tag)))
    .sort((a, b) => (b.postedAt ?? "").localeCompare(a.postedAt ?? ""))
    .slice(0, limit)
    .map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      postedAt: job.postedAt,
      url: job.url,
      source: job.source,
    }));
}
