import { cacheLife, cacheTag } from "next/cache";
import { getJobStore } from "./store";
import type { JobsSnapshot } from "./types";

export const LIVE_JOBS_TAG = "live-jobs";

/**
 * The snapshot written by the daily cron job, read through Next's cache.
 * The cron route calls revalidateTag(LIVE_JOBS_TAG) after each refresh; the
 * hourly cache life is a safety net. A failed read shows the empty state
 * instead of breaking the page.
 */
export async function getLiveJobsSnapshot(): Promise<JobsSnapshot | null> {
  "use cache";
  cacheTag(LIVE_JOBS_TAG);
  cacheLife("hours");
  try {
    return await getJobStore().read();
  } catch {
    return null;
  }
}
