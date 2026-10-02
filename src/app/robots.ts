import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/nav";

/** Crawlers are kept out of the Sanity studio and the form and preview
 *  endpoints; everything else is open. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
