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
  { path: "/privacy", priority: 0.6, changeFrequency: "yearly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/pricing", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];
// /legal/privacy-policy and /legal/terms-of-use go back in here once their
// final text replaces the placeholder (they are noindex until then).

/** Static pages plus every published journal article from Sanity. It
 *  refreshes every minute, the same as the article pages themselves, so a
 *  newly published post is in the sitemap as soon as its page is live, with
 *  no redeploy. Article lastmod is the last edit in Sanity, so updates to an
 *  existing post are signalled too. */
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles().catch(() => []);
  return [
    ...PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${siteUrl}${path}`,
      changeFrequency,
      priority,
    })),
    ...(articles.length
      ? [{ url: `${siteUrl}/journal`, changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    ...articles.map((article) => ({
      url: `${siteUrl}/journal/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
