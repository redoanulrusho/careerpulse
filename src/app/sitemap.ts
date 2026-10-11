import type { MetadataRoute } from "next";
import { FIELD_SLUGS } from "@/data/fields/slugs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/compare`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/progress`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    ...FIELD_SLUGS.map((slug) => ({
      url: `${SITE_URL}/fields/${slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
