import { describe, expect, it, vi } from "vitest";
import { FIELD_SLUGS } from "@/data/fields/slugs";
import { bdjobsSearchUrl, JOB_KEYWORDS } from "@/data/job-keywords";
import {
  adzunaCountriesFromEnv,
  adzunaCredentialsFromEnv,
  buildAdzunaUrl,
  fetchAdzunaJobs,
  normalizeAdzunaJob,
} from "@/lib/jobs/adzuna";
import { isAuthorizedCronRequest } from "@/lib/jobs/auth";
import { formatJobDate, formatUpdatedAt } from "@/lib/jobs/format";
import { JobFetchError } from "@/lib/jobs/http";
import { buildKeywordMatcher } from "@/lib/jobs/match";
import { refreshAllJobs, mergeSourceResult } from "@/lib/jobs/refresh";
import { fetchRemotiveFeed, normalizeRemotiveJob, remotiveJobsForField, REMOTIVE_URL } from "@/lib/jobs/remotive";
import { createMemoryStore, createRedisStore, parseSnapshot } from "@/lib/jobs/store";
import type { FetchLike, JobsSnapshot, SourceResult } from "@/lib/jobs/types";

/* ---------- fixtures & helpers ---------- */

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const remotiveJob = (id: number, title: string, extra: Record<string, unknown> = {}) => ({
  id,
  url: `https://remotive.com/remote-jobs/software-dev/job-${id}`,
  title,
  company_name: "Acme",
  category: "Software Development",
  tags: [],
  publication_date: `2026-10-0${(id % 8) + 1}T10:00:00`,
  candidate_required_location: "Worldwide",
  ...extra,
});

const REMOTIVE_FEED = {
  "job-count": 4,
  jobs: [
    remotiveJob(1, "Senior AI Engineer"),
    remotiveJob(2, "Senior Data Scientist", { tags: ["python", "kubernetes", "solidity"] }),
    remotiveJob(3, "Frontend Developer (React)"),
    remotiveJob(4, "Freelance Writer", { tags: ["data science", "LLM"] }),
  ],
};

const adzunaJob = (id: number, title: string, created = "2026-10-08T09:00:00Z") => ({
  id: String(id),
  title,
  company: { display_name: "Globex" },
  location: { display_name: "London, UK" },
  created,
  redirect_url: `https://www.adzuna.co.uk/jobs/land/ad/${id}`,
});

const CREDS_ENV = { ADZUNA_APP_ID: "test-id", ADZUNA_APP_KEY: "secret-key-123", ADZUNA_COUNTRIES: "gb,us" };
const NOW = () => new Date("2026-10-09T06:00:00Z");

/** Routes mock requests by URL: Remotive feed vs Adzuna search per country. */
function mockFetch({
  remotive = () => json(REMOTIVE_FEED),
  adzuna = (country: string) => json({ results: [adzunaJob(country === "gb" ? 10 : 20, `AI Engineer ${country}`)] }),
}: {
  remotive?: () => Response | Promise<Response>;
  adzuna?: (country: string) => Response | Promise<Response>;
} = {}): FetchLike & { calls: string[] } {
  const calls: string[] = [];
  const fn = (async (url: string) => {
    calls.push(url);
    if (url.startsWith(REMOTIVE_URL)) return remotive();
    const country = /\/jobs\/([a-z]{2})\/search/.exec(url)?.[1] ?? "";
    return adzuna(country);
  }) as FetchLike & { calls: string[] };
  fn.calls = calls;
  return fn;
}

const ok = (n: number, fetchedAt = "2026-10-08T06:00:00Z"): SourceResult => ({
  jobs: Array.from({ length: n }, (_, i) => ({
    id: `old-${i}`,
    title: `Old job ${i}`,
    company: "Old Co",
    location: "Remote",
    postedAt: null,
    url: "https://example.com/job",
    source: "remotive",
  })),
  status: "ok",
  fetchedAt,
  attemptedAt: fetchedAt,
});

/* ---------- keywords ---------- */

