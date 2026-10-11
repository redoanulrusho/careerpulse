import type { Metadata } from "next";

export const SITE_NAME = "CareerPulse";

/** Production URL. `NEXT_PUBLIC_SITE_URL` overrides it (e.g. for preview deployments). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://careerpulse-beta.vercel.app").replace(/\/$/, "");

/**
 * Per-page title, description, canonical URL and social cards. Next.js replaces
 * (rather than merges) `openGraph` from the layout, so each page sets its own.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}
