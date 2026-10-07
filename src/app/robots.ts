import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Listed only once the production origin is configured.
    ...(SITE_URL && { sitemap: new URL("/sitemap.xml", SITE_URL).href }),
  };
}