describe("job keywords", () => {
  it("defines keywords for every field", () => {
    for (const slug of FIELD_SLUGS) {
      const k = JOB_KEYWORDS[slug];
      expect(k.keywords.length).toBeGreaterThanOrEqual(3);
      expect(k.adzunaQuery.trim()).not.toBe("");
      expect(k.bdjobsQuery.trim()).not.toBe("");
    }
  });

  it("builds an encoded Bdjobs search link", () => {
    expect(bdjobsSearchUrl("ui-ux-design")).toBe("https://bdjobs.com/h/jobs?txtsearch=UI%20UX%20designer");
  });
});

describe("buildKeywordMatcher", () => {
  it("matches whole words case-insensitively", () => {
    const m = buildKeywordMatcher(["ROS", "machine learning"]);
    expect(m("Senior ROS Developer")).toBe(true);
    expect(m("Machine   Learning Engineer")).toBe(true);
    expect(m("Work across teams")).toBe(false);
  });

  it("treats punctuation in phrases literally", () => {
    const m = buildKeywordMatcher(["UI/UX", "Next.js", "C++"]);
    expect(m("UI/UX Designer")).toBe(true);
    expect(m("Next.js engineer")).toBe(true);
    expect(m("Nextxjs")).toBe(false);
  });

  it("never matches with an empty keyword list", () => {
    expect(buildKeywordMatcher([])("anything")).toBe(false);
  });
});

/* ---------- Remotive ---------- */

describe("Remotive", () => {
  it("normalises jobs and treats timezone-less dates as UTC", () => {
    const job = normalizeRemotiveJob(remotiveJob(7, "  Data Engineer  "));
    expect(job).toMatchObject({ id: "remotive-7", title: "Data Engineer", source: "remotive", location: "Worldwide" });
    expect(job?.postedAt).toBe("2026-10-08T10:00:00.000Z");
  });

  it("drops jobs without a safe https link", () => {
    expect(normalizeRemotiveJob(remotiveJob(1, "X", { url: "javascript:alert(1)" }))).toBeNull();
    expect(normalizeRemotiveJob({ id: 1, title: "X" })).toBeNull();
  });

  it("fetches and parses the feed", async () => {
    const feed = await fetchRemotiveFeed(mockFetch());
    expect(feed).toHaveLength(4);
  });

  it("turns HTTP errors, network errors and bad payloads into JobFetchError", async () => {
    await expect(fetchRemotiveFeed(mockFetch({ remotive: () => json({}, 503) }))).rejects.toThrow("Remotive: HTTP 503");
    await expect(
      fetchRemotiveFeed(async () => {
        throw new TypeError("fetch failed");
      }),
    ).rejects.toThrow("Remotive: network error");
    await expect(
      fetchRemotiveFeed(mockFetch({ remotive: () => new Response("<html>oops</html>", { status: 200 }) })),
    ).rejects.toThrow("invalid JSON");
    await expect(fetchRemotiveFeed(mockFetch({ remotive: () => json({ jobs: "nope" }) }))).rejects.toBeInstanceOf(
      JobFetchError,
    );
  });

  it("matches fields by job title only, newest first", async () => {
    const feed = await fetchRemotiveFeed(mockFetch());
    const ai = remotiveJobsForField(feed, JOB_KEYWORDS["ai-agents"].keywords);
    expect(ai.map((j) => j.title)).toEqual(["Senior AI Engineer"]);
    // The writer's "LLM" tag and the data scientist's "solidity" tag must not count.
    expect(remotiveJobsForField(feed, JOB_KEYWORDS["blockchain-web3"].keywords)).toEqual([]);
    expect(remotiveJobsForField(feed, JOB_KEYWORDS["full-stack-web"].keywords)[0].title).toBe(
      "Frontend Developer (React)",
    );
    expect(Object.keys(ai[0])).not.toContain("tags");
  });

  it("respects the limit", async () => {
    const feed = await fetchRemotiveFeed(
      mockFetch({
        remotive: () => json({ jobs: Array.from({ length: 30 }, (_, i) => remotiveJob(i + 1, "React Developer")) }),
      }),
    );
    expect(remotiveJobsForField(feed, ["React"], 5)).toHaveLength(5);
  });
});

/* ---------- Adzuna ---------- */

