import type { SanityImageSource } from "@sanity/image-url";

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
