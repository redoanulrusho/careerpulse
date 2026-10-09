import { timingSafeEqual } from "node:crypto";

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 * In production a missing CRON_SECRET rejects every request (fail closed);
 * in development the route is open so you can trigger a refresh locally.
 */
export function isAuthorizedCronRequest(
  authorization: string | null,
  env: { CRON_SECRET?: string; NODE_ENV?: string } = process.env,
): boolean {
  const secret = env.CRON_SECRET?.trim();
  if (!secret) return env.NODE_ENV !== "production";
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
