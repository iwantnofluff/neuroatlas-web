import { sanityClient } from "@/lib/sanity/client";
import { sanityFetch } from "@/lib/sanity/fetch";
import type { Article } from "@/lib/journal-types";

export type { ArticleCategory, ArticleSeo, Article } from "@/lib/journal-types";
export { CATEGORIES } from "@/lib/journal-types";

const ARTICLE_PROJECTION = /* groq */ `{
  "slug": slug.current,
  title,
  "standfirst": excerpt,
  category,
  "author": author->name,
  publishedAt,
  "body": body[_type == "block"]{"text": pt::text(@)}.text,
  "image": mainImage,
  seo{
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  }
}`;

const ALL_ARTICLES_QUERY = /* groq */ `
  *[_type == "article" && defined(slug.current)] | order(publishedAt desc) ${ARTICLE_PROJECTION}
`;

const ARTICLE_BY_SLUG_QUERY = /* groq */ `
  *[_type == "article" && slug.current == $slug][0] ${ARTICLE_PROJECTION}
`;

const ALL_SLUGS_QUERY = /* groq */ `
  *[_type == "article" && defined(slug.current)].slug.current
`;

type RawArticle = Omit<Article, "author" | "seo" | "featured"> & {
  author: string | null;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
  } | null;
};

function toArticle(raw: RawArticle, featured: boolean): Article {
  return {
    slug: raw.slug,
    title: raw.title,
    standfirst: raw.standfirst,
    category: raw.category,
    author: raw.author ?? "NeuroAtlas",
    publishedAt: raw.publishedAt,
    body: raw.body ?? [],
    image: raw.image,
    featured,
    seo: raw.seo
      ? {
          metaTitle: raw.seo.metaTitle ?? undefined,
          metaDescription: raw.seo.metaDescription ?? undefined,
          ogImage: raw.seo.ogImage ?? undefined,
        }
      : undefined,
  };
}

export async function getArticles(): Promise<Article[]> {
  const raw = await sanityFetch<RawArticle[]>(ALL_ARTICLES_QUERY);
  return raw.map((article, i) => toArticle(article, i === 0));
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  // `featured` is not read anywhere on the individual article page (only
  // the journal index uses it to pick the lead story), so this fetch
  // doesn't need the extra round trip getArticles() makes to compute it.
  const raw = await sanityFetch<RawArticle | null>(ARTICLE_BY_SLUG_QUERY, {
    slug,
  });
  if (!raw) return undefined;
  return toArticle(raw, false);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(ALL_SLUGS_QUERY, {}, {
    next: { revalidate: 60 },
  });
}
