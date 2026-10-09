import type { FetchLike } from "./types";

export class JobFetchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "JobFetchError";
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * GETs JSON with a timeout and turns every failure (network, timeout, non-2xx,
 * invalid JSON) into a JobFetchError with a short, secret-free message.
 */
export async function fetchJson(
  url: string,
  {
    fetchImpl = fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    label,
  }: { fetchImpl?: FetchLike; timeoutMs?: number; label: string },
): Promise<unknown> {
  let res: Response;
  try {
    res = await fetchImpl(url, {
      headers: { accept: "application/json", "user-agent": "CareerPulse/1.0" },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (err) {
    const reason = err instanceof Error && err.name === "TimeoutError" ? "timed out" : "network error";
    throw new JobFetchError(`${label}: ${reason}`);
  }
  if (!res.ok) throw new JobFetchError(`${label}: HTTP ${res.status}`, res.status);
  try {
    return await res.json();
  } catch {
    throw new JobFetchError(`${label}: invalid JSON response`);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
