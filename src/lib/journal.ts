import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "@/lib/sanity/client";

export type ArticleCategory =
  | "Focus"
  | "Pressure"
  | "Recovery"
  | "Founder Viewpoints"
  | "Pilot Stories";

export type ArticleSeo = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};

export type Article = {
  slug: string;
  title: string;
  standfirst: string;
  category: ArticleCategory;
  author: string;
  publishedAt: string;
  body: string[];
  image: SanityImageSource;
  featured?: boolean;
  seo?: ArticleSeo;
};

export const CATEGORIES: ArticleCategory[] = [
  "Focus",
  "Pressure",
  "Recovery",
  "Founder Viewpoints",
  "Pilot Stories",
];

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
  const raw = await sanityClient.fetch<RawArticle[]>(
    ALL_ARTICLES_QUERY,
    {},
    { next: { revalidate: 60 } }
  );
  return raw.map((article, i) => toArticle(article, i === 0));
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  // `featured` is not read anywhere on the individual article page (only
  // the journal index uses it to pick the lead story), so this fetch
  // doesn't need the extra round trip getArticles() makes to compute it.
  const raw = await sanityClient.fetch<RawArticle | null>(
    ARTICLE_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  );
  if (!raw) return undefined;
  return toArticle(raw, false);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(ALL_SLUGS_QUERY, {}, {
    next: { revalidate: 60 },
  });
}
