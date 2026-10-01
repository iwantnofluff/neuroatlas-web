import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/nav";
import { getArticles } from "@/lib/journal";

const PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "", priority: 1, changeFrequency: "monthly" },
  { path: "/band", priority: 0.9, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" },
  { path: "/inside-the-app", priority: 0.9, changeFrequency: "monthly" },
  { path: "/the-science", priority: 0.8, changeFrequency: "monthly" },
  { path: "/for-organisations", priority: 0.8, changeFrequency: "monthly" },
  { path: "/waitlist", priority: 0.9, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.8, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.6, changeFrequency: "yearly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/pricing", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/terms-of-use", priority: 0.3, changeFrequency: "yearly" },
];

/** Static pages plus every published journal article from Sanity,
 *  refreshed hourly so new posts reach Google without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles().catch(() => []);
  return [
    ...PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${siteUrl}${path}`,
      changeFrequency,
      priority,
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/journal/${article.slug}`,
      lastModified: article.publishedAt ? new Date(article.publishedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
