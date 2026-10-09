import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { FIELD_SLUGS } from "@/data/fields/slugs";
import { isAuthorizedCronRequest } from "@/lib/jobs/auth";
import { LIVE_JOBS_TAG } from "@/lib/jobs/read";
import { refreshAllJobs } from "@/lib/jobs/refresh";
import { getJobStore } from "@/lib/jobs/store";

/** Adzuna calls are spaced out to respect its rate limit, so allow a few minutes. */
export const maxDuration = 300;

/**
 * Daily refresh (see vercel.json → crons). Fetches jobs for all fields, saves a
 * snapshot to the store, then revalidates the cached snapshot used by pages.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const { summary } = await refreshAllJobs({ store: getJobStore(), slugs: [...FIELD_SLUGS] });
    revalidateTag(LIVE_JOBS_TAG, "max");
    return Response.json(summary);
  } catch (err) {
    // Only reached if the store itself fails; provider errors are recorded per field.
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[refresh-jobs]", message);
    return Response.json({ error: "Refresh failed", detail: message }, { status: 500 });
  }
}
