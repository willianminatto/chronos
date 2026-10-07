import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** One page. Empty until the production origin is configured. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];

  return [{ url: SITE_URL.href, changeFrequency: "yearly", priority: 1 }];
}
