export type JobSource = "remotive" | "adzuna";

/** A job posting normalised from any provider. */
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  /** ISO 8601 timestamp, or null when the provider doesn't give one. */
  postedAt: string | null;
  /** Link to the original posting (required by both providers' terms). */
  url: string;
  source: JobSource;
}

/**
 * - ok: the last refresh succeeded.
 * - stale: the last refresh failed, so `jobs` are from the last successful run.
 * - error: refreshes have failed and there is no earlier good data.
 * - not-configured: the provider's credentials are missing.
 * - pending: never refreshed yet.
 */
export type ResultStatus = "ok" | "stale" | "error" | "not-configured" | "pending";

export interface SourceResult {
  jobs: Job[];
  status: ResultStatus;
  /** When these jobs were successfully fetched (null if never). */
  fetchedAt: string | null;
  /** When a refresh was last attempted, successful or not. */
  attemptedAt: string | null;
  /** Short, non-sensitive description of the last failure. */
  error?: string;
}

export interface FieldJobs {
  remote: SourceResult;
  global: SourceResult;
}

export interface JobsSnapshot {
  version: 1;
  /** When the snapshot was last written by the refresh job. */
  updatedAt: string;
  fields: Record<string, FieldJobs>;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