describe("Adzuna", () => {
  const credentials = { appId: "test-id", appKey: "secret-key-123" };

  it("reads credentials and ignores missing or placeholder values", () => {
    expect(adzunaCredentialsFromEnv(CREDS_ENV)).toEqual(credentials);
    expect(adzunaCredentialsFromEnv({ ADZUNA_APP_ID: "x" })).toBeNull();
    expect(
      adzunaCredentialsFromEnv({ ADZUNA_APP_ID: "your-adzuna-app-id", ADZUNA_APP_KEY: "your-adzuna-app-key" }),
    ).toBeNull();
  });

  it("parses countries, dropping unsupported codes and defaulting to gb,us", () => {
    expect(adzunaCountriesFromEnv("US, in ,xx,us")).toEqual(["us", "in"]);
    expect(adzunaCountriesFromEnv(undefined)).toEqual(["gb", "us"]);
    expect(adzunaCountriesFromEnv("bd")).toEqual(["gb", "us"]);
  });

  it("builds a title search sorted by date", () => {
    const url = new URL(buildAdzunaUrl({ country: "gb", query: "data engineer", credentials }));
    expect(url.pathname).toBe("/v1/api/jobs/gb/search/1");
    expect(url.searchParams.get("title_only")).toBe("data engineer");
    expect(url.searchParams.get("sort_by")).toBe("date");
    expect(url.searchParams.get("max_days_old")).toBe("30");
  });

  it("strips highlight markup and keeps the redirect link", () => {
    const job = normalizeAdzunaJob(
      { ...adzunaJob(1, "<strong>Data</strong> Engineer &amp; Analyst"), company: { display_name: "<b>Globex</b>" } },
      "gb",
    );
    expect(job).toMatchObject({ id: "adzuna-gb-1", title: "Data Engineer & Analyst", company: "Globex" });
    expect(job?.url).toMatch(/^https:\/\/www\.adzuna/);
  });

  it("never leaks the API key in error messages", async () => {
    const failing = mockFetch({ adzuna: () => json({ error: "bad key" }, 401) });
    const err = await fetchAdzunaJobs({ country: "gb", query: "x", credentials, fetchImpl: failing }).catch((e) => e);
    expect(err).toBeInstanceOf(JobFetchError);
    expect(err.message).toBe("Adzuna (GB): HTTP 401");
    expect(err.message).not.toContain("secret-key-123");
  });
});

/* ---------- merge (last good results) ---------- */

describe("mergeSourceResult", () => {
  const failed: SourceResult = {
    jobs: [],
    status: "error",
    fetchedAt: null,
    attemptedAt: "2026-10-09T06:00:00Z",
    error: "Remotive: HTTP 500",
  };

  it("uses fresh results when the fetch succeeded", () => {
    const fresh = ok(1, "2026-10-09T06:00:00Z");
    expect(mergeSourceResult(ok(3), fresh)).toBe(fresh);
  });

  it("keeps the last good jobs and marks them stale when the fetch failed", () => {
    expect(mergeSourceResult(ok(3), failed)).toEqual({
      jobs: ok(3).jobs,
      status: "stale",
      fetchedAt: "2026-10-08T06:00:00Z",
      attemptedAt: "2026-10-09T06:00:00Z",
      error: "Remotive: HTTP 500",
    });
  });

  it("stays stale across repeated failures, keeping the original fetch time", () => {
    const once = mergeSourceResult(ok(2), failed);
    const twice = mergeSourceResult(once, { ...failed, attemptedAt: "2026-10-10T06:00:00Z" });
    expect(twice).toMatchObject({
      status: "stale",
      fetchedAt: "2026-10-08T06:00:00Z",
      attemptedAt: "2026-10-10T06:00:00Z",
    });
    expect(twice.jobs).toHaveLength(2);
  });

  it("reports an error when there is no earlier good data", () => {
    expect(mergeSourceResult(undefined, failed)).toBe(failed);
  });

  it("does not keep old jobs once credentials are removed", () => {
    const notConfigured: SourceResult = { jobs: [], status: "not-configured", fetchedAt: null, attemptedAt: "x" };
    expect(mergeSourceResult(ok(3), notConfigured)).toBe(notConfigured);
  });
});

