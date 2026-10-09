import { fetchJson, JobFetchError } from "./http";
import type { Env, FetchLike, Job } from "./types";

/*
 * Adzuna Jobs API — https://developer.adzuna.com/docs/search
 * Terms: each displayed advert must carry an "Adzuna" label linking to Adzuna,
 * results must link to the original posting (redirect_url). Default free limits:
 * 25 requests/minute, 250/day, 1,000/week, 2,500/month. Commercial use beyond a
 * 14-day trial needs a licence from Adzuna.
 */

export const ADZUNA_COUNTRIES = [
  "at",
  "au",
  "be",
  "br",
  "ca",
  "ch",
  "de",
  "es",
  "fr",
  "gb",
  "in",
  "it",
  "mx",
  "nl",
  "nz",
  "pl",
  "sg",
  "us",
  "za",
] as const;

export type AdzunaCountry = (typeof ADZUNA_COUNTRIES)[number];

export interface AdzunaCredentials {
  appId: string;
  appKey: string;
}

/** Reads credentials from the environment; returns null when either is missing. */
export function adzunaCredentialsFromEnv(env: Env = process.env): AdzunaCredentials | null {
  const appId = env.ADZUNA_APP_ID?.trim();
  const appKey = env.ADZUNA_APP_KEY?.trim();
  // Treat the .env.example placeholders as "not configured".
  const isPlaceholder = (v: string) => v.startsWith("your-");
  return appId && appKey && !isPlaceholder(appId) && !isPlaceholder(appKey) ? { appId, appKey } : null;
}

/** Parses ADZUNA_COUNTRIES (e.g. "gb,us"), keeping only supported codes. Defaults to gb + us. */
export function adzunaCountriesFromEnv(value: string | undefined): AdzunaCountry[] {
  const supported = new Set<string>(ADZUNA_COUNTRIES);
  const parsed = (value ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter((c): c is AdzunaCountry => supported.has(c));
  const unique = [...new Set(parsed)];
  return unique.length ? unique : ["gb", "us"];
}

export function buildAdzunaUrl({
  country,
  query,
  credentials,
  resultsPerPage = 10,
  maxDaysOld = 30,
}: {
  country: AdzunaCountry;
  query: string;
  credentials: AdzunaCredentials;
  resultsPerPage?: number;
  maxDaysOld?: number;
}): string {
  const params = new URLSearchParams({
    app_id: credentials.appId,
    app_key: credentials.appKey,
    title_only: query,
    results_per_page: String(resultsPerPage),
    max_days_old: String(maxDaysOld),
    sort_by: "date",
    "content-type": "application/json",
  });
  return `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
}

interface RawAdzunaJob {
  id?: string | number;
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  created?: string;
  redirect_url?: string;
}

/** Adzuna sometimes wraps matched words in <strong>; strip tags and decode basic entities. */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAdzunaJob(raw: RawAdzunaJob, country: AdzunaCountry): Job | null {
  if (!raw.id || !raw.title || !raw.redirect_url || !/^https:\/\//.test(raw.redirect_url)) return null;
  const created = raw.created ? new Date(raw.created) : null;
  return {
    id: `adzuna-${country}-${raw.id}`,
    title: cleanText(raw.title),
    company: cleanText(raw.company?.display_name ?? "") || "Unknown company",
    location: cleanText(raw.location?.display_name ?? "") || country.toUpperCase(),
    postedAt: created && !Number.isNaN(created.getTime()) ? created.toISOString() : null,
    url: raw.redirect_url,
    source: "adzuna",
  };
}

/** One Adzuna search. Throws JobFetchError on failure; the error never contains the API key. */
export async function fetchAdzunaJobs({
  country,
  query,
  credentials,
  fetchImpl,
}: {
  country: AdzunaCountry;
  query: string;
  credentials: AdzunaCredentials;
  fetchImpl?: FetchLike;
}): Promise<Job[]> {
  const data = await fetchJson(buildAdzunaUrl({ country, query, credentials }), {
    fetchImpl,
    label: `Adzuna (${country.toUpperCase()})`,
  });
  const results = (data as { results?: unknown })?.results;
  if (!Array.isArray(results)) throw new JobFetchError(`Adzuna (${country.toUpperCase()}): unexpected response shape`);
  return results.map((r) => normalizeAdzunaJob(r as RawAdzunaJob, country)).filter((j): j is Job => j !== null);
}
