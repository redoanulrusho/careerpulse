import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Env, FetchLike, JobsSnapshot } from "./types";

/*
 * Where the daily snapshot lives. Visitors only ever read from here, so they
 * never wait on the job APIs.
 *
 * - Redis (Upstash REST API): used in production. Works with the env vars the
 *   Vercel Upstash/KV integration injects (KV_REST_API_URL / KV_REST_API_TOKEN)
 *   or Upstash's own names (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
 * - File (.data/live-jobs.json): local development fallback. Serverless hosts
 *   have read-only file systems, so configure Redis before deploying.
 */

export const SNAPSHOT_KEY = "careerpulse:live-jobs:v1";

export interface JobStore {
  kind: "redis" | "file" | "memory";
  read(): Promise<JobsSnapshot | null>;
  write(snapshot: JobsSnapshot): Promise<void>;
}

/** Accepts only snapshots with the expected top-level shape; anything else counts as empty. */
export function parseSnapshot(raw: unknown): JobsSnapshot | null {
  const value = typeof raw === "string" ? safeJsonParse(raw) : raw;
  if (!value || typeof value !== "object") return null;
  const snap = value as Partial<JobsSnapshot>;
  if (snap.version !== 1 || typeof snap.updatedAt !== "string" || !snap.fields || typeof snap.fields !== "object") {
    return null;
  }
  return snap as JobsSnapshot;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function createRedisStore({
  url,
  token,
  fetchImpl = fetch,
  key = SNAPSHOT_KEY,
}: {
  url: string;
  token: string;
  fetchImpl?: FetchLike;
  key?: string;
}): JobStore {
  async function command(args: string[]): Promise<unknown> {
    const res = await fetchImpl(url.replace(/\/+$/, ""), {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Redis ${args[0]} failed: HTTP ${res.status}`);
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) throw new Error(`Redis ${args[0]} failed: ${data.error}`);
    return data.result;
  }
  return {
    kind: "redis",
    async read() {
      return parseSnapshot(await command(["GET", key]));
    },
    async write(snapshot) {
      await command(["SET", key, JSON.stringify(snapshot)]);
    },
  };
}

export function createFileStore(filePath = path.join(process.cwd(), ".data", "live-jobs.json")): JobStore {
  return {
    kind: "file",
    async read() {
      try {
        return parseSnapshot(await readFile(/*turbopackIgnore: true*/ filePath, "utf8"));
      } catch {
        return null;
      }
    },
    async write(snapshot) {
      await mkdir(/*turbopackIgnore: true*/ path.dirname(filePath), { recursive: true });
      await writeFile(/*turbopackIgnore: true*/ filePath, JSON.stringify(snapshot, null, 2));
    },
  };
}

export function createMemoryStore(initial: JobsSnapshot | null = null): JobStore & { current: JobsSnapshot | null } {
  const store = {
    kind: "memory" as const,
    current: initial,
    async read() {
      return store.current;
    },
    async write(snapshot: JobsSnapshot) {
      store.current = snapshot;
    },
  };
  return store;
}

/** Picks Redis when its credentials are present, otherwise the local file store. */
export function getJobStore(env: Env = process.env): JobStore {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return createRedisStore({ url, token });
  return createFileStore();
}