/* ---------- full refresh ---------- */

describe("refreshAllJobs", () => {
  const slugs = ["ai-agents", "robotics"] as const;

  it("writes a snapshot using one Remotive request and marks Adzuna not configured without keys", async () => {
    const store = createMemoryStore();
    const fetchImpl = mockFetch();
    const { snapshot, summary } = await refreshAllJobs({ store, slugs: [...slugs], fetchImpl, env: {}, now: NOW });

    expect(fetchImpl.calls.filter((u) => u.startsWith(REMOTIVE_URL))).toHaveLength(1);
    expect(store.current).toEqual(snapshot);
    expect(snapshot.updatedAt).toBe("2026-10-09T06:00:00.000Z");
    expect(snapshot.fields["ai-agents"].remote).toMatchObject({ status: "ok", fetchedAt: "2026-10-09T06:00:00.000Z" });
    expect(snapshot.fields["ai-agents"].remote.jobs).toHaveLength(1);
    expect(snapshot.fields.robotics.remote).toMatchObject({ status: "ok", jobs: [] });
    expect(snapshot.fields["ai-agents"].global.status).toBe("not-configured");
    expect(summary.adzuna).toEqual({ status: "not-configured", requests: 0, failures: 0 });
  });

  it("queries Adzuna once per field per country and merges countries", async () => {
    const fetchImpl = mockFetch();
    const { snapshot, summary } = await refreshAllJobs({
      store: createMemoryStore(),
      slugs: [...slugs],
      fetchImpl,
      env: CREDS_ENV,
      now: NOW,
      adzunaDelayMs: 0,
    });
    expect(summary.adzuna).toEqual({ status: "ok", requests: 4, failures: 0 });
    expect(snapshot.fields["ai-agents"].global.jobs.map((j) => j.title).sort()).toEqual([
      "AI Engineer gb",
      "AI Engineer us",
    ]);
  });

  it("succeeds with partial data when one country fails", async () => {
    const fetchImpl = mockFetch({
      adzuna: (c) => (c === "us" ? json({}, 500) : json({ results: [adzunaJob(1, "Robotics Engineer")] })),
    });
    const { snapshot, summary } = await refreshAllJobs({
      store: createMemoryStore(),
      slugs: ["robotics"],
      fetchImpl,
      env: CREDS_ENV,
      now: NOW,
      adzunaDelayMs: 0,
    });
    expect(summary.adzuna.status).toBe("partial");
    expect(snapshot.fields.robotics.global).toMatchObject({ status: "ok" });
    expect(snapshot.fields.robotics.global.jobs).toHaveLength(1);
  });

  it("keeps the previous good results when every source fails", async () => {
    const previous: JobsSnapshot = {
      version: 1,
      updatedAt: "2026-10-08T06:00:00Z",
      fields: { "ai-agents": { remote: ok(2), global: ok(3) } },
    };
    const store = createMemoryStore(previous);
    const fetchImpl = mockFetch({ remotive: () => json({}, 502), adzuna: () => json({}, 500) });
    const { snapshot, summary } = await refreshAllJobs({
      store,
      slugs: ["ai-agents"],
      fetchImpl,
      env: CREDS_ENV,
      now: NOW,
      adzunaDelayMs: 0,
    });
    const field = snapshot.fields["ai-agents"];
    expect(field.remote).toMatchObject({
      status: "stale",
      fetchedAt: "2026-10-08T06:00:00Z",
      error: "Remotive: HTTP 502",
    });
    expect(field.remote.jobs).toHaveLength(2);
    expect(field.global).toMatchObject({ status: "stale" });
    expect(field.global.jobs).toHaveLength(3);
    expect(summary.remotive.status).toBe("error");
    expect(summary.adzuna.status).toBe("error");
  });

  it("treats an empty Remotive feed as a failure so old jobs are kept", async () => {
    const store = createMemoryStore({
      version: 1,
      updatedAt: "x",
      fields: { "ai-agents": { remote: ok(1), global: ok(0) } },
    });
    const { snapshot } = await refreshAllJobs({
      store,
      slugs: ["ai-agents"],
      fetchImpl: mockFetch({ remotive: () => json({ jobs: [] }) }),
      env: {},
      now: NOW,
    });
    expect(snapshot.fields["ai-agents"].remote).toMatchObject({ status: "stale", error: "Remotive: empty feed" });
  });

  it("still refreshes when the previous snapshot can't be read", async () => {
    const store = createMemoryStore();
    store.read = async () => {
      throw new Error("redis down");
    };
    const { snapshot } = await refreshAllJobs({
      store,
      slugs: ["ai-agents"],
      fetchImpl: mockFetch(),
      env: {},
      now: NOW,
    });
    expect(snapshot.fields["ai-agents"].remote.status).toBe("ok");
  });

  it("rejects without touching the stored snapshot when the write fails", async () => {
    const previous: JobsSnapshot = { version: 1, updatedAt: "old", fields: {} };
    const store = createMemoryStore(previous);
    store.write = async () => {
      throw new Error("write failed");
    };
    await expect(
      refreshAllJobs({ store, slugs: ["ai-agents"], fetchImpl: mockFetch(), env: {}, now: NOW }),
    ).rejects.toThrow("write failed");
    expect(store.current).toBe(previous);
  });
});

