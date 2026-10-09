import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createMemoryStore } from "@/lib/jobs/store";

const store = createMemoryStore();
const revalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
  cacheTag: () => {},
  cacheLife: () => {},
}));
vi.mock("@/lib/jobs/store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/jobs/store")>()),
  getJobStore: () => store,
}));

const feed = {
  jobs: [
    {
      id: 1,
      url: "https://remotive.com/remote-jobs/x-1",
      title: "Senior AI Engineer",
      company_name: "Acme",
      publication_date: "2026-10-08T00:00:00",
      candidate_required_location: "Worldwide",
    },
  ],
};

describe("GET /api/cron/refresh-jobs", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "test-secret-1234567890");
    vi.stubEnv("ADZUNA_APP_ID", "");
    vi.stubEnv("ADZUNA_APP_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(feed), { status: 200 })),
    );
    store.current = null;
    revalidateTag.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const call = async (authorization?: string) => {
    const { GET } = await import("@/app/api/cron/refresh-jobs/route");
    return GET(
      new NextRequest("http://localhost/api/cron/refresh-jobs", {
        headers: authorization ? { authorization } : {},
      }),
    );
  };

  it("rejects requests without the cron secret", async () => {
    const res = await call();
    expect(res.status).toBe(401);
    expect(store.current).toBeNull();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refreshes all fields, stores the snapshot and revalidates the cache", async () => {
    const res = await call("Bearer test-secret-1234567890");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.remotive).toEqual({ status: "ok", jobsInFeed: 1 });
    expect(body.adzuna.status).toBe("not-configured");
    expect(Object.keys(store.current!.fields)).toHaveLength(20);
    expect(store.current!.fields["ai-agents"].remote.jobs[0].title).toBe("Senior AI Engineer");
    expect(revalidateTag).toHaveBeenCalledWith("live-jobs", "max");
  });

  it("returns 500 and keeps the old snapshot when saving fails", async () => {
    const old = { version: 1 as const, updatedAt: "old", fields: {} };
    store.current = old;
    const originalWrite = store.write;
    store.write = async () => {
      throw new Error("disk full");
    };
    const res = await call("Bearer test-secret-1234567890");
    store.write = originalWrite;
    expect(res.status).toBe(500);
    expect(store.current).toBe(old);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