/* ---------- store ---------- */

describe("snapshot store", () => {
  it("rejects malformed snapshots", () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot("{not json")).toBeNull();
    expect(parseSnapshot({ version: 2, updatedAt: "x", fields: {} })).toBeNull();
    expect(parseSnapshot(JSON.stringify({ version: 1, updatedAt: "x", fields: {} }))).toEqual({
      version: 1,
      updatedAt: "x",
      fields: {},
    });
  });

  it("talks to the Upstash REST API with a bearer token", async () => {
    const saved: string[][] = [];
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const args = JSON.parse(String(init?.body)) as string[];
      saved.push(args);
      expect((init?.headers as Record<string, string>).authorization).toBe("Bearer tok");
      return json({ result: args[0] === "GET" ? JSON.stringify({ version: 1, updatedAt: "t", fields: {} }) : "OK" });
    });
    const store = createRedisStore({ url: "https://example.upstash.io/", token: "tok", fetchImpl });
    await store.write({ version: 1, updatedAt: "t", fields: {} });
    expect(await store.read()).toMatchObject({ updatedAt: "t" });
    expect(saved[0][0]).toBe("SET");
    expect(saved[1]).toEqual(["GET", "careerpulse:live-jobs:v1"]);
    expect(fetchImpl.mock.calls[0][0]).toBe("https://example.upstash.io");
  });

  it("surfaces Redis errors", async () => {
    const store = createRedisStore({
      url: "https://x",
      token: "t",
      fetchImpl: async () => json({ error: "WRONGPASS" }),
    });
    await expect(store.read()).rejects.toThrow("WRONGPASS");
  });
});

/* ---------- cron auth & formatting ---------- */

describe("isAuthorizedCronRequest", () => {
  it("requires the exact bearer secret when CRON_SECRET is set", () => {
    const env = { CRON_SECRET: "s3cret-value-1234", NODE_ENV: "production" };
    expect(isAuthorizedCronRequest("Bearer s3cret-value-1234", env)).toBe(true);
    expect(isAuthorizedCronRequest("Bearer wrong", env)).toBe(false);
    expect(isAuthorizedCronRequest(null, env)).toBe(false);
  });

  it("fails closed in production without a secret, open in development", () => {
    expect(isAuthorizedCronRequest(null, { NODE_ENV: "production" })).toBe(false);
    expect(isAuthorizedCronRequest(null, { NODE_ENV: "development" })).toBe(true);
  });
});

describe("job date formatting", () => {
  it("formats in UTC and handles missing dates", () => {
    expect(formatJobDate("2026-10-07T23:30:00Z")).toBe("7 Oct 2026");
    expect(formatJobDate(null)).toBeNull();
    expect(formatJobDate("not a date")).toBeNull();
    expect(formatUpdatedAt("2026-10-09T06:02:00Z")).toBe("9 Oct 2026, 06:02 UTC");
  });
});
